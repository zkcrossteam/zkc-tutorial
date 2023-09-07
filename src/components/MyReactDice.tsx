import { useRef } from 'react';
import ReactDice, { ReactDiceRef } from 'react-dice-complete';

export interface MyReactDiceProps {
  rollDone: (diceValue: number[]) => any;
}

export default function MyReactDice({ rollDone }: MyReactDiceProps) {
  const reactDice = useRef<ReactDiceRef>(null);

  const rollAll = () => reactDice.current?.rollAll();

  return (
    <>
      <button className="mb-3 p-1 shadow-sm" onClick={rollAll}>
        <span>Play Now</span>
      </button>
      <ReactDice
        ref={reactDice}
        numDice={3}
        rollDone={(_, diceValues) => rollDone(diceValues)}
      />
    </>
  );
}
