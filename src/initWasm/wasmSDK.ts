import { InitWasm, MakeWasmOptions } from '../examples/examples';

const { Memory, Table } = WebAssembly;

export const DEFAULT_OPTIONS: MakeWasmOptions = {
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
};

export class WasmSDK<T> {
  constructor(
    public exports: T,
    public options = DEFAULT_OPTIONS,
  ) {}

  static async connect<T>(initWasm: InitWasm, options = DEFAULT_OPTIONS) {
    const wasmModule = await initWasm(options);

    return new WasmSDK<T>(wasmModule.instance.exports as T, options);
  }
}
