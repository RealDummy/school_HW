
/*
 * Sam Wortzman
 * CruzID: swortzma
 * Assignment: pa4
 */


#include "List.h"


List::Node* List::exchange(List::Node* &o, List::Node* n)const{
    List::Node* oldval = o;
    o = n;
    return oldval;

}

void preFailed(const char* fnName, const char* preCondition){
    std::cerr << "List Error: Calling " << fnName << " on " << preCondition << "\n";
    exit(1);
 }

List::Node::Node(int x){
    data = x;
    next = nullptr;
    prev = nullptr;
};

List::List(){
    frontDummy = new Node(0);
    backDummy =  new Node(0);
    frontDummy->next = backDummy;
    backDummy->prev = frontDummy;
    pos_cursor = 0;
    num_elements = 0;
    beforeCursor = frontDummy;
    afterCursor = backDummy;
}
// Copy constructor.
List::List(const List& L){
    frontDummy = new Node(0);
    backDummy = new Node(0);
    frontDummy->next = backDummy;
    backDummy->prev = frontDummy;
    beforeCursor = frontDummy;
    afterCursor = backDummy;
    pos_cursor = 0;
    num_elements = 0;

    Node* n = L.frontDummy->next;

    while(n != L.backDummy){
        insertBefore(n->data);
        n = n->next;
    }
    moveFront();
    /*
    for(int i = 0; i < L.position(); ++i){
        moveNext();
    }*/

}
/*
List::List(List &&L){
    frontDummy = L.frontDummy;
    L.frontDummy = nullptr;
    backDummy = L.backDummy;
    L.backDummy = nullptr;
    beforeCursor = L.beforeCursor;
    L.beforeCursor = nullptr;
    afterCursor = L.afterCursor;
    L.afterCursor = nullptr;
    pos_cursor = L.pos_cursor;
    num_elements = L.num_elements; 
}
*/
// Destructor
List:: ~List(){
    Node* n = frontDummy;
    while(n){
        delete exchange(n,n->next);
    }
}
bool List::isEmpty() const{
    return (num_elements == 0);
}
int List::size() const{
    return num_elements;
}
int List::position() const{
    return pos_cursor;
}
void List::moveFront(){
    pos_cursor = 0;
    beforeCursor = frontDummy;
    afterCursor = frontDummy->next;
}
void List::moveBack(){
    pos_cursor = num_elements;
    afterCursor = backDummy;
    beforeCursor = backDummy->prev;
}
int List::peekNext() const{
    if(afterCursor->next){
        return afterCursor->data;
    }
    preFailed("peekNext","a cursor at the end of List");
    return -1; //wont ever get here, just making compiler shut up
}
int List::peekPrev() const{
     if(beforeCursor->prev){
        return beforeCursor->data;
    }
    preFailed("peekPrev","a cursor at the front of List");
    return -1; //wont ever get here, just making compiler shut up
}

int List::moveNext(){
     if(pos_cursor == num_elements){
        preFailed("moveNext","a cusor at the end of List");
     }
     ++pos_cursor;
     beforeCursor = exchange(afterCursor,afterCursor->next);
     return beforeCursor->data;
}
int List::movePrev(){
    if(pos_cursor == 0){
        preFailed("movePrev","a cusor at the front of List");
    }
    --pos_cursor;
    afterCursor = exchange(beforeCursor, beforeCursor->prev);
    return afterCursor->data;
}

//helper function for insertBefore/After
void List::insertNode(Node* b, Node* i, Node* a){
    i->prev = b;
    b->next = i;
    i->next = a;
    a->prev = i;
}
void List::insertAfter(int x){
    Node* nn = new Node(x);
    insertNode(beforeCursor,nn,afterCursor);
    afterCursor = nn;
    ++num_elements;
}
void List::insertBefore(int x){
    Node* nn = new Node(x);
    insertNode(beforeCursor,nn,afterCursor);
    beforeCursor = nn;
    ++num_elements;
    ++pos_cursor;
}
void List::eraseAfter(){
    if(pos_cursor == num_elements){
        preFailed("eraseAfter","a cusor at the back of List");
    }
    Node* removed = afterCursor;
    afterCursor = afterCursor->next;
    beforeCursor->next = afterCursor;  
    afterCursor->prev = beforeCursor;

    --num_elements;
    delete removed;
}
void List::eraseBefore(){
    if(pos_cursor == 0){
        preFailed("eraseBefore","a cusor at the front of List");
    }
    Node* removed = beforeCursor;
    beforeCursor = beforeCursor->prev;
    afterCursor->prev = beforeCursor;
    beforeCursor->next = afterCursor;

    --pos_cursor;
    --num_elements;
    delete removed;
}
int List::findNext(int x){
    while(afterCursor != backDummy){
        if(moveNext() == x){
            return pos_cursor;
        }
    }
    return -1;
}
int List::findPrev(int x){
    while(beforeCursor != frontDummy){
        if(movePrev() == x){
            return pos_cursor;
        }
    }
    return -1;
}
class MicroHash{
private:
    struct Node{
        int val;
        Node* next = nullptr;
        Node(int v):val{v},next{nullptr}{};
        
    };
    const static uint8_t mixTable[256];
    Node** m_table;
    int m_size;

    //Pearson Hash
    unsigned int hash(int n){
        //1 byte bitMask
        unsigned int bitMask = 0xff;
        unsigned int h = 0;
        for(uint8_t i = 0; i < sizeof(int); ++i){
            uint8_t byte = n & (bitMask << (i*8)); //get byte ith of n. Works diff on big/little endian probably.
            h = mixTable[byte ^ h]; //jumble 
        }
        return h;
    }
public:
    MicroHash(int n){
        m_size = n;
        m_table = new Node*[m_size];
        for(int i = 0; i < m_size; ++i){
            m_table[i] = nullptr;
        }
    }
    ~MicroHash(){
        
        for(int i = 0; i < m_size; ++i){
            if(m_table[i]){      
                Node* temp = m_table[i];
                Node* prev;
                while(temp){
                    prev = temp;
                    temp = temp->next;
                    delete prev;
                }
            }
        }
        
        delete[] m_table;
    }

    //returns true if its in table, adds it to table and returns false otherwise
    bool operator[](int n){
        int k = hash(n)%m_size;
        Node* node = m_table[k];
        while(node){
            if(node->val == n){
                return true;
            }
            if(node->next){
                node = node->next;
            }
            else{
                node->next = new Node(n);
                return false;
            }
        }
        m_table[k] = new Node(n);
        return false;
    }
};

//table for xor shenanigans, from mr. Perlin of noise fame (i think).
const uint8_t MicroHash::mixTable[256] = {151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 
    103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 
    26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 
    87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 
    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 
    187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 
    198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 
    170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 
    172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 
    104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 
    241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 
    157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 
    93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180};


void List::cleanup(){
    if(num_elements < 2){
        return;
    }
    MicroHash HT(num_elements);
    Node* n = frontDummy->next;
    int count = 0;
    while( (n != backDummy) ){
        //if in hashtable, otherwise add it
        if(HT[n->data]){
            Node* prev = n->prev;
            Node* next = n->next;
            
            prev->next = next;
            
            next->prev = prev;
            if(n == beforeCursor){
                beforeCursor = prev;
            }
            else if(n == afterCursor){
                afterCursor = next;
            }
            delete n;
            n = next;
            --num_elements;
            
            if(count < pos_cursor){
                --pos_cursor;
            }
        }
        else{
            n = n->next;
            ++count;
        }
    }
}
void List::clear(){
    moveFront();
    while(num_elements != 0){

        eraseAfter();
    }
}
List List::concat(const List& L) const{
    //copy this to C;
    List C = *this;
    C.moveBack();
    Node* n = L.frontDummy->next;
    //add L's stuff to C
    while(n != L.backDummy){
        C.insertBefore(n->data);
        n = n->next;
    }

    //NRVO will construct this object in place
    return C;
}

//digit to ascii
char dtoa(int i){
    return static_cast<char>(i + '0');
}

//counts the exact number of characters for to_string purposes. we hate reallocs!
unsigned long int List::countChars() const{
    Node* n = frontDummy;
    unsigned long int count = 0;
    while(n){
        
        int x = n->data;
        //add 1 for negative sign
        if(x < 0){
            ++count;
        }
        //count # of digits
        while(x != 0){
            x = x / 10;
            ++count;
        }
        n = n->next;
    }
    return count;
}
//reverse a string, because the numbers get assembled backwards
void reverse(std::string& str){
    size_t len = str.length();
    size_t halflen = len/2;
    for(size_t i = 0; i < halflen; ++i){
        char tc = str[i];
        str[i] = str[len-i-1];
        str[len-i-1] = tc;
    }
}

//const because it can be
std::string List::to_string() const{
    
    std::string res("(");
    
    res.reserve(countChars() + 2*num_elements + 2);
    
    //loop through list w/o touching cursor
    Node* n = frontDummy->next;
    while(n != backDummy){
        int x = n->data;
        //add negative sign and turn it positive
        if( x < 0 ){
            res += '-';
            x = std::abs(x);
        }
        // add 0 if x == 0 because 0 is false
        if(x == 0){
            res += '0';
        }
        else{
            //create flipped string of number
            std::string tmp;
            while(x){
                tmp += dtoa(x%10);
                x /= 10;
            }
            //flip string
            reverse(tmp);
            res += tmp;
        }
        n = n->next;
        if(n != backDummy){
            res += ", ";
        }
    }
    res += ")";
    return res;
    
}
//probably should have used this for the implimentationi of ==...
bool List::equals(const List& R) const{
     return *this == R;
}

std::ostream& operator<<( std::ostream& stream,const List& L ){
     return ( stream << L.to_string() );
}

//compares all elements to see if they all match
bool operator==(const List& A, const List& B ){
    if(A.num_elements != B.num_elements){
         return false;
    }
    List::Node* na = A.frontDummy->next;
    List::Node* nb = B.frontDummy->next;
    while(na != A.backDummy){
        //std::cout << "opereator=";
        if(na->data != nb->data){
            return false;
        }
        na = na->next;
        nb = nb->next;
    }
    return true;
 }

//assignment copy thingy
List& List::operator=( const List& L ){
    if(this == &L){
        return *this;
    }
    Node* lhs_ptr = frontDummy->next;
    Node* rhs_ptr = L.frontDummy->next;
    while(lhs_ptr != backDummy && rhs_ptr != L.backDummy && 
        lhs_ptr->data == rhs_ptr->data){
        
        lhs_ptr = lhs_ptr->next;
        rhs_ptr = rhs_ptr->next;
    }
    while(rhs_ptr != L.backDummy && lhs_ptr != backDummy){
        lhs_ptr->data = rhs_ptr->data;
        lhs_ptr = lhs_ptr->next;
        rhs_ptr = rhs_ptr->next;
    }
    
    if(lhs_ptr != backDummy){
        Node* lastNode = lhs_ptr->prev;
        while(lhs_ptr != backDummy){
            delete exchange(lhs_ptr,lhs_ptr->next);
        }
        lhs_ptr->prev = lastNode;
        lastNode->next = lhs_ptr;
    }
    
    if(lhs_ptr != backDummy){
        puts("oh no");
    }
    while(rhs_ptr != L.backDummy){
        Node* nn = new Node(rhs_ptr->data);
        insertNode(lhs_ptr->prev,nn,lhs_ptr);
        rhs_ptr = rhs_ptr->next;
    }
    num_elements = L.num_elements;
    moveFront();
    /*
    for(int i = 0; i < L.position(); ++i){
        moveNext();
    }
    */
    return *this;
} 

