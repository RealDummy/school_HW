
let edgeCount;
let bChangedCount = false;
let shading = "smooth";
const MAX_DL = 5;
const MAX_PL = 5;

//pass in vertex array, triangle array, and normal array(optional)
//if no normal array, calculates normals based on vertex and triangle data
//assumes that defferent faces have different vertices, even if the point is the same

class ObjectData{
    constructor(vertices, triangles, sVertices, sTriangles, normals){
        this.cylinderLength = triangles.length;
        
        for(let i = 0; i < sTriangles.length; ++i){
            sTriangles[i] += vertices.length / 3;
            console.log(sTriangles[i]);
        }
        vertices.push(...sVertices);
        triangles.push(...sTriangles);
        this.verts = new Float32Array(vertices);
        this.tris = new Int16Array(triangles);
        if(normals){
            this.norms = new Float32Array(normals);
        }
        else{
            this.norms = new Float32Array(vertices.length + sVertices.length);
        }
    }
    calcNormals(){
        for(let i = 0; i < this.cylinderLength; i+=3){
            let ax, ay, az,  bx, by, bz,  cx, cy, cz;
            let v = this.verts;
            let t = this.tris;
            let p1 = t[i] * 3;
            ax = v[p1];
            ay = v[p1+1];
            az = v[p1+2];

            let p2 = t[i+1] * 3;
            bx = v[p2];
            by = v[p2+1];
            bz = v[p2+2];

            let p3 = t[i+2] * 3;
            cx = v[p3];
            cy = v[p3+1];
            cz = v[p3+2];

            let v1 = new Vector3([bx-ax,by-ay,bz-az]);
            let v2 = new Vector3([cx-ax,cy-ay,cz-az]);

            let n = Vector3.cross(v1,v2);
            n.normalize();

            this.norms[p1] = n.elements[0];
            this.norms[p1 + 1] = n.elements[1];
            this.norms[p1 + 2] = n.elements[2];

            this.norms[p2] = n.elements[0];
            this.norms[p2 + 1] = n.elements[1];
            this.norms[p2 + 2] = n.elements[2];

            this.norms[p3] = n.elements[0];
            this.norms[p3 + 1] = n.elements[1];
            this.norms[p3 + 2] = n.elements[2];
            
            

        }
    }
    calcNormalsSmooth(){
        let i;
        for(i = 0; i < this.cylinderLength; i+=3){
            let ax, ay, az,  bx, by, bz,  cx, cy, cz;
            let v = this.verts;
            let t = this.tris;
            let p1 = t[i] * 3;
            ax = v[p1];
            ay = v[p1+1];
            az = v[p1+2];

            let p2 = t[i+1] * 3;
            bx = v[p2];
            by = v[p2+1];
            bz = v[p2+2];

            let p3 = t[i+2] * 3;
            cx = v[p3];
            cy = v[p3+1];
            cz = v[p3+2];

            let v1 = new Vector3([bx-ax,by-ay,bz-az]);
            let v2 = new Vector3([cx-ax,cy-ay,cz-az]);

            let n = Vector3.cross(v1,v2);
            n.normalize();
            if(n.elements[2] === 0){
                this.norms[p1] = ax;
                this.norms[p1 + 1] = ay;
                this.norms[p1 + 2] = 0
                this.norms[p2] = bx
                this.norms[p2 + 1] = by;
                this.norms[p2 + 2] = 0
                this.norms[p3] = cx;
                this.norms[p3 + 1] = cy;
                this.norms[p3 + 2] = 0;
            }
            else{
                
                this.norms[p1] =   n.elements[0];
                this.norms[p1 + 1] = n.elements[1];
                this.norms[p1 + 2] = n.elements[2];
    
                this.norms[p2] =   n.elements[0];
                this.norms[p2 + 1] = n.elements[1];
                this.norms[p2 + 2] = n.elements[2];
    
                this.norms[p3] =  n.elements[0];
                this.norms[p3 + 1] = n.elements[1];
                this.norms[p3 + 2] = n.elements[2];
            }

           
            
            

        }
        for(i; i < this.tris.length; i+= 3){
                let p1 = this.tris[i] * 3;
                let p2 = this.tris[i+1] * 3;
                let p3 = this.tris[i+2] * 3;
                this.norms[p1] =     -this.verts[p1];
                this.norms[p1 + 1] = -this.verts[p1 + 1];
                this.norms[p1 + 2] = -this.verts[p1 + 2];
    
                this.norms[p2] =     -this.verts[p2];
                this.norms[p2 + 1] = -this.verts[p2 + 1];
                this.norms[p2 + 2] = -this.verts[p2 + 2];
    
                this.norms[p3] =    -this.verts[p3];
                this.norms[p3 + 1] =-this.verts[p3 + 1];
                this.norms[p3 + 2] =-this.verts[p3 + 2];
        }
    }
    

}

//takes in gl context, shader program, base cylinder data(reference), a transform matrix,
// and a color array [r, g, b, a] where r,g,b,a are normalized to [0,1]
class Cylinder{
    constructor(gl,program, objectData,transformMatrix, vColor, fShiny){
        this.data = objectData;
        this.transform = transformMatrix;
        this.transformInverse = new Matrix4();
        this.transformInverse.setInverseOf(this.transform);
        this.color = vColor;
        this.u_color = gl.getUniformLocation(program,"u_color");
        this.u_transform = gl.getUniformLocation(program,"u_transform");
        this.u_transformInverse = gl.getUniformLocation(program, "u_transformInverse");
        this.u_shiny = gl.getUniformLocation(program,"u_shiny");
        this.shiny = fShiny;
    }
    draw(gl){
        gl.uniform4f(this.u_color,this.color[0],this.color[1], this.color[2],this.color[3]);
        gl.uniformMatrix4fv(this.u_transform,false,this.transform.elements);
        gl.uniformMatrix4fv(this.u_transformInverse,false,this.transformInverse.elements);
        gl.uniform1f(this.u_shiny, this.shiny);
        let type = shading === "wireframe" ? gl.LINE_STRIP : gl.TRIANGLES;
        gl.drawElements(type, this.data.cylinderLength, gl.UNSIGNED_SHORT,0);

    }
    updateColor(gl,vColor){
        this.color = vColor;
        gl.uniform4f(this.u_color,this.color[0],this.color[1], this.color[2],this.color[3]);
    }
    updateObjectData(newData){
        this.data = newData;
    }
}
//like above, but for the camera and perspective matrices and light direction vec3, as an array
class World{
    constructor(gl, program, mView, mProj, vec3Pack){
        this.view = mView;
        this.viewInv = new Matrix4();
        this.viewInv.setInverseOf(mView);
        this.proj = mProj;
        this.cameraPosition = vec3Pack['cameraPosition'];
        this.ambient = vec3Pack['ambientLightColor'];

        this.u_ViewMatrix = gl.getUniformLocation(program,"u_ViewMatrix");
        this.u_ViewMatrixInverse = gl.getUniformLocation(program,"u_ViewMatrixInverse");
        this.u_ProjMatrix = gl.getUniformLocation(program,"u_ProjMatrix");

        this.u_cameraPosition = gl.getUniformLocation(program, "u_cameraPosition");
        gl.uniform3f(this.u_cameraPosition,this.cameraPosition[0],this.cameraPosition[1],this.cameraPosition[2]);

        this.u_ambientLight = gl.getUniformLocation(program, "u_ambientLight");
        gl.uniform3f(this.u_ambientLight,this.ambient[0],this.ambient[1],this.ambient[2]);

        gl.uniformMatrix4fv(this.u_ViewMatrix,false,this.view.elements);
        gl.uniformMatrix4fv(this.u_ViewMatrixInverse,false,this.viewInv.elements);
        gl.uniformMatrix4fv(this.u_ProjMatrix, false, this.proj.elements);
    }
    updateCamera(gl,mView){
        this.view = mView;
        this.viewInv.setInverseOf(mView);
        gl.uniformMatrix4fv(this.u_ViewMatrix,false,this.view.elements);
        gl.uniformMatrix4fv(this.u_ViewMatrixInverse,false,this.viewInv.elements);

    }
}

class Lighting{
    constructor(gl,program){
        this.DLightDirection = [];
        this.DLightColor = [];
        this.PLightPos = [];
        this.PLightColor = [];
        this.numPL = 0;
        this.numDL = 0;
        for(let i = 0; i < MAX_DL; ++i){
            this.DLightColor.push(gl.getUniformLocation(program,`DLightColor[${i}]`));
            this.DLightDirection.push(gl.getUniformLocation(program,`DLightDirection[${i}]`));
        }
        for(let i = 0; i < MAX_PL; ++i){
            this.PLightColor.push(gl.getUniformLocation(program,`PLightColor[${i}]`));
            this.PLightPos.push(gl.getUniformLocation(program,`PLightPos[${i}]`));
        }
        this.DLCount = gl.getUniformLocation(program,"DLCount");
        this.PLCount = gl.getUniformLocation(program,"PLCount");
    }

    addDirectionalLight(gl,vDir, vColor){
        gl.uniform3f(this.DLightDirection[this.numDL],vDir[0],vDir[1],vDir[2]);
        gl.uniform3f(this.DLightColor[this.numDL],vColor[0], vColor[1], vColor[2]);
        gl.uniform1i(this.DLCount,this.numDL + 1);
        return this.numDL++;
    }
    addPointLight(gl,vPos, vColor){
        gl.uniform3f(this.PLightPos[this.numPL],vPos[0],vPos[1],vPos[2]);
        gl.uniform3f(this.PLightColor[this.numPL],vColor[0], vColor[1], vColor[2]);
        gl.uniform1i(this.PLCount,this.numPL + 1);
        return this.numPL++;
    }
    changeDirectionalData(gl,id,vDir,vColor){
        gl.uniform3f(this.DLightDirection[id],vDir[0],vDir[1],vDir[2]);
        gl.uniform3f(this.DLightColor[id],vColor[0], vColor[1], vColor[2]);
    }
    changePointData(gl,id,vPos,vColor){
        gl.uniform3f(this.PLightPos[id],vPos[0],vPos[1],vPos[2]);
        gl.uniform3f(this.PLightColor[id],vColor[0], vColor[1], vColor[2]);
    }
}
function main(){

    let vertCode = `
attribute vec3 a_coordinates;
attribute vec3 a_normal;

uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

uniform mat4 u_transform; 
uniform mat4 u_transformInverse; 

uniform mat4 u_finalRotation;
uniform mat4 u_finalRotationInverse;

uniform vec4 u_color;

varying vec3 v_position;
varying vec3 v_normal;
varying vec4 v_color;
void main(void) {
    gl_Position =  u_ProjMatrix * u_ViewMatrix * u_finalRotation * u_transform * vec4(a_coordinates, 1.0);
    vec3 n = a_normal * mat3(u_finalRotationInverse) * mat3(u_transformInverse); 
    v_normal = normalize(n);
    v_position = vec3(u_finalRotation * u_transform * vec4(a_coordinates, 1.0) );
    v_color = u_color;
  
}`;

    const fragCode = `
#ifdef GL_ES
    precision mediump float;
#endif

#define MAX_DL ${MAX_DL}
#define MAX_PL ${MAX_PL}

uniform vec3 u_cameraPosition;

uniform vec3 DLightColor[MAX_DL];
uniform vec3 DLightDirection[MAX_DL];
uniform int DLCount;

uniform vec3 PLightColor[MAX_PL];
uniform vec3 PLightPos[MAX_PL];
uniform int PLCount;

uniform vec3 u_ambientLight;

uniform float u_shiny;
varying vec3 v_position;
varying vec3 v_normal;
varying vec4 v_color;
void main(void) {
    vec3 normal = normalize(v_normal);
    vec3 finalColor = vec3(0,0,0);
    vec3 finalSpecular = vec3(0,0,0);
    for(int i = 0; i < MAX_PL; ++i){
        float dist = length(PLightPos[i] - v_position);
        float att = 1.0 / (1.0 + 0.1 * dist + 0.01 * dist * dist);
        if(att < 0.01) {continue;}
        if(i >= PLCount) {break;}
        vec3 lightDirection = normalize(PLightPos[i] - v_position);
        vec3 reflection = 2.0 * dot(normal, lightDirection) * normal - lightDirection;
        vec3 toCamera = normalize(u_cameraPosition - v_position);
        float cosAngle = pow(clamp(dot(reflection,toCamera),0.0, 1.0), u_shiny)/1.5;
        
        finalSpecular += PLightColor[i] * cosAngle * att;
        float nDotL = max(dot(lightDirection, normal), 0.0);
        vec3 color = v_color.rgb * (1.0-cosAngle) * att;
        finalColor += PLightColor[i] * color * nDotL;
    }
    for(int i = 0; i < MAX_DL; ++i){
        if(i >= DLCount) {break;}
        vec3 lightDirection = DLightDirection[i];
        vec3 reflection = 2.0 * dot(normal, lightDirection) * normal - lightDirection;
        vec3 toCamera = normalize(u_cameraPosition - v_position);
        float cosAngle = pow(clamp(dot(reflection,toCamera),0.0, 1.0), u_shiny)/1.5;
        finalSpecular += DLightColor[i] * cosAngle;
        finalColor += max(dot(lightDirection,normal),0.0) * DLightColor[i] * (1.0-cosAngle) * v_color.rgb;
    }
    vec3 ambient = u_ambientLight * v_color.rgb;
    gl_FragColor = clamp(vec4(finalColor + ambient + finalSpecular, v_color.a),0.0,1.0);
}`;
    
    

    let rotationSpeed = 1;
    let cameraPosition = [3,0,1.75];
    let ambientLightColor = [0.15,0.15,0.15]
    let candleCount = 20;
    edgeCount = 50;
    let bRotate = false;

    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0.6,0.2,0.4,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //create base shape geometry
    let cylinder = generateUnitCylinder(edgeCount);
    //initialize shader
    let program = initShaders(gl,vertCode,fragCode);

    //create buffers
    vertBuffer = gl.createBuffer(); 
    normalBuffer = gl.createBuffer();
    indexBuffer = gl.createBuffer();

    //load triangle data into index buffer
    let a_coordinates = gl.getAttribLocation(program, "a_coordinates");
    let a_normal = gl.getAttribLocation(program,"a_normal");


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,cylinder.tris,gl.STATIC_DRAW);

    //load normal and vertex attribute buffers
    updateArrayBuffer(gl,vertBuffer,a_coordinates,cylinder.verts,3,gl.FLOAT);
    updateArrayBuffer(gl,normalBuffer, a_normal,cylinder.norms,3,gl.FLOAT);
   
    //will hold info about unique cylinders
    let cArr = [];

    //squashes brown cylinder
    let transform = new Matrix4();
    transform.setScale(1.5,1.5,.33);
    cArr.push(new Cylinder(gl, program, cylinder, transform, [0.45,0.3,0.3,1],10));

    //moves up and scales down green cylinder
    let t2 = new Matrix4();
    t2.setTranslate(0,0,.33);
    t2.scale(0.75,0.75,0.75);
    cArr.push(new Cylinder(gl, program, cylinder, t2, [0,1,0,1],3));

    //stretches hue rotating cylinder
    let t4 = new Matrix4();
    t4.setScale(.3,.3,1.4);
    t4.translate(0,0,0.1);
    cArr.push(new Cylinder(gl,program,cylinder,t4,[0,1,1,1],1));

    //matrix to scale down tiny cylinders
    let arrScale = new Matrix4();
    arrScale.setScale(0.05,0.05,0.25);
    
    //arange tiny cylinders in a circle
    for(let i = 0; i < candleCount; ++i){
        let translate = new Matrix4();
        let angle = (i* 2 *Math.PI)/(candleCount);
        translate.setTranslate(Math.cos(angle) * 0.6, Math.sin(angle)*0.6,1);
        translate.multiply(arrScale);
        cArr.push(new Cylinder(gl,program,cylinder,translate,[0,0,1,1],20));
    }

    

    //places camera
    let view = new Matrix4();
    view.setLookAt(3,0,1.75,0,0,0,0,0,1);

    //creates perspective
    let proj = new Matrix4();
    proj.setPerspective(70,1,0.1,5);


    //let light = new Vector3(lightLocation);
    //light.normalize();
    //let ld = light.elements;

    //creates object that sets all the uniform matricies and vec3 light direction
    let world = new World(gl,program,view,proj,{
        ambientLightColor: ambientLightColor,
        cameraPosition: cameraPosition,    
    });
    let lighting = new Lighting(gl,program);
    let directional = lighting.addDirectionalLight(gl, [0,0,1], [1,1,1]);
    let point = lighting.addPointLight(gl, [2,0,1], [1,0,0]);

    let lt = new Matrix4();
    lt.translate(2,0,1);
    lt.scale(0.05,0.05,0.05);
    let lc = [1,0,0];

    let eye = new Matrix4();



    let t = Date.now();
    let angle = 0;
    let angleX = 0;
    let angleY = 0;
    let mouse = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        dx: 0,
        dy: 0,
        pressed: false,
    }
    let u_finalRotation = gl.getUniformLocation(program,"u_finalRotation");
    let finalRotation = new Matrix4();
    finalRotation.setIdentity();
    gl.uniformMatrix4fv(u_finalRotation,false,finalRotation.elements);
    let u_finalRotationInverse = gl.getUniformLocation(program,"u_finalRotationInverse");
    let finalRotationInverse = new Matrix4();
    let R = new Matrix4();
    finalRotationInverse.setInverseOf(finalRotation);
    gl.uniformMatrix4fv(u_finalRotationInverse,false,finalRotationInverse.elements);
    document.addEventListener("mousedown",(e)=>{
        mouse.pressed = true;
    });
    document.addEventListener("mouseup",(e)=>{
        mouse.pressed = false;
    });
    document.addEventListener("mousemove",(e)=>{
        let r = canvas.getBoundingClientRect();
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.dx = mouse.x - mouse.px;
        mouse.dy = mouse.y - mouse.py;
        if(mouse.pressed && mouse.x > r.x && mouse.y > r.y &&
            mouse.x < r.x + r.width && mouse.y < r.y + r.height){
            angleX += mouse.dx / 2;
            angleY += -mouse.dy / 2;
            let i2 = -Math.sin(angleX/180 * Math.PI);
            let j2 = -Math.cos(angleX/180 * Math.PI);
            R = generateRotateMatrix(angleY,i2,j2,0);
            finalRotation.setRotate(angleX,0,0,1);
            //finalRotation.rotate(angleY,0,1,0);
            finalRotation.multiply(R);
            gl.uniformMatrix4fv(u_finalRotation, false, finalRotation.elements);
            finalRotationInverse.setInverseOf(finalRotation);
            gl.uniformMatrix4fv(u_finalRotationInverse,false,finalRotationInverse.elements);
        }
    })
    function tick(){
        if(bChangedCount){
            cylinder = generateUnitCylinder(edgeCount);
            if(shading == 'smooth'){
                cylinder.calcNormalsSmooth();
            }
            else{
                cylinder.calcNormals();
            }
            
            for(let i = 0; i < cArr.length; ++i){
                cArr[i].updateObjectData(cylinder);
            }
            bChangedCount = false;
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,cylinder.tris,gl.STATIC_DRAW);
            updateArrayBuffer(gl,vertBuffer,a_coordinates,cylinder.verts,3,gl.FLOAT);
            updateArrayBuffer(gl,normalBuffer, a_normal,cylinder.norms,3,gl.FLOAT);
        }
        let c = new Matrix4();
        let timeNow = Date.now();
        let elapsed = timeNow - t;
        let delta = ((elapsed * rotationSpeed)/ 1000) * 0.5 * Math.PI;
        angle += delta;
        if(angle > Math.PI * 2){
            angle -= Math.PI * 2;
        }
        
        //rotates camera, the objects are not rotating
        t = timeNow;
        if(bRotate){
            c.setLookAt(Math.cos(angle) * 3, Math.sin(angle) * 3 , 1.75,
                0,0,0,
                0,0,1);
            world.updateCamera(gl,c);
        }

        let hue = angle/Math.PI * 180;
        cArr[2].updateColor(gl,hsv2rgb(hue,1,1,1));
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        //draw all cylinders
        for(let i = 0; i < cArr.length; ++i){
            cArr[i].draw(gl);
        }
        gl.uniformMatrix4fv(cArr[0].u_transform,false, lt.elements);
        gl.uniform4f(cArr[0].u_color,lc[0],lc[1],lc[2],1.0);
        gl.uniformMatrix4fv(u_finalRotation,false,eye.elements);
        gl.uniformMatrix4fv(u_finalRotationInverse,false,eye.elements);
        gl.drawElements(gl.TRIANGLES, cylinder.tris.length - cylinder.cylinderLength, gl.UNSIGNED_SHORT, cylinder.cylinderLength * 2);
        gl.uniformMatrix4fv(u_finalRotation,false,finalRotation.elements);
        gl.uniformMatrix4fv(u_finalRotationInverse,false,finalRotationInverse.elements);

        requestAnimationFrame(tick);
    }
    document.getElementById("edgeCountInput").addEventListener("input",(e)=>{
        edgeCount = Number(document.getElementById("edgeCountInput").value) || 200;
        bChangedCount = true;
    });
    document.getElementById("renderType").addEventListener("input",(e)=>{
        shading = e.target.value; 
        bChangedCount = true;
    });
    
    let dirForm = document.getElementById("DLightForm").elements;
    let pointForm = document.getElementById("PLightForm").elements;
    for(let e of dirForm){
        e.addEventListener("input", (e)=>{updateLights(gl,lighting,lt,lc)});
    }
    for(let e of pointForm){
        e.addEventListener("input", (e)=>{updateLights(gl,lighting,lt,lc)});
    }

    tick();
    

}

function loadShaders(gl, shaderStr, type){

    let shader = gl.createShader(type);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        let error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

//gl: gl context
//vert: vertex shader string
//frag: fragment shader string
//return: gl shader program
function initShaders(gl, vert, frag){

    let vs = loadShaders(gl, vert, gl.VERTEX_SHADER);
    let fs = loadShaders(gl, frag, gl.FRAGMENT_SHADER);

    let program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
    
}
function generateUnitCylinder(edgeCount){
    vertices = [0,0,0];
    tris = [];

    

    //calculate bottom and top endcaps
    for(let i = 0; i < edgeCount; i += 1){
        vertices.push(Math.cos(2*i*Math.PI/edgeCount));
        vertices.push(Math.sin(2*i*Math.PI/edgeCount));
        vertices.push(0);
    }
    for(let i = 0; i < edgeCount; i += 1){
        vertices.push(Math.cos(2*i*Math.PI/edgeCount));
        vertices.push(Math.sin(2*i*Math.PI/edgeCount));
        vertices.push(1);
    }
    vertices.push(0,0,1); //top endcap is the last vertex

    //triangulate endcaps
    
    for(let i = 1; i <= edgeCount; i += 1){
        tris.push(i%edgeCount+1,i,0);
    }
    for(let i = edgeCount + 1; i <= edgeCount * 2; i += 1){
        tris.push(i,i%edgeCount+ edgeCount + 1,vertices.length/3 - 1);
    }

    //generate edge verts and triangulate
    // p3 ------p4
    // |        |
    // |        |
    // p1-------p2
    // faces will be triangulated as
    // p3,p2,p1 - p2,p3,p4
    for(let i = 1; i <= edgeCount; i += 1){

        let p1x, p1y, p1z;
        let p2x, p2y, p2z;
        let p3x, p3y, p3z;
        let p4x, p4y, p4z;

        p1x = vertices[i*3];
        p1y = vertices[i*3 + 1];
        p1z = 0;
        
        p3x = p1x;
        p3y = p1y;
        p3z = 1;

        p2x = vertices[(i%edgeCount + 1)*3];
        p2y = vertices[(i%edgeCount + 1)*3 + 1];
        p2z = 0;
        p4x = p2x;
        p4y = p2y;
        p4z = 1;

        vertices.push(p1x, p1y, p1z);
        vertices.push(p2x,p2y,p2z);
        vertices.push(p3x,p3y,p3z);
        vertices.push(p4x, p4y, p4z);

        let j = (vertices.length / 3) - 4;
        tris.push(j+1, j+2, j);
        tris.push(j+2, j+1, j+3);
    }
    
//code taken from textbook
var SPHERE_DIV = 13;

var i, ai, si, ci;
var j, aj, sj, cj;
var p1, p2;

var positions = [];
var indices = [];

// Generate coordinates
for (j = 0; j <= SPHERE_DIV; j++) {
  aj = j * Math.PI / SPHERE_DIV;
  sj = Math.sin(aj);
  cj = Math.cos(aj);
  for (i = 0; i <= SPHERE_DIV; i++) {
    ai = i * 2 * Math.PI / SPHERE_DIV;
    si = Math.sin(ai);
    ci = Math.cos(ai);

    positions.push(si * sj);  // X
    positions.push(cj);       // Y
    positions.push(ci * sj);  // Z
  }
}

// Generate indices
for (j = 0; j < SPHERE_DIV; j++) {
  for (i = 0; i < SPHERE_DIV; i++) {
    p1 = j * (SPHERE_DIV+1) + i;
    p2 = p1 + (SPHERE_DIV+1);

    indices.push(p1);
    indices.push(p2);
    indices.push(p1 + 1);

    indices.push(p1 + 1);
    indices.push(p2);
    indices.push(p2 + 1);
  }
}




    let obj = new ObjectData(vertices, tris, positions, indices);
    obj.calcNormalsSmooth();
    return obj;
    
}
function generateSphere(){
    
  return obj;
  
}

function updateArrayBuffer(gl, buffer, attribute, data, dataCount, type){
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(attribute,dataCount,type,false,0,0);
    gl.enableVertexAttribArray(attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


//pre: 0 <= h < 360, 0<= s, v, a <=1
//ret: normalized rgba in an array
function hsv2rgb(h,s,v,a){
    let c = v*s;
    let m = v-c;
    let x = c*(1-Math.abs((h/60)%2 - 1));
    let r,g,b;
    if(h < 60){
        r = c;
        g = x;
        b = 0; 
    }
    else if( h >= 60 && h < 120){
        r = x;
        g = c;
        b = 0; 
    }
    else if( h >= 120 && h < 180){
        r = 0;
        g = c;
        b = x; 
    }
    else if( h >= 180 && h < 240){
        r = 0;
        g = x;
        b = c; 
    }
    else if( h >= 240 && h < 300){
        r = x;
        g = 0;
        b = c; 
    }
    else{
        r = c;
        g = 0;
        b = x; 
    }
    return [r+m,g+m,b+m,a];
    

}

function generateRotateMatrix(angle, i,j,k){
    let d = Math.hypot(i,j,k);
    i /= d;
    j /= d;
    k /= d;
    let r = Math.cos(angle/360 * Math.PI); //not a typo im dividing by 2!
    let imag = Math.sin(angle/360 * Math.PI)
    let q = [r,imag*i, imag*j, imag*k];
    let R = new Matrix4();
    let e; 
    e = R.elements;
    // real component == 0, i == 1, j == 2, k is 0 (not the index, the k is literally 0)
    e[0] = 1-2*(q[2]*q[2] + q[3]*q[3]);  e[4] = 2*(q[1]*q[2] - q[3]*q[0]);  e[8] = 2*(q[1]*q[3] + q[2]*q[0]);
    e[1] = 2*(q[1]*q[2] + q[3]*q[0]);    e[5] = 1-2*(q[1]*q[1]+q[3]*q[3]);  e[9] = 2*(q[2]*q[3]-q[1]*q[0]);
    e[2] = 2*(q[1]*q[3]-q[2]*q[0]);      e[6] = 2*(q[2]*q[3] + q[1]*q[0]);  e[10]= 1-2*(q[1]*q[1] + q[2]*q[2]);
    e[15] = 1;

    return R;
    
}

//https://stackoverflow.com/questions/39128589/decomposing-rotation-matrix-x-y-z-cartesian-angles#:~:text=If%20R1%20stands%20for%20the,R%20%3D%20R1*R2%20).
function decompose(m, bDegree){
    let e;
    let res = {alpha: 0, beta: 0, gamma: 0};
    e = m.elements;
    res.beta = Math.atan2(-e[8],Math.sqrt(e[0]*e[0]+e[4]*e[4]));
    let c = Math.cos(res.beta);
    res.alpha = Math.atan2(e[9]/c,e[10]/c);
    res.gamma = Math.atan2(e[4]/c,e[0]/c);

    if(bDegree){
        res.alpha *= 180/Math.PI;
        res.beta *= 180/Math.PI;
        res.gamma *= 180/Math.PI;
    }
    return res;
}
function handleRedraw(){
    edgeCount = Number(document.getElementById("edgeCountInput").value) || 200;
    bChangedCount = true;
}
function updateLights(gl,lighting,lt,lc){
    let dirForm = document.getElementById("DLightForm").elements;
    let pointForm = document.getElementById("PLightForm").elements;

    let DPos = new Vector3([Number(dirForm[0].value)/10, Number(dirForm[1].value)/10, Number(dirForm[2].value)/10]);
    DPos.normalize();
    let Dtoggle = dirForm[6].checked === true ? 1 : 0;
    let DColor = [Number(dirForm[3].value)/255.0 * Dtoggle, Number(dirForm[4].value)/255.0 * Dtoggle, Number(dirForm[5].value)/255.0 * Dtoggle];


    let PPos = [Number(pointForm[0].value)/10, Number(pointForm[1].value)/10, Number(pointForm[2].value)/10];
    let Ptoggle = pointForm[6].checked === true ? 1 : 0;
    let PColor = [Number(pointForm[3].value)/255.0 * Ptoggle, Number(pointForm[4].value)/255.0 * Ptoggle, Number(pointForm[5].value)/255.0 * Ptoggle];
    
    lt.setTranslate(PPos[0], PPos[1], PPos[2]);
    lt.scale(0.05,0.05,0.05);

    lc[0] = PColor[0];
    lc[1] = PColor[1];
    lc[2] = PColor[2];


    lighting.changeDirectionalData(gl,0,DPos.elements,DColor);
    lighting.changePointData(gl,0,PPos,PColor);
}