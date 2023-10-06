import {
  withZKCWeb3MetaMaskProvider,
  ZKCWasmServiceHelper,
  ZKCWasmServiceUtil,
} from 'zkc-sdk';

import { WasmSDK } from '../../initWasm/wasmSDK';
import ZKHelloWorldExample from './demo/c/zk-hello-world.wasm';

const zkcWasmServiceHelperBaseURI =
    'https://zkwasm-explorer.delphinuslab.com:8090',
  TUTORIAL_MD5 = '665272C6FD6E4148784BF1BD2905301F';

withZKCWeb3MetaMaskProvider(async provider => {
  // Whether the wallet has been connected
  if (!userAddress) return alert('Please connect your wallet.');

  // load wasm module instance
  const { exports } = await WasmSDK.connect(ZKHelloWorldExample);

  // Call the Add function export from wasm, save the result
  const checkLucky = exports.getLucky(42);

  if (!checkLucky) return;

  // private and public inputs
  const witness = 42,
    publicInputs = 42;

  // Signed information
  const info = {
    user_address: userAddress.toLowerCase(),
    md5: TUTORIAL_MD5,
    public_inputs: publicInputs,
    private_inputs: witness,
  };

  // Signed string
  const msgHexString = ZKCWasmServiceUtil.createProvingSignMessage(info);

  // Send a signature request
  let signature;
  try {
    signature = await provider.sign(msgHexString);
  } catch (error) {
    console.error('error signing message', error);
    return alert('Unsigned Transaction');
  }

  const endpoint = new ZKCWasmServiceHelper(zkcWasmServiceHelperBaseURI);

  const response = await endpoint.addProvingTask({
    ...info,
    signature,
  });

  console.log('addProvingTask response:', response);
  alert('AddProvingTask Success');

  // Set the result onto the body
  document.body.textContent = `Hello World! ZK Proof: ${response}`;
});
