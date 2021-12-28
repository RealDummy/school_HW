#include "graph.h"
#include <algorithm>
#include <iostream>

bool Graph::setSize(vert_t size){
    if(_verts.size()){
        return false;
    }
    _verts.resize(size);
    return true;
}

void Graph::addEdge(vert_t u, vert_t v, label_t l, weight_t weight){
    auto ua = toArrPos(u);
    auto va = toArrPos(v);
    
    auto& uVert = _verts[ua];
    auto& vVert = _verts[va];
    
    //if vert u already has a v then v has a u as well, update weight
    if(uVert.replace(va, l, weight)){
        vVert.replace(ua,l, weight);
        return;
    }

    //otherwise its new connection
    uVert.edges.emplace_back(va,l,weight);
    vVert.edges.emplace_back(ua,l,weight);

    eCount += 1;
}
//replace a graph edge with new data
bool Graph::_Vert::replace(vert_t v, label_t l, weight_t w){
    bool ret = false;
    for(auto& e : edges){
        if(e.vert == v){
            e.weight = w;
            e.label = l;
            ret = true;
            break;
        }
    }
    return ret;
}
Graph::vert_t Graph::vertCount() const{
    return _verts.size();
}
uint64_t Graph::edgeCount() const{
    return eCount;
}
Graph::vert_t Graph::toArrPos(vert_t vertName){
    return vertName - 1;
}
Graph::vert_t Graph::toVertName(vert_t arrPos){
    return arrPos + 1;
}

[[nodiscard]] std::vector<Graph::Edge> Graph::edges() const{
    std::vector<Edge> res;
    res.reserve(edgeCount());
    for(vert_t i = 0; i < _verts.size(); ++i){
        for(const auto& e : _verts[i].edges){
            if(e.vert >= i){ //only give the edges with v >= u
                res.emplace_back(toVertName(i),toVertName(e.vert),e.label,e.weight);
            }
        }
    }
    return res;
}

[[nodiscard]] std::vector<Graph::vert_t> Graph::vertices() const{
    std::vector<Graph::vert_t>  res;
    res.reserve(vertCount());
    for(vert_t i = 0; i < vertCount(); ++i){
        res.emplace_back(toVertName(i));
    }
    return res;
}

void Graph::print() const{
    for(const auto& vert : _verts){
        printVert(vert);
    }
}
void Graph::printVert(const _Vert& vert) const{
    std::cout << toVertName(&vert - _verts.data()) << ": "; //prints the position of the vert in the array
    for(const auto& e : vert.edges){
        std::cout << "( " << toVertName(e.vert) << " : " << e.weight <<" ) ";
    }
    std::cout << std::endl;
}
