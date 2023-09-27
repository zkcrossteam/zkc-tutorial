#include <stdint.h>
#include <zkwasmsdk.h>

int result = 0;

int times = 0;

int board[3] = {0, 0, 0};

__attribute__((visibility("default")))
void setBoard(int input) {
  if(times > 3) return;

  board[times] = input;
  times++;
  result += input;
}

__attribute__((visibility("default")))
int getBoard(int index) {
  return board[times];
}

__attribute__((visibility("default")))
int getResult() {
  return result;
}

__attribute__((visibility("default")))
void init() {
  for(int i = 0; i < 3; i++) {
    board[i] = 0;
  }
  times = 0;
  result = 0;
}

uint8_t dices[3];

__attribute__((visibility("default")))
int zkmain() { 
  // read the first public input, like 0x[0-f]*:i64
  // e.g. 0x12:i64
  int pubInput = (int)wasm_input(1);

  // read the first private input, like 0x[0-f]*:i64
  // e.g. 0x3:i64
  int len = (int)wasm_input(0);
  // read the second private input, like 0x[0-f]*:bytes-packed
  // e.g. 0x060606:bytes-packed
  read_bytes_from_u64(dices, len, 0);

  init();
  for(int i = 0; i < 3; i++){
    setBoard(dices[i]);
  }

  // Validate input
  require(pubInput == result);

  return 0;
}
