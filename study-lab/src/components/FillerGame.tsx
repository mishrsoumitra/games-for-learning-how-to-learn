import { useCallback, useEffect, useMemo, useState } from 'react';
import { Rng } from '../lib/rng.ts';
import { useCountdown } from './useTicker.ts';

interface Props {
  seconds: number;
  seed: number;
  onDone: () => void;
}

/**
 * A short break between study and test, like the 45 seconds of Tetris in Kornell and Bjork
 * (2008). It clears the last few items out of working memory so the test measures what
 * was learned, not what is still echoing. Tap the bigger of two numbers.
 */
export function FillerGame({ seconds, seed, onDone }: Props) {
  const rng = useMemo(() => new Rng(seed), [seed]);
  const [pair, setPair] = useState<[number, number]>(() => makePair(rng));
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const left = useCountdown(seconds, onDone, seed);

  const answer = useCallback(
    (picked: number) => {
      if (picked === Math.max(pair[0], pair[1])) setScore((s) => s + 1);
      else setMisses((m) => m + 1);
      setPair(makePair(rng));
    },
    [pair, rng],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') answer(pair[0]);
      if (e.key === 'ArrowRight') answer(pair[1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, pair]);

  return (
    <div className="stack" style={{ width: '100%', maxWidth: 520 }}>
      <p>
        A short break before the test. Tap the bigger number, as fast as you can. {left} seconds
        left.
      </p>
      <div className="grid-2">
        <button type="button" className="choice" onClick={() => answer(pair[0])}>
          <span className="big-number">{pair[0]}</span>
        </button>
        <button type="button" className="choice" onClick={() => answer(pair[1])}>
          <span className="big-number">{pair[1]}</span>
        </button>
      </div>
      <p className="small muted">
        Right: {score}. Wrong: {misses}. (Left and right arrow keys work too.)
      </p>
    </div>
  );
}

function makePair(rng: Rng): [number, number] {
  const a = rng.int(10, 99);
  let b = rng.int(10, 99);
  while (b === a) b = rng.int(10, 99);
  return [a, b];
}
