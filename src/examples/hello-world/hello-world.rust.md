# Hello World!

## Overview

This is a tutorial that implements Hello World in Rust and WebAssembly.

## Setup

### Prerequisite

#### The Rust toolchain

You will need the standard Rust toolchain, including rustup, rustc, and cargo.

[Follow these instructions to install the Rust toolchain.][1]

The Rust and WebAssembly experience is riding the Rust release trains to stable! That means we don't require any experimental feature flags. However, we do require Rust 1.30 or newer.

#### `wasm-pack`

wasm-pack is your one-stop shop for building, testing, and publishing Rust-generated WebAssembly.

Get [`wasm-pack`][2] here!

> If you are a Microsoft Windows 10 user, it is highly recommended to install [WSL2][3], everything will be much smoother!

#### [ZKC-SDK][4]

```shell
npm install zkc-sdk
```

### Implementation

1.  Initialize the project:

```shell
cargo init
```

2.  Edit our new Cargo.toml to implement wasm-pack

```toml
[package]
name = "hello-world"
version = "0.1.0"
authors = ["Your Name <your@email>"]
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

3.  Lastly, let's take a quick peek inside at the src/ directory. Since we are building a library (lib) to be used by a larger application, we need to rename the src/main.rs to src/lib.rs. Go ahead and do that now before moving forward.

Let's go ahead and replace src/lib.rs with the required use call as mentioned in the quickstart, as well as our add function:

```rs
// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use wasm_bindgen::prelude::*;

// Our Add function
// wasm-pack requires "exported" functions
// to include #[wasm_bindgen]
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    return a + b;
}
```

4.  Compile that into a wasm module which will output a `hello-world.wasm` :

```shell
wasm-pack build --target web
```

This will output a `pkg/` directory containing our wasm module, wrapped in a js object.

5.  Import ZKC-SDK and `hello-world.wasm` in `index.js`

```javascript
import { WasmSDK } from '../../initWasm/wasmSDK';
import helloWorldExample from './demo/rust/hello-world_bg.wasm';
```

6.  Load wasm module instance and call the add function export from wasm

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

7.  Load `index.js` file in `index.html`:

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

[1]: https://www.rust-lang.org/tools/install
[2]: https://rustwasm.github.io/wasm-pack/installer/
[3]: https://learn.microsoft.com/en-us/windows/wsl/install
[4]: https://github.com/zkcrossteam/ZKC-SDK
