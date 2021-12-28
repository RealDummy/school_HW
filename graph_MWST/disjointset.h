#pragma once
#include <vector>
#include <algorithm>
#include <iostream>
#include <unordered_map>

//T must have equality comparisons!
template<class T>
class DisjointSets{
private:

    std::unordered_map<T, T> parents;
    size_t count = 0;

public:
    auto size() const{
        return count;
    }
    const T& makeSet(const T& item){
        if(parents.count(item) == 0){
            parents[item] = item;
            count += 1;
        } 
        return parents[item];
    }
    const T& findSet(const T& item){
        makeSet(item);
        //find root of set

        auto itemParentIter = parents.find(item);
        auto root = itemParentIter;

        //update root until an element is its own parent
        while(root->first != root->second){
            root = parents.find(root->second);
        }

        //update elements of set's parents to be root
        auto x = itemParentIter;
        while(x != root){
            auto& p = x->second;
            parents[p] = root->second;
            x = parents.find(p);
        }
        return root->second;
    }
    void unionSet(const T& a, const T& b){
        auto x = parents.find(findSet(a));
        auto y = parents.find(findSet(b));

        if(x == y){
            return;
        }

        y->second = x->second;
    }
    
    void printSets(){
        for(const auto& p : parents){
            auto hasChildren = false;
            if(p.second != p.first){
                continue;
            }
            for(const auto& e : parents){
                if(findSet(e.first) == p.first){
                    if(hasChildren == false){
                        std::cout << "{ " << e.first;;
                        hasChildren = true;
                        continue;
                    }
                    std::cout << ", " << e.first;
                }
            }
            if(hasChildren){
                std::cout << " } ";
            }
        }
        std::cout << std::endl;
    }
};
