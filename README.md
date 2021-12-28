# school_HW
School Projects and assignments that I have done over my years at UCSC.

## Summary
These are the four projects that I am most happy with. Each of them shows a different side of my coding capabilities. I hope you read through the descriptions for any that sound interesting. It should also be noted that I have not modified the code at all since they were turned in, although some comments may have been added.

## reflection

### linked_list_ADT: CSE 101 data structures and algorithms
A C++ assignment that uses a linked list to represent a deck of cards, and shuffles them "perfectly," meaning splits the deck in half and pulls one card from each pile back into the deck. a deck with cards 1-7 would end up as 4,1,5,2,6,3,7. This is known as in-shuffling in the perfect shuffle community(?). The assignment was to figure out how many perfect shuffles it takes to get back to the starting permutation. Something cool to note is there is a closed form solution to this problem: 2n ^ k % (2n + 1) = 1 solve for k where k is the number of shuffles required, and n is the number of cards in the deck.

I was really proud when I found out the answer to this perfect shuffle question, more proud than when I got 100% on the assignment. I did not come up with the solution, It was in a research  paper about perfect shuffling.

### three_js_room_source: CSE 160 3D graphics
https://people.ucsc.edu/~swortzma/driver.html to see the code in action. The fire and decent shadows took a majority of my coding time. I wanted better shadows, but javascript really isn't the language for the job ... and I had never worked with shadows before.
This project was completed in about a week for CSE 160, a 3D graphics class.

I am really proud of the fire that I made. It uses perlin noise to change the X,Y,Z of each cone, and then the light comes from the average position of each cone / flame. The shadows were also quite the pain to get the way I wanted them, and the tradeoff between good shadows and performant code is huge!

### webgl_project: CSE 160 3D graphics
This one works in the browser locally, as it does not use modules. It is some cylinders that I create in javascript arranged sort of like a cake, I guess. Most of the project is pretty basic stuff, with Blinn-Phong shading and no shadow maps or anything fancy. The part that I am most proud of is the object mouse interaction that happens when the mouse is dragged over the scene. Figuring out how the object should rotate was a huge undertaking for me, and involved some pretty cool, albeit basic, quaternion math.

### graph_MWST: CSE 102 analysis of algorithms
To compile, 'make'. Then ./mwst "in-file" "out-file". Or just look at the input output file pairs to see a sample of what code could do because you I am not responsible if my code breaks your computer, although I'm 99% sure it will not. I think my graph data structure is pretty good, and I used Kruskal's algorithm to find the minimum weight spanning tree and then output the edges of the tree to "out-file". One thing I could improve on was using iterators to iterate through vertices / edges, although implementing them is a pain and performant code was not a requirement.

I am actually most proud of a testing python script that I made that generates fully connected graphs in the form of a valid input file for this program, of any size, in linear time. To run the program, python3 "output dest" "verticy count" "edge count". It works by first generating a spanning tree, then adding edges to the spanning tree randomly. It should have a uniform distribution of graphs, which is to say, no graph is more likely than any other graph. My first couple attempts at this problem were... less than optimal solutions for sure. I had a good amount of fun trying to make the code more performant and more uniformly distributed. I also gave the script out to everyone in the class, so they could also get better tests for their code. The one thing it doesn't do is generate a corresponding output file, which would make it great for testing, but also would be cheating, so I didn't do that.
