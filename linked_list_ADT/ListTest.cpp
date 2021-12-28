
/*
 * Sam Wortzman
 * CruzID: swortzma
 * Assignment: pa4
 */

#include "List.h"
#include <vector>
#include <math.h>

void rotateLeft(List& L){
    if(L.size() < 2){
        return;
    }
    L.moveFront();
    auto i = L.peekNext();
    L.eraseAfter();
    L.moveBack();
    L.insertBefore(i);
}

void rotateRight(List& L){
     if(L.size() < 2){
        return;
    }
    L.moveBack();
    auto i = L.peekPrev();
    L.eraseBefore();
    L.moveFront();
    L.insertAfter(i);
}

std::vector<List> getAllSets(const List& L){
    uint32_t size = L.size();
    if(size > 31){
        std::cout << "too big number to get All Sets" << "\n";
        size = 31;
    }
    uint32_t length = 1 << size;
    std::vector<List> vec(length);
    for(uint32_t bits = 0; bits < length; ++bits){
        uint32_t bitmask = 1;
        
        //std::cout << bits << "\n";
        for(int v : L){
            if( bits & bitmask ){
                vec[bits].insertBefore(v);
            }
            bitmask = bitmask << 1;
        }
    }
    return vec;
}

int main(){
    List D;
    for(int i = 1; i <= 5; i++){
        D.insertBefore(i);
    }
    std::cout << D << "\n";

    rotateRight(D);
    std::cout << D << "\n";
    rotateLeft(D);
    std::cout << D << "\n";
    for(auto& v : D){
        std::cout << v << "\n";
    }
    
    auto vec = getAllSets(D);
    List All;
    for(const auto& L : vec){
        std::cout << L << "\n";
        All = All.concat(L);
    }
    std::cout << All << "\n";
    for(int i = 0; i < 14; ++i){
        rotateRight(All);
    }
    std::cout << All << "\n";
    All.cleanup();
    std::cout << All << "\n";
    std::cout << "yay the cool stuff works, now for boring stuff\n";
    All.clear();
    std::cout << "size of cleared list: " << All.size() << "\n";
    for(int i = 1; i <=10; ++i){
        if(i%2){
            All.insertAfter(i);
        }
        else{
            All.insertBefore(i);
        }
    }
    std::cout << All << " cursor pos is 5?: " << All.position() << "\n";
    std::cout << All.peekPrev() << " <cursor> " << All.peekNext() << "\n";
    All.eraseBefore();
    All.eraseAfter();
    std::cout << All << " cursor pos is 4?: " << All.position() << "\n";

    for(int i = 1; i < 25; ++i){
        All.insertBefore(i%8);
    }
    std::cout << All << "\n";
    All.moveFront();
    while(All.findNext(2) != -1){
        All.eraseBefore();
    }
    while(All.findPrev(6) != -1){
        All.eraseAfter();
    }
    std::cout << "No 2's no 6's: " << All << "\n";
    All.findNext(7);
    List Copy(All);
    std::cout << "cusor position: " << All.position() << " Copies position: " << Copy.position();
    return 0;
}
