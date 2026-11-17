import { useEffect, useRef, useState } from 'react';

/**
 * Counts down `seconds` while the tab is visible and calls onDone once. If the student
 * switches tabs the clock pauses, so a timed study item is not silently skipped.
 * Returns the seconds left, rounded up. Pass a new `key` to start over for a new item.
 */
export function useCountdown(seconds: number, onDone: () => void, key: string | number): number {
  const [tick, setTick] = useState<{ key: string | number; left: number }>({ key, left: seconds });
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const thisKey = key;
    let done = false;
    let remainingMs = seconds * 1000;
    let last = performance.now();
    let id = 0;
    const tickFn = () => {
      const now = performance.now();
      if (document.visibilityState === 'visible') remainingMs -= now - last;
      last = now;
      setTick({ key: thisKey, left: Math.max(0, Math.ceil(remainingMs / 1000)) });
      if (remainingMs <= 0) {
        if (!done) {
          done = true;
          onDoneRef.current();
        }
        return;
      }
      id = window.setTimeout(tickFn, Math.min(250, remainingMs));
    };
    id = window.setTimeout(tickFn, Math.min(250, remainingMs));
    return () => window.clearTimeout(id);
  }, [seconds, key]);

  return tick.key === key ? tick.left : seconds;
}

/** Re-renders every `ms` so "due today" style text stays fresh while a page is open. */
export function useClock(ms = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
