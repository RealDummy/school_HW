# school_HW
School Projects and assignments that I have done over my years at UCSC.

## Summary
These are the four projects that I am most happy with. Each of them shows a different side of my coding capabilites, and I hope you read through the descriptions for any that sound interesting.

## reflection

### linked_list_ADT: CSE 101 data structures and algorithms
A C++ assignment that uses a linked list to represent a deck of cards, and shuffles them "perfectly" meaning splits the deck in half and pulls one card from each pile back into the deck. a deck with cards 1-7 would end up as 4,1,5,2,6,3,7. This is known as in-shuffleing in the perfect shuffle community(?). Something cool to note is its a simple calculation to see how many perfect in-shuffles it takes to get back to the original deck permutation. (2n ^ k % (2n + 1) = 1 solve for k where k is number of shuffles required).

I was really proud when I found out the answer to this perfect shuffle question, more proud than when I got 100% on the asignment.

### three_js_room_source: CSE 160 3D graphics
https://people.ucsc.edu/~swortzma/driver.html to see the code in action. The fire and decent shadows took a majority of my time. I wanted better shadows, but javascript really isn't the language for the job ... and I had never worked with shadows before.
This project was completed in about a week for CSE 160, a 3D graphics class. 

I am really proud of the fire that I made, It uses perlin noise to change the X,Y,Z of each cone, and then the light comes from the average position of each cone / flame. The shadows were also quite the pain the get the way I wanted them, and the tradeoff between good shadows and performant code is huge!

### webgl_project: CSE 160 3D graphics
This one works in browser. It is some cylinders that I create in javascript arranged sort of like a cake, I guess. Most of the project is pretty basic stuff, with Blinn-Phong shading and no shadow maps or anything fancy. The part that I am most proud of is the object mouse interaction that happens when the mouse is dragged over the scene. Figuring out how the object should rotate was a huge undertaking for me, and involved some pretty cool math involving some very basic quaternion math.

### graph_MWST: CSE 102 analysis of algorithms
To compile, 'make'. Then ./mwst "in-file" "out-file". Or just look at the input output file pairs to see a sample of what code could do because you I am not resposible if my code breaks your computer, although I'm 99% sure it will not. I feel like My graph data structure was pretty good, and I used kruskal's algortithm to find the minimum weight spanning tree and then output the edges of the tree to "out-file". 

I am actually most proud of a testing python script that I made, that generates fully connected graphs in the form a valid input file for this program, of any size, in linear time. To run the program, python3 "output dest" "verticy count" "edge count". It works by first generating a spanning tree, then adding edges to the spanning tree randomly. It should have a uniform distribution of graphs, which is to say, no graph is more likely than any other graph. My first couple attempts at this problem were... less than optimal solutions for sure. I had a good amount of fun trying to the code better. I also gave the code out to everyone in the class, so they could also get better tests for their code. The one thing it doesn't do is generate a corepsonding output file, which would make it great for testing, but also would be cheating, so I didn't do that.
