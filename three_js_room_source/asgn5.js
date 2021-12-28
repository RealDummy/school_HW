import * as THREE from 'https://cdn.skypack.dev/three@v0.128.0';
import {GLTFLoader} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/loaders/GLTFLoader.js';
import {PointerLockControls} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/controls/PointerLockControls.js'

//filter stuff
import {EffectComposer} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/postprocessing/RenderPass.js'
import {UnrealBloomPass} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js'
import {SMAAPass} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/postprocessing/SMAAPass.js'
import {ShaderPass} from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/postprocessing/ShaderPass.js'




let scene, camera, renderer, bloomRenderer, bloomComposer, finalComposer, controls;
let materials = {};
let darkMaterial;


//-------------------BEGIN PERLIN NOISE GARBAGE------------------
const permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 
    103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 
    26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 
    87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 
    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 
    187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 
    198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 
    170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 
    172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 
    104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 
    241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 
    157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 
    93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

let p = [];
for(let i = 0; i < 512; i++){
    p.push(permutation[i%256]);
}
function interpolate(a0,a1,w){
    //return (a1 - a0) * (3 - (2 * w)) * w * w + a0;
    return (a1-a0)*w + a0; 
}
function fade(v){
    return v*v*v*(v*(v * 6 - 15) + 10);
}
 
class perlin2D{
    constructor(repeat = 0, stepSize = 0, smoothing = fade, interp = interpolate){
        this.repeat = repeat;
        this.stepSize = stepSize;
        this.smoothing = smoothing;
        this.interp = interp;
        this.cached = false;
        if(repeat > 0 && this.stepSize > 0){
            this.cached = this.saveNoise();
        }
    }

    saveNoise(){
        if(this.repeat > 0 && this.stepSize > 0){
            this.cachedNoise = [];
            this.max = -Infinity;
            this.min = Infinity;
            for(let y = 0; y < this.repeat; y += this.stepSize){
                let temp = [];
                for(let x = 0; x < this.repeat; x += this.stepSize){
                    let v = this.perlinNoise(x,y);
                    if(v>this.max){this.max = v;}
                    if(v<this.min){this.min = v;}
                    temp.push(v);
                }
                this.cachedNoise.push(temp);
            }
            return true;
        }
        return false;
    }
    val(x,y){
        if(this.cached === true){
            let xr = (x%this.stepSize);
            let yr = (y%this.stepSize);
            let xi = Math.floor(((x-xr)%this.repeat)/this.stepSize);
            let yi = Math.floor(((y-yr)%this.repeat)/this.stepSize);

            return this.cachedNoise[yi][xi];           
        }
        else{
            return this.perlinNoise(x,y);
        }
    }
    inc(v){
        v += 1;
        if(v > 0  && this.repeat > 0) v %= this.repeat;
        return v % 256;
    }
    grad(hash,x,y){
        switch(hash & 0x3){
            case 0x0: return  x + y;
            case 0x1: return -x + y;
            case 0x2: return  x - y;
            case 0x3: return -x - y;
            default: return 0; //should not happen...
        }
    }
    perlinNoise(x,y){
        if(this.repeat > 0){
            x = x % this.repeat;
            y = y % this.repeat;
        }
        let xi = Math.floor(x) & 255;
        let yi = Math.floor(y) & 255;
        let xf = x - Math.floor(x);
        let yf = y - Math.floor(y);
        let u = this.smoothing(xf);
        let v = this.smoothing(yf);
        let aa,ab,ba,bb;
        aa = p[p[xi]+yi];
        ab = p[p[xi]+this.inc(yi)];
        ba = p[p[this.inc(xi)]+yi];
        bb = p[p[this.inc(xi)]+this.inc(yi)];
        let x1,x2;
        x1 = this.interp(this.grad(aa,xf,yf),this.grad(ba,xf-1,yf),u);
        x2 = this.interp(this.grad(ab,xf,yf - 1),this.grad(bb,xf-1,yf-1),u);
        return this.interp(x1,x2,v);

    }
}

//-----------END PERLIN NOISE GARBAGE---------------

//function to be used in traverse to select only the fire particles
function darken(obj){
    if(obj.material){

        materials[obj.uuid] = obj.material;

        if(obj.name !== 'fire'){
            obj.material = darkMaterial;
        }
    }
}

//function to give the fire back its material
function restore(obj){
    let mat = materials[obj.uuid];
    if(!mat){return;}
    obj.material = mat;
    delete materials[obj.uuid];
}

function renderBloom(){
    scene.traverse(darken);
    bloomComposer.render();
    scene.traverse(restore);
}

function init(){

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.querySelector("body").appendChild( renderer.domElement );
    
    
    //bloomRenderer = new THREE.WebGLRenderer();
    //bloomRenderer.setPixelRatio(window.devicePixelRatio);
    //bloomRenderer.setSize( window.innerWidth, window.innerHeight );
    //document.querySelector("body").appendChild( bloomRenderer.domElement );
    
    darkMaterial = new THREE.MeshStandardMaterial( {color:0x000000, emissive: 0x000000} );

    //renders the scene to a quad basically
    const renderScene = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2, //bloom intensity
        0.2, //bloom radius
        0.2, //bloom threshold
    );
    bloom.needsSwap = true;
    
    //some anti-aliasing done in post proccesing land, as renderer based aa doesn't work!
    const SMAA = new SMAAPass(window.innerWidth, window.innerHeight);
    
    //renders just the fire bloom to a texture
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false; //false

    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloom);
    // a shader that combines the finalComposer and bloomComposer textures
    console.log(bloomComposer);
    
    const finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader: `varying vec2 vUv; void main() {vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);}`,
            fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; 
            void main(){gl_FragColor = (texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv)); }`,
            defines: {}
        }), "baseTexture"
    );
    finalPass.needsSwap = true; //not sure what this does buts its in the THREE examples so we keep it
    console.log(bloomComposer.renderTarget2.texture);
    
    finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    //bloom for the really bright things (dont want to selectevly darken eveything again to single out lights, so the cutoff is very high)
    finalComposer.addPass(new UnrealBloomPass( new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.5, 0.94 ));
    finalComposer.addPass(finalPass);
    finalComposer.addPass(SMAA);
    console.log(finalComposer);

}

function onResize(){
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w , h);
    renderer.setPixelRatio(window.devicePixelRatio);


    bloomComposer.setSize(w,h);
    finalComposer.setSize(w,h);

}

function main(){
    
    init();
    
    window.addEventListener("resize",onResize,false);
    const positions = { //these took a while to find...(and are approximate)
        camera: [3.8,3,-2.6],
        cameraLookAt: [2,1.5,0],
        fire: [-1,.3,-0.4],
        light: [1.3,3,-4],
        window: [-1.5,4.5,4],
        sunDir: [-9,5,6],
    }
    const loader = new GLTFLoader();
    let light;
    loader.load("fireplace.glb",(glb)=>{
        console.log(glb.scene);
        //window is blue
        glb.scene.children[0].children[0].material = new THREE.MeshStandardMaterial({color: 0x07e0f0, emissive: 0xd0d0d0  });

        //floor texture
        const floorimage = new THREE.TextureLoader().load('floor.jpg');
        floorimage.wrapS = THREE.RepeatWrapping;
        floorimage.wrapT = THREE.RepeatWrapping;
        floorimage.repeat.set( 4, 4 );
        const floorNormal = new THREE.TextureLoader().load('floor_normal.jpg');
        floorNormal.wrapS = THREE.RepeatWrapping;
        floorNormal.wrapT = THREE.RepeatWrapping;
        floorNormal.repeat.set( 4, 4 );
        glb.scene.children[1].children[1].material = new THREE.MeshStandardMaterial({map: floorimage, normalMap: floorNormal});


        //wall casts shadow
        glb.scene.children[0].children[1].castShadow = true;

        //fireplace cast shadow
        glb.scene.children[5].children[0].castShadow = true;
        glb.scene.children[5].children[1].castShadow = true;

        //chairs cast shadow
        glb.scene.children[8].castShadow = true;
        glb.scene.children[8].receiveShadow = true;

        glb.scene.children[9].children[0].castShadow = true;
        glb.scene.children[9].children[1].castShadow = true;

        glb.scene.children[10].castShadow = true;
        glb.scene.children[10].receiveShadow = true;        

        glb.scene.children[11].children[0].castShadow = true;
        glb.scene.children[11].children[1].castShadow = true;

        //bookshelf casts shadow
        glb.scene.children[12].castShadow = true;
        glb.scene.children[13].castShadow = true;
        glb.scene.children[14].castShadow = true;
        //bookshelf gets shadow
        glb.scene.children[12].receiveShadow = true;
        glb.scene.children[13].receiveShadow = true;
        glb.scene.children[14].receiveShadow = true;

        //light looks bright
        glb.scene.children[16].children[0].material.emissive = new THREE.Color(0xafafaf);
        light = glb.scene.children[16].children[0];

        //walls receive shadow
        glb.scene.children[1].children[1].receiveShadow = true;
        for(let i = 2; i <= 4; ++i){
            glb.scene.children[i].receiveShadow = true;
        }

        //books cast shadow
        glb.scene.children[15].children[1].castShadow = true;
        glb.scene.children[15].children[2].castShadow = true;
        glb.scene.children[15].children[3].castShadow = true;
        glb.scene.children[15].children[4].castShadow = true;
        glb.scene.children[15].children[5].castShadow = true;
        glb.scene.children[15].children[6].castShadow = true;
        //books get shadow
        glb.scene.children[15].children[1].receiveShadow = true;
        glb.scene.children[15].children[2].receiveShadow = true;
        glb.scene.children[15].children[3].receiveShadow = true;
        glb.scene.children[15].children[4].receiveShadow = true;
        glb.scene.children[15].children[5].receiveShadow = true;
        glb.scene.children[15].children[6].receiveShadow = true;

        //floor thingy shadow
        glb.scene.children[17].receiveShadow = true;
        glb.scene.children[17].castShadow = true;


        scene.add(glb.scene);
    })

    camera.position.set(...positions.camera);
    camera.lookAt(...positions.cameraLookAt);

    //no clue what this does, audio related
    const listener = new THREE.AudioListener();
    camera.add(listener);

    //creates a sound object
    const sound = new THREE.PositionalAudio( listener );

    //loads sound object
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'fire.ogg' , (buffer)=>{
        sound.setBuffer(buffer);
        sound.setRefDistance(20);
        sound.setLoop(true);
    });


    //look controls
    controls = new PointerLockControls(camera, renderer.domElement);
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI * 3 / 4;


    
    


    controls.connect();

    window.addEventListener("click", (e)=>{controls.lock(); sound.play()});
    
    let fire = [];
    let firePos = [];
    let nParticles = 40;
    const geo = new THREE.ConeGeometry(0.2,0.3,6);
    
    for(let i = 0; i < nParticles; ++i){
        const mat = new THREE.MeshStandardMaterial({color: 0x000000, emissive: 0xff0000});
        fire.push(new THREE.Mesh(geo,mat));
        fire[i].name = 'fire';
        fire[i].position.x = 2;
        firePos[i] = Math.random() * 3;
        scene.add(fire[i]);
    }
    //the light from the fire
    const firelight = new THREE.PointLight(0xff7f00,3,0,2);
    firelight.castShadow = true;
    firelight.shadow.mapSize.width = 512;
    firelight.shadow.mapSize.height = 512;
    firelight.shadow.bias = -0.0001;
    firelight.shadow.radius = 4;
    firelight.position.set(...positions.fire);
    scene.add(firelight);

    //the light from the lamp
    const lamp = new THREE.PointLight(
        0xffffff, //color
        0.6, //intensity
        0, //maxRange
        2 //dropoff
    );
    lamp.castShadow = true;
    lamp.shadow.mapSize.width = 1024;
    lamp.shadow.mapSize.height = 1024;
    lamp.shadow.bias = -0.0001;
    lamp.shadow.radius = 3;
    lamp.position.set(...positions.light);
    scene.add(lamp);

    //cmon
    const ambientLight = new THREE.AmbientLight(0xfff0f0,0.2);
    scene.add(ambientLight)

    const noise = new perlin2D(2,1/500);


    let t = Date.now();

    document.addEventListener('keydown',(e)=>{
        const key = e.key;
        console.log(e);
        if(key === ' ' && e.repeat === false){
            if(lamp.intensity){ 
                lamp.intensity = 0;
                light.material.emissive = new THREE.Color(0x000000);
            }
            else{
                lamp.intensity = 0.7;
                light.material.emissive = new THREE.Color(0xafafaf);
            }
            
        }
    })

    function draw(){

        requestAnimationFrame(draw);

        let t2 = Date.now();
        let totalIntensity = 0;
        let ty = 0;
        let tx = 0;
        let tz = 0;
        for(let i = 0; i < nParticles; ++i){
            let n = (noise.perlinNoise((t2+171*i)/250,(t2+171*i)/250)+1)/2;
            totalIntensity += Math.sqrt(n);
            let c = (0xff0000 + (Math.floor((1-n) * 255) << 8)) + Math.floor(Math.pow(1-n,10)*255); // fire like color range
            fire[i].material.setValues({emissive: c });
            fire[i].position.y = n*n*n * 1.5 + positions.fire[1]; //n**3 means more fire at the bottom
            let rand = ((noise.perlinNoise(firePos[i], firePos[i])+1)/2) * Math.PI * 2; //noise based number
            fire[i].position.x = Math.cos(rand)*(Math.min(n*n*n+0.1,0.5)) + positions.fire[0]; //fire should be larger at the top
            fire[i].position.z = Math.sin(rand)*(Math.min(n*n*n+0.1,0.5)) + positions.fire[2]; // ^^^^^
            firePos[i] += 9/250; //speed which the fire moves around on the xz plane
            if(firePos[i] > 500){
                firePos[i] -= 500;
            }
            //update average fire position totals
            tx += fire[i].position.x; 
            ty += fire[i].position.y;
            tz += fire[i].position.z;

        }

        firelight.intensity = totalIntensity/nParticles;
       
        firelight.position.set(tx/nParticles, ty/nParticles, tz/nParticles);

        renderBloom();
        finalComposer.render((Date.now()-t2)*0.0001);

        t = Date.now();

    }
    draw();
}

main();