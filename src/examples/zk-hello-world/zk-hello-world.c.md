# ZK Hello World!

## Overview

This is a tutorial that implements ZK Hello World in C and WebAssembly.

## Setup

### Prerequisite

#### [LLVM][1]

```shell
# for Mac
brew install llvm
# for win10
winget install -e --id LLVM.LLVM
```

> Please make sure that the system environment variables have been added successfully

#### [ZKC-SDK][2]

```shell
npm install zkc-sdk
```

#### Add zkWasm-C

First, you need to add the C SDK repository to the project, either directly in the project root folder by cloning it, or you can add the SDK repository as a Git submodule to the project.

If you want to clone the repository, execute the following command:

```shell
git clone git@github.com:zkcrossteam/zkWasm-C.git
```

If you want to add submodules, execute the following command:

```shell
git submodule add git@github.com:zkcrossteam/zkWasm-C.git
```

### Implementation

1.  Create a file called `zk-hello-world.c` :

```c
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
```

2.  Create a Makefile

```Makefile
LIBS  = -lkernel32 -luser32 -lgdi32 -lopengl32
SDKDIR = ../../../../../zkWasm-C
CFLAGS = -Wall -I$(SDKDIR)/sdk/c/sdk/include/ -I$(SDKDIR)/sdk/c/hash/include/
# Should be equivalent to your list of C files, if you don't build selectively
CFILES = $(wildcard *.c)
ifeq ($(CLANG),)
CLANG=clang
endif
FLAGS = -flto -O3 -nostdlib -fno-builtin -ffreestanding -mexec-model=reactor --target=wasm32 -Wl,--strip-all -Wl,--initial-memory=131072 -Wl,--max-memory=131072 -Wl,--no-entry -Wl,--allow-undefined -Wl,--export-dynamic

all: zk-hello-world.wasm

sdk.wasm:
    sh $(SDKDIR)/sdk/scripts/build.sh sdk.wasm

zk-hello-world.wasm: $(CFILES) sdk.wasm
    $(CLANG) -o $@ $(CFILES) sdk.wasm $(FLAGS) $(CFLAGS)

clean:
    sh $(SDKDIR)/sdk/scripts/clean.sh
    rm -f *.wasm *.wat

```

3.  Compile that into a wasm module which will output a `zk-hello-world.wasm` :

```shell
make
```

4.  Import ZKC-SDK and `hello-world.wasm` in `index.js`

```javascript
import { WasmSDK } from '../../initWasm/wasmSDK';
import helloWorldExample from './hello-world.wasm';
```

5.  Load wasm module instance and call the getLucky function export from wasm

```javascript
const zkcWasmServiceHelperBaseURI =
    'https://zkwasm-explorer.delphinuslab.com:8090',
  TUTORIAL_MD5 = '665272C6FD6E4148784BF1BD2905301F';

const runWasm = async () =>
  withZKCWeb3MetaMaskProvider(async provider => {
    // Whether the wallet has been connected
    if (!userAddress) return alert('Please connect your wallet.');

    // load wasm module instance
    const { exports } = await WasmSDK.connect(ZKHelloWorldExample);

    // Call the Add function export from wasm, save the result
    const checkLucky = exports.getLucky(42);

    if (!checkLucky) return;

    // private and public inputs
    const witness = 42,
      publicInputs = 42;

    // Signed information
    const info = {
      user_address: userAddress.toLowerCase(),
      md5: TUTORIAL_MD5,
      public_inputs: publicInputs,
      private_inputs: witness,
    };

    // Signed string
    const msgHexString = ZKCWasmServiceUtil.createProvingSignMessage(info);

    // Send a signature request
    let signature;
    try {
      signature = await provider.sign(msgHexString);
    } catch (error) {
      console.error('error signing message', error);
      return alert('Unsigned Transaction');
    }

    const endpoint = new ZKCWasmServiceHelper(zkcWasmServiceHelperBaseURI);

    const response = await endpoint.addProvingTask({
      ...info,
      signature,
    });

    console.log('addProvingTask response:', response);
    alert('AddProvingTask Success');

    // Set the result onto the body
    document.body.textContent = `Hello World! ZK Proof: ${response}`;
  });

runWasm();
```

Load `index.js` file in `index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World - AssemblyScript</title>
    <link rel="preload" href="./index.js" as="script" />
  </head>

  <body>
    <script type="module" src="./index.js"></script>
  </body>
</html>
```

## Demo

[1]: https://llvm.org/
[2]: https://github.com/zkcrossteam/ZKC-SDK
