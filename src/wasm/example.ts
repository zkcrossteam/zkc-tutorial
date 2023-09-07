import makeWasm from './example.wasm';
import { WasmModule } from './types';

const { Memory, Table } = WebAssembly;

let instance: WasmModule['instance'];

export interface WasmAPI {
  setBoard: (input: number) => void;
  getBoard: (index: number) => number;
  getResult: () => number;
  init: () => void;
}

async function initWasm<T = unknown>() {
  if (instance != null) return instance.exports as T;

  const wasmModule = await makeWasm({
    global: {},
    env: {
      memory: new Memory({ initial: 10, maximum: 100 }),
      table: new Table({ initial: 0, element: 'anyfunc' }),
      abort: () => {
        console.error('abort in wasm!');
        throw new Error('Unsupported wasm api: abort');
      },
      require: b => {
        if (!b) {
          console.error('require failed');
          throw new Error('Require failed');
        }
      },
      wasm_input: () => {
        console.error('wasm_input should not been called in non-zkwasm mode');
        throw new Error('Unsupported wasm api: wasm_input');
      },
    },
  });

  console.log('module loaded', wasmModule);

  /*
  WebAssembly.instantiateStreaming(makeWasm, importObject).then(
      (obj) => console.log(obj.instance.exports)
  );
  */

  instance = wasmModule.instance;

  return instance.exports as T;
}

export default initWasm;
