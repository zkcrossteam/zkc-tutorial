#include <stdio.h>

__attribute__((visibility("default")))
int helloWorld() {
  printf("hello, world!\n");
  return 0;
}

__attribute__((visibility("default")))
int add(int a,int b) {
  return a + b;
}



