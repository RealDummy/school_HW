#include "graph.h"
#include "disjointset.h"
#include <iostream>
#include <iomanip>
#include <fstream>

Graph findMWST_Kruskal(const Graph& G){
    Graph res;
    DisjointSets<Graph::vert_t> djs;
    res.setSize(G.vertCount());
    auto verts = G.vertices();
    for(const auto& v : verts){
        djs.makeSet(v);
    }
    auto edges = G.edges();
    std::sort(begin(edges),end(edges), [](const Graph::Edge& a, const Graph::Edge& b){return a.weight < b.weight;});
    for(const auto& e : edges){
        if(djs.findSet(e.u) != djs.findSet(e.v)){
            res.addEdge(e.u, e.v, e.label, e.weight);
            djs.unionSet(e.u, e.v);
        }
    }
    return res;
} 

std::pair<std::string,bool> extractLine(std::ifstream& file){
    std::string res;
    int c;
    while((c = file.get()) != '\n'){
        if(c < 0 || c > std::numeric_limits<unsigned char>::max()){
            return std::make_pair(res,false);
        }
        res += c;
    }
    return std::make_pair(res, !file.eof());
}

//line contains 2 positive long ints, and one rational number
void addLineToGraph(Graph& G, Graph::label_t l, const std::string& line){
    unsigned long u, v;
    double w;
    auto itemCount = sscanf(line.c_str(), "%ld %ld %lf", &u, &v, &w);
    if(itemCount != 3){
        return;
    }
    G.addEdge(u,v,l,w);
}

void printEdge(std::ofstream& out, const Graph::Edge& e){
    out.setf(std::ofstream::showpoint);
    out << std::setw(4) << e.label <<
        ": (" << e.u << ", " << e.v << 
        ") " << std::fixed << std::setprecision(1) << e.weight << std::endl;
}

int main(int argc, char** argv){
    if(argc > 3){
        std::cerr << "Usage Error: Args should be an input and output file path\n";
        exit(1);
    }

    std::ifstream streamIn(argv[1], std::ifstream::in);
    if(!streamIn.is_open()){
        std::cerr << "Usage Error: Input file \"" << argv[1] <<"\" could not be opened\n";
        exit(1);
    }
    auto graphVertCount = std::stoul(extractLine(streamIn).first);
    auto graphEdgeCount = std::stoul(extractLine(streamIn).first);
    
    Graph G(graphVertCount);
    for(Graph::label_t label = 1; label <= graphEdgeCount; ++label){
        auto maybeLine = extractLine(streamIn);
        addLineToGraph(G,label,maybeLine.first);
        if(maybeLine.second == false){
            break;
        }
    }
    streamIn.close();

    std::ofstream streamOut(argv[2],std::ofstream::trunc);
    
    auto MWST = findMWST_Kruskal(G);
    auto treeEdges = MWST.edges();
    std::sort(begin(treeEdges), end(treeEdges), [](const Graph::Edge& a, const Graph::Edge& b){return a.weight < b.weight;});
    Graph::weight_t total = 0.0;
    for(const auto& edge : treeEdges){
        printEdge(streamOut, edge);
        total += edge.weight;
    }
    streamOut << "Total Weight = " << std::fixed <<std::setprecision(2) << total << std::endl;

}