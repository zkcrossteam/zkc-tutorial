# Hello World!

## Overview

This is a tutorial that implements Hello World in Assemblyscript.

## Setup

### Prerequisite

- [AssemblyScript Compiler](https://www.assemblyscript.org/compiler.html#using-the-compiler), which can be installed by executing:

```bash
npm install -g assemblyscript
```

- [ZKC-SDK](https://github.com/zkcrossteam/ZKC-SDK), which can be installed by executing:

```
npm install zkc-sdk
```

### Implementation

1. Create `hello-world.ts` AssemblyScript file:

```typescript
/**
 * @param a 32-bit integer
 * @param b 32-bit integer
 * @returns 32-bit interger
 */
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

2. Compile that into a wasm module which will output a `hello-world.wasm` :

```bash
asc hello-world.ts -o hello-world.wasm
```

3. Import ZKC-SDK and `hello-world.wasm` in `index.js`

```javascript
import { WasmSDK } from '../../initWasm/wasmSDK';
import helloWorldExample from './demo/assemblyscript/hello-world.wasm';
```

4. Load wasm module instance and call the add function export from wasm

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

5. Load `index.js` file in `index.html`:

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
