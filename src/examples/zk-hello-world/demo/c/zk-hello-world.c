#include <stdint.h>
#include <stdbool.h>
#include <zkwasmsdk.h>

int luckyNumber=42;

__attribute__((visibility("default"))) bool getLucky(int a)
{
  return luckyNumber==a;
}

__attribute__((visibility("default")))
int zkmain() { 
  
  int pubInput = (int)wasm_input(1);

  int privateInput = (int)wasm_input(0);
  // Validate input
  require(getLucky(pubInput) && getLucky(privateInput));

  return 0;
}
