#include "graph.h"
#include "disjointset.h"
#include <vector>
#include <string>
#include <iostream>

#define PASS() return 0
#define FAIL_SUBTEST(X) return X

template<class T>
using testingVec = std::vector<std::pair<std::string, std::function<int (T &)>> >;
using djs = DisjointSets<int>;

Graph& setupGraph(Graph& G){
    G.setSize(8);
    G.addEdge(1,3,1,1.3);
    G.addEdge(1,7,2,1.7);
    G.addEdge(2,5,3,2.5);
    G.addEdge(2,6,4,2.6);
    G.addEdge(2,7,5,2.7);
    G.addEdge(3,5,6,3.5);
    G.addEdge(4,5,7,4.5);
    G.addEdge(4,6,8,4.6);
    G.addEdge(6,8,9,6.8);
    G.addEdge(7,8,10,7.8);
    return G;
}

int graphCreate(Graph& G){
    G.setSize(10);
    if(G.vertCount() != 10){
        FAIL_SUBTEST(1);
    }
    if(G.edgeCount() != 0){
        FAIL_SUBTEST(2);
    }
    PASS();
}

int graphAdd(Graph& G){
    setupGraph(G);
    if(G.edgeCount() != 10){
        FAIL_SUBTEST(1);
    }
    PASS();
}

int graphEdges(Graph& G){
    setupGraph(G);
    auto edges = G.edges();
    std::cout << "List size: " << edges.size() << " == Graph edge count: " << G.edgeCount() << std::endl;
    if(edges.size() != G.edgeCount()){
        FAIL_SUBTEST(1);
    }
    PASS();
}

int graphVerts(Graph& G){
    setupGraph(G);
    auto verts = G.vertices();
    for(Graph::vert_t i = 0; i < G.vertCount(); ++i){
        if(verts[i] != i + 1){
            FAIL_SUBTEST(1);
        }
    }
    PASS();
}
void djsSetup(djs& S){
    for(int i = 0; i < 10; ++i){
        S.makeSet(i);
    }
}
int djsCreate(djs& S){
    djsSetup(S);

    for(int i = 0; i < S.size(); ++i){
        if(S.findSet(i) != i){
            FAIL_SUBTEST(1);
        }
    }
    PASS();
}

int djsUnion(djs& S){
    djsSetup(S);

    for(size_t i = 0; i < S.size(); i += 2){
        S.unionSet(0,i);
    }
    for(size_t i = 0; i < S.size(); ++i){
        if((S.findSet(i) == S.findSet(0)) && i%2){
            FAIL_SUBTEST(1);
        }
    }
    S.printSets();
    PASS();
}

template<class T>
int noTestYet([[maybe_unused]] T& G){
    FAIL_SUBTEST(-1);
}

template<class T>
void runTests(testingVec<T>& tests){
    for(auto& test : tests){
        std::cout << "-------------------------\n";
        T U;
        auto p = test.second(U);
        if(!p){
            std::cout << "Pass test: " << test.first << '\n';
        }
        else if(p > 0){

            std::cout << "Fail test: " << test.first << " at subtest " << p <<  '\n';
        }
        else{
            std::cout << "No test: " << test.first << '\n';
        }
        std::cout << "-------------------------\n";
    }
}

int main(){

    testingVec<Graph> gTests {
        {"Graph Creation", graphCreate},
        {"Graph Edge Addition", graphAdd},
        {"Graph Edge List", graphEdges},
        {"Graph Vert List", graphVerts},
    };

    testingVec<djs> djsTests {
        {"DJS Creation", djsCreate},
        {"DJS Union", djsUnion},
    };

    runTests(gTests);
    runTests(djsTests);
}