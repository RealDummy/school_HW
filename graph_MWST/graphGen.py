

from random import random
from random import randint
from random import shuffle
from sys import argv

class Graph:
    adjMat = []
    vCount = 0
    eCount = 0
    p = 0
    def __init__(self,numVerts : int, edgeCount : float, minW : float = 0.0, maxW : float = 10.0) -> None:
        self.vCount = numVerts
        self.adjMat = [[None for _ in range(self.vCount)] for _ in range(self.vCount)]
        vertOrder = [i for i in range(self.vCount)]
        shuffle(vertOrder)
        edgeCount = min(edgeCount,sum([i for i in range(self.vCount)]) )
        edgeCount = max(edgeCount, numVerts - 1)
        for j,i in enumerate(vertOrder[:-1]):
            val = (((random() * (maxW - minW) + minW) * 100) // 10) / 10
            self.adjMat[i][vertOrder[j+1]] = val
            self.adjMat[vertOrder[j+1]][i] = val
            self.eCount += 1
        
        while self.eCount < edgeCount:
            i = randint(0,self.vCount - 1)
            jList = [j for j in range(self.vCount) if self.adjMat[i][j] is None and j != i]
            if not jList:
                continue
            j = jList[randint(0,len(jList)-1)]
            if i == j:
               continue
            if(self.adjMat[i][j] is not None):
                continue
            val = (((random() * (maxW - minW) + minW) * 100) // 10) / 10
            self.adjMat[i][j] = val
            self.adjMat[j][i] = val
            self.eCount += 1


    def isConnected(self)->bool:
        vertsSeen = [0]
        vertsDiscovered = [0]
        while vertsDiscovered:
            v = vertsDiscovered.pop(0)
            l = [i for i,vert in enumerate(self.adjMat[v]) if vert is not None and i not in vertsSeen]
            vertsDiscovered.extend(l)
            vertsSeen.extend(l)
        return len(vertsSeen) == self.vCount


    def print(self, path : str):
        f = open(path, "w")
        f.write(str(self.vCount))
        f.write("\n")
        f.write(str(self.eCount))
        f.write("\n")
        for i,vert in enumerate(self.adjMat):
            for j,edge in enumerate(vert):
                if j > i:
                    break
                if edge is None:
                    continue
                f.write("%d %d %1.1f\n" % (j+1, i+1,edge))
        f.close()

def main():
    if len(argv) != 4:
        print("Usage Error: Program takes in 3 args, a file path for file output, Vert count (int), Edge Count(int)")
        return
    g = Graph(int(argv[2]),float(argv[3]))
    
    #sanity check
    while g.isConnected() == False:
        g = Graph(int(argv[2]),float(argv[3]))
    g.print(argv[1])

if __name__ == "__main__":
    main()