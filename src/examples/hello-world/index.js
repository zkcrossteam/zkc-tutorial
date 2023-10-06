import { WasmSDK } from '../../initWasm/wasmSDK';
import helloWorldExample from './demo/c/hello-world.wasm';

const runWasmAdd = async () => {
  // load wasm module instance
  const { exports } = await WasmSDK.connect(helloWorldExample);

  // Call the Add function export from wasm, save the result
  const addResult = exports.add(24, 24);

  // Set the result onto the body
  document.body.textContent = `Hello World! addResult: ${addResult}`;
};

runWasmAdd();
