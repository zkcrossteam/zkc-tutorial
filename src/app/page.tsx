'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  withZKCWeb3MetaMaskProvider,
  ZKCWasmServiceHelper,
  ZKCWasmServiceUtil,
  ZKCWeb3MetaMaskProvider,
} from 'zkc-sdk';

import wasmExample from '../examples/dice-game/demo/c/dice-game.wasm';
import { WasmSDK } from '../initWasm/wasmSDK';
import styles from './page.module.css';

export interface ZKWasmExample {
  setBoard: (input: number) => void;
  getBoard: (index: number) => number;
  getResult: () => number;
  init: () => void;
}

const MyReactDice = dynamic(() => import('../components/MyReactDice'), {
  ssr: false,
});

const zkcWasmServiceHelperBaseURI =
  'https://zkwasm-explorer.delphinuslab.com:8090';

const TUTORIAL_MD5 = '665272C6FD6E4148784BF1BD2905301F';

export default function Home() {
  const [userAddress, setUserAddress] = useState('');

  const [diceArr, setDiceArr] = useState<number[]>([0, 0, 0]);
  const [sum, setSum] = useState(0);

  // private inputs
  const witness = useMemo(
    () => [
      `0x${diceArr.length.toString(16)}:i64`,
      `0x${diceArr
        .map(value => value.toString(16).padStart(2, '0'))
        .join('')}:bytes-packed`,
    ],
    [diceArr],
  );

  const publicInputs = useMemo(() => [`0x${sum.toString(16)}:i64`], [sum]);

  useEffect(() => {
    WasmSDK.connect<ZKWasmExample>(wasmExample).then(
      ({ exports: { init, setBoard, getResult } }) => {
        init();
        diceArr.forEach(setBoard);
        setSum(getResult);
      },
    );
  }, [diceArr]);

  // Connect Metamask
  const onConnect = () =>
    withZKCWeb3MetaMaskProvider(async provider => {
      const acc = await provider.connect();
      setUserAddress(acc);
    });

  // play Dice Game
  const onRollDone = (values: number[]) => {
    setDiceArr(() => [...values]);
    console.log('individual die values array:', values);
  };

  // submit ZK Proof
  const onSubmit = () =>
    withZKCWeb3MetaMaskProvider(async provider => {
      // Whether the wallet has been connected
      if (!userAddress) return alert('Please connect your wallet.');

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
      let signature: string;
      try {
        signature = (await (provider as ZKCWeb3MetaMaskProvider).sign(
          msgHexString,
        )) as string;
      } catch (error: unknown) {
        console.error('error signing message', error);
        return alert('Unsigned Transaction');
      }

      const endpoint = new ZKCWasmServiceHelper(zkcWasmServiceHelperBaseURI);
      // Submit task
      const res = await endpoint.addProvingTask({
        ...info,
        signature,
      });

      console.log('addProvingTask response:', res);
      alert('AddProvingTask Success');
    });

  return (
    <main
      className={`d-flex flex-column justify-content-evenly align-items-center ${styles.main}`}
    >
      <div>
        <h1 className="text-center pb-2">Dice Game</h1>
        <p>
          You can click the <kbd>play now</kbd> button to generate an array of
          the dices and click the <kbd>Submit ZK Proof</kbd> button to submit ZK
          proof.
        </p>
      </div>
      <div className="d-flex flex-column justify-content-center align-items-center py-5">
        {userAddress ? (
          <address className="mb-3">userAddress: {userAddress}</address>
        ) : (
          <button className="mb-3 p-1 shadow-sm" onClick={onConnect}>
            Connect Wallet
          </button>
        )}

        <MyReactDice rollDone={onRollDone} />

        <ul>
          <li>
            The values of your dices are{' '}
            {diceArr.map((value, index, { length }) => (
              <span key={index}>
                <strong>{value}</strong>
                {index < length - 1 ? ', ' : ''}
              </span>
            ))}
            .
          </li>
          <li>
            The sum is <strong>{sum}</strong>.
          </li>
          <li>
            The image md5 is <code>{TUTORIAL_MD5}</code>.
          </li>
          <li>
            The public input is: <code>{publicInputs[0]}</code>.
          </li>
          <li>
            The private inputs(witness) are:{' '}
            {witness.map((value, index, { length }) => (
              <span key={value}>
                <code>{value}</code>
                {index < length - 1 ? ', ' : ''}
              </span>
            ))}
            .
          </li>
        </ul>

        <button className="mt-3 p-1 shadow-sm" onClick={onSubmit}>
          Submit ZK Proof
        </button>
      </div>
    </main>
  );
}
