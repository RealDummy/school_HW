
/*
 * Sam Wortzman
 * CruzID: swortzma
 * Assignment: pa4
 */


#include "List.h"
void shuffle(List& D){
    
    int dSize = D.size();
    D.moveFront();
    int* shuffleArr = new int[dSize];
    int dHalf = dSize / 2;
    for(int i = 0; i < dSize; ++i){
        if(i < dHalf){
            shuffleArr[2*i + 1] = D.moveNext();
        }
        else{
            shuffleArr[2*(i-dHalf)] = D.moveNext();
        }
    }
    D.clear();
    for(int i = 0; i < dSize; ++i){
        D.insertBefore(shuffleArr[i]);
    }
    delete[] shuffleArr;
    
}

int getShuffleCount(int size){
    if(size < 2){
        return 1;
    }
    int mod = ((size/2)*2) + 1;
    int count = 1;
    uint64_t stuff = 2;
    while(stuff != 1){
        stuff = stuff << 1;
        stuff %= mod;
        ++count;
    }
    return count;
}

int main(int argc, char** argv){
    if(argc != 2){
        std::cerr << "Please enter exactly one number";
        exit(1);
    }
    int size = atoi(argv[1]);
    if(size < 0){
        std::cerr << "uh oh weird number" << "\n";
        exit(1);
    }
    std::cout << "deck size        shuffle count\n";
    std::cout << "------------------------------\n";
    for(int deckSize = 1; deckSize <= size; ++deckSize){

        
        List D;
        int count = 1;
        for(int i = 0; i < deckSize; ++i){
            
            D.insertBefore(i);
        }
        List Dcopy = D;
        shuffle(D);
        while( !(D == Dcopy) ){
            ++count;
            shuffle(D);
        }
        
        if(count != getShuffleCount(deckSize)){
            std::cout << "Universe Collapsing, Math is wrong\n";
            exit(1);
        }
        printf(" %-16d %d\n",deckSize, count);
        }

    return 0;
}
