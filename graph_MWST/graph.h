#pragma once
#include <vector>
#include <iterator>

class Graph{
public:
    using vert_t = unsigned long;
    using label_t = unsigned long;
    using weight_t = double;

    Graph(){};
    Graph(vert_t size){
        setSize(size);
    }
private:
    struct _Edge{
        _Edge(){};
        _Edge(vert_t v, label_t l, weight_t w) :
            vert{v}, label{l}, weight{w}{};
        
        vert_t vert;
        label_t label;
        weight_t weight;
    };
    struct _Vert{
        std::vector<_Edge> edges;
        bool replace(vert_t v, label_t l, weight_t w);
        
    };
    std::vector<_Vert> _verts;
    uint64_t eCount = 0;
    static vert_t toArrPos(vert_t u);
    static vert_t toVertName(vert_t arrPos);
    void printVert(const _Vert& vert) const;

public:

    //call setSize before adding Verts to avoid weird errors
    bool setSize(vert_t size);
    void addEdge(vert_t u, vert_t v, label_t l, weight_t weight);
    vert_t vertCount() const;
    uint64_t edgeCount() const;
    void print() const;
    struct Edge{
        Edge(vert_t u, vert_t v, label_t l, weight_t w) : 
            u{u}, v{v}, label{l}, weight{w}{};
        vert_t u,v;
        label_t label;
        weight_t weight;
    };
    [[nodiscard]] std::vector<Edge> edges() const; //really should be an iterator...
    [[nodiscard]] std::vector<vert_t> vertices() const; //also should be iterator...

    
};