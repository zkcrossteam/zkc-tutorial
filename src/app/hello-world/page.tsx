'use client'
import { useEffect, useState } from 'react';

import helloWasmExample from '../../examples/hello-world/c/helloWorld.wasm';
import { WasmSDK } from '../../initWasm/wasmSDK';

export interface HelloWorldExample {
  add: (a: number, b: number) => number;
  helloWorld: (a: number) => number;
}

export default function HelloWorld() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    WasmSDK.connect<HelloWorldExample>(helloWasmExample).then(
      ({ exports: { helloWorld } }) => {
        const messageArray = [];

        for (let i = 0; i < 12; i++) {
          messageArray[i] = helloWorld(i);
        }

        const message = String.fromCharCode(...messageArray);

        setMessage(message);
      },
    );
  });

  return <>{message}</>;
}
