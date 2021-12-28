
INC := graph.h disjointset.h
SRC := graph.cpp

MAIN := mwst.cpp
TARGET := MWST

TEST_MAIN := tester.cpp
TESTER := tester


TESTCMD := ./$(TESTER)

RUNCMD := ./$(TARGET) graphIn.txt graphOut.txt


COMPILER := clang++
STD := c++17
FLAGS := --std=$(STD) -Wall -Wextra

#compile object files
%.o : %.cpp $(INC)
	$(COMPILER) -c $< $(FLAGS) -o $@

.DEFAULT_GOAL := $(TARGET)

$(TARGET) : $(patsubst %.cpp, %.o, $(SRC) $(MAIN)) $(INC)
	$(COMPILER) $(filter %.o,$^) $(FLAGS) -o $@

$(TESTER) : $(patsubst %.cpp, %.o, $(SRC) $(TEST_MAIN)) $(INC)
	$(COMPILER) $(filter %.o,$^) $(FLAGS) -o $@.out


.PHONY : clean all test run

clean : 
	rm -f $(patsubst %.cpp,,$(patsubst %.cpp,%.o,$(SRC)) $(TARGET) $(TARGET).o $(TESTER).out $(TESTER).o)

all : $(TARGET) $(TESTER)

test : $(TESTER)
	$(TESTCMD)
run : $(TARGET)
	$(RUNCMD)