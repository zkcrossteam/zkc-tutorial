declare module '*.wasm' {
  const initWasm: (
    makeWasmOptions: import('./types').MakeWasmOptions,
  ) => Promise<import('./types').WasmModule>;

  export default initWasm;
}
