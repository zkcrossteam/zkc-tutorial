# Hello World!

## Overview

This is a tutorial that implements Hello World in C and WebAssembly.

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

### Implementation

1.  Create a file called `hello-world.c` :

```c
__attribute__((visibility("default"))) int add(int a, int b)
{
  return a + b;
}
```

2.  Compile that into a wasm module which will output a `hello-world.wasm` :

```shell
clang --target=wasm32 --no-standard-libraries -Wl,--export-all -Wl,--no-entry -o hello-world.wasm hello-world.c
```

3.  Import ZKC-SDK and `hello-world.wasm` in `index.js`

```javascript
import { WasmSDK } from '../../initWasm/wasmSDK';
import helloWorldExample from './demo/c/hello-world.wasm';
```

4.  Load wasm module instance and call the add function export from wasm

```javascript
const runWasmAdd = async () => {
  // load wasm module instance
  const { exports } = await WasmSDK.connect(helloWorldExample);

  // Call the Add function export from wasm, save the result
  const addResult = exports.add(24, 24);

  // Set the result onto the body
  document.body.textContent = `Hello World! addResult: ${addResult}`;
};

runWasmAdd();
```

5.  Load `index.js` file in `index.html`:

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