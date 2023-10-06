export interface MakeWasmOptions {
  global: Record<string, any>;
  env: {
    memory: WebAssembly.Memory;
    table: WebAssembly.Table;
    abort: () => never;
    require: (b: boolean | number) => void;
    wasm_input: () => never;
  };
}

export interface WasmModule {
  instance: WebAssembly.Instance;
  module: WebAssembly.Module;
}

export type InitWasm = (
  makeWasmOptions: MakeWasmOptions,
) => Promise<WasmModule>;
