declare module '*.wasm' {
  const initWasm: (
    makeWasmOptions: import('./examples/examples').MakeWasmOptions,
  ) => Promise<import('./examples/examples').WasmModule>;

  export default initWasm;
}

/** A 32-bit signed integer. */
declare type i32 = number;