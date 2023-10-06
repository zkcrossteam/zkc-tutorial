# ZKC-Tutorial

> A simple demo of [ZKC-SDK][1].

## Technology Stack

- Front end
  - Language: [TypeScript v5][2]
  - Component engine: [React v18][3]
  - Application framework: [Next.js v13][4]
  - CSS utility class: [Bootstrap v5][5]
  - Package management tool: [pnpm][6]
  - CI / CD: [GitHub Actions][7] + [Vercel][8]
- WASM
  - Language: [C][9]
  - Compilation tool: [Clang][10]

## How To Run This Repository

```shell
git clone https://github.com/zkcrossteam/ZKC-Tutorial.git

cd ZKC-Tutorial
```

> **Notice:** If you want to compile WASM, it is **strongly recommended** that you pass the `--recurse-submodules` argument when executing the `git clone` command line (`git clone --recurse-submodules https://github.com/zkcrossteam/ZKC-Tutorial.git`).

### Website

If you want to run the website project, please install [Node.js][11] and [pnpm][12].

```shell
pnpm i

pnpm dev
```

### WASM

If you want to compile WASM, please install [Clang][13] and related software.

Because this repository's SDK uses Git submodules, cloning the SDK code is required. If you did not use `--recurse-submodules` during cloning this repository, use the following command to clone the submodule:

```shell
git submodule update --init
```

Make sure that the clang commands in all makefiles are the same as those used to execute clang locally.

> **Tips:** You can search for `CLANG` to check the settings of the clang command in the Makefile.

```shell
cd src/wasm

make
```

## From Zero to Hero

In this section, we will provide a brief description of how to build this project. It is assumed that the reader is familiar with the C programming language and the front-end development environment. Basic concepts will not be covered in detail. For additional information about setting up the project's development environment, please refer to the document "[How to run this repository][14]".

### Project Design

This project will implement a dice game, in which the sum of the dice will be used as public input, and some values will be passed as witness (private inputs).

### WASM

#### Add SDK

First, you need to add the C SDK repository to the project, either directly in the project root folder by cloning it, or you can add the SDK repository as a Git submodule to the project.

If you want to clone the repository, execute the following command:

```shell
git clone git@github.com:zkcrossteam/zkWasm-C.git
```

If you want to add submodules, execute the following command:

```shell
git submodule add git@github.com:zkcrossteam/zkWasm-C.git
```

#### Writing C Language Files and Makefile

Create a WASM folder and create C language files (such as `example.c`) and a Makefile in the folder.

In a C file, You need to include `<zkwasmsdk.h>` header file:

```c
#include <zkwasmsdk.h>
```

You can create functions that can be called by external JavaScript by decorating `__attribute__((visibility("default")))` before the function definition. Here is an example:

```c
__attribute__((visibility("default")))
void setBoard(int input) {
  if(times > 3) return;

  board[times] = input;
  times++;
  result += input;
}
```

`zkmain` is a required function that will be called for data validation each time zk proof is submitted. This function needs to be modified by `__attribute__((visibility("default")))`. Here is the `zkmain` funtion in this project:

```c
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
```

You'll notice that `wasm_input`, `read_bytes_from_u64`, and `require` are called in `zkmain`.

`wasm_input` is a function used to get public input and witness, one value at one time. Public input can be read when its argument is `1`, and witness can be read when its argument is `0`.

The `read_bytes_from_u64` function, which takes three arguments, can read public input and witness of type `bytes-packed`. The first argument is a pointer to an array to record the read data, the second argument is the length of the read, and the third argument is `1` to read the public input and `0` to read witness. Each element in the array can store only one two-bytes data.

For example, public input(witness) is `0x01020304:bytes-packed` and the array is `{0x01, 0x02, 0x03, 0x04}`. If the length of the array is longer than the data to be read, the remaining elements are filled with `0`; otherwise, there is no read overflow.

The `require` function can take in a logical operation statement, which can only pass the verification if the logical operation statement is `true`, otherwise the verification will fail.

The Makefile file can be populated with the following:

```makefile
LIBS  = -lkernel32 -luser32 -lgdi32 -lopengl32
SDKDIR = ../../zkWasm-C
CFLAGS = -Wall -I$(SDKDIR)/sdk/c/sdk/include/ -I$(SDKDIR)/sdk/c/hash/include/

# Should be equivalent to your list of C files, if you don't build selectively
CFILES = $(wildcard *.c)
ifeq ($(CLANG),)
CLANG=clang
endif
FLAGS = -flto -O3 -nostdlib -fno-builtin -ffreestanding -mexec-model=reactor --target=wasm32 -Wl,--strip-all -Wl,--initial-memory=131072 -Wl,--max-memory=131072 -Wl,--no-entry -Wl,--allow-undefined -Wl,--export-dynamic

all: example.wasm

sdk.wasm:
    sh $(SDKDIR)/sdk/scripts/build.sh sdk.wasm

example.wasm: $(CFILES) sdk.wasm
    $(CLANG) -o $@ $(CFILES) sdk.wasm $(FLAGS) $(CFLAGS)


clean:
    sh $(SDKDIR)/sdk/scripts/clean.sh
    rm -f *.wasm *.wat
```

You also need to make the following changes to the above:

1.  `SDKDIR` should point to the SDK directory that you downloaded earlier.
2.  `CLANG` should be consistent with local Clang command.

    > The `CLANG` specified in all Makefile files in the SDK should be consistent with the local Clang command. You can check this by searching for `CLANG`.

3.  You can replace `example.wasm` with the name of the file you want to generate.

#### Make

Open the directory where the command line tool created the makefile file in the previous step, and execute the following command:

```shell
make
```

### Front End

You need to make the following changes to the above file:

1.  Confirm whether the import source file of `makeWasm` points to the previously created WASM;

#### Call Function in WASM at The Front End

Here is an example of calling `initWasm` on the front-end page:

```typescript
import wasmExample from '../examples/dice-game/demo/c/dice-game.wasm';
import { WasmSDK } from '../initWasm/wasmSDK';

WasmSDK.connect<ZKWasmExample>(wasmExample).then(
  ({ exports: { init, setBoard, getResult } }) => {
    init();
    diceArr.forEach(setBoard);
    setSum(getResult);
  },
);
```

#### Build Public Inputs And Witness

Public inputs and witness allow three data types: `i64`, `bytes`, and `bytes-packed`. Each data needs to end with a `:` and type.

The data of `i64` is read at one time through `wasm_input` in `zkmain`.

#### Add task Through `zkc-sdk`

First, you need to install `zkc-sdk`:

```shell
npm i zkc-sdk

# or
yarn add zkc-sdk

# or
pnpm add zkc-sdk
```

Then, create a task object:

```ts
const info = {
  user_address: userAddress.toLowerCase(),
  md5,
  public_inputs: publicInputs,
  private_inputs: witness,
};
```

`user_address` is the wallet address of the signed user, which needs to be in full **lowercase**; `md5` is the ID of the application, which requires all **uppercase**; `public_inputs` and `private_inputs` are arrays.

Call the static method of SDK to convert the task to a string:

```ts
const msgHexString = ZKCWasmServiceUtil.createProvingSignMessage(info);
```

Create a digital signature:

```ts
const signature = await withZKCWeb3MetaMaskProvider(
  provider =>
    (provider as ZKCWeb3MetaMaskProvider).sign(msgHexString) as string,
);
```

Submit task to zk proof through SDK:

```ts
const endpoint = new ZKCWasmServiceHelper(zkcWasmServiceHelperBaseURI);

const res = await endpoint.addProvingTask({ ...info, signature });
```

> **Note:** Each time you add a task, the program deducts a certain amount of balance from the upload account of the application.

## More information

- [ZKCross Document][15] _(Website)_
- [Delphinus Tutorial 1: Create your first zkWasm application][16] _(Article)_
- [ZK9: Web3 game development utilizing zkWASM virtual machine – Sinka Gao (Delphinus Lab)][17] _(Video)_ [PPT][18] _(PPT)_

[1]: https://github.com/zkcrossteam/ZKC-SDK
[2]: https://www.typescriptlang.org/
[3]: https://react.dev/
[4]: https://nextjs.org/
[5]: https://getbootstrap.com/docs/5.3/utilities/api/
[6]: https://pnpm.io/
[7]: https://docs.github.com/en/actions
[8]: https://vercel.com/home
[9]: https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html
[10]: https://clang.llvm.org/
[11]: https://nodejs.org/en
[12]: https://pnpm.io/
[13]: https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html
[14]: https://git-pager.avosapps.us/#how-to-run-this-repository
[15]: http://docs.zkcross.org/
[16]: https://delphinuslab.com/2023/01/29/delphinus-tutorial-1-create-your-first-zkwasm-application/
[17]: https://www.youtube.com/watch?v=dLZbfTWLGNI
[18]: https://delphinuslab.com/2023/04/09/talk-was-given-in-zk-summit-9th-in-breakout-session/
