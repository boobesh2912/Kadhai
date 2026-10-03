import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const tokenize = (text) => text.match(/\S+\s*/g) || [];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Reveals `text` one word at a time, like a model streaming its answer.
// `shown` is what has appeared so far, `rest` is what is still hidden (render it
// invisibly to keep the layout from jumping).
export function useTypewriter(text, active, { interval = 45, onDone } = {}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const animate = active && !prefersReducedMotion();
  const [count, setCount] = useState(animate ? 0 : tokens.length);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!animate) {
      setCount(tokens.length);
      return undefined;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= tokens.length) clearInterval(id);
    }, interval);
    return () => clearInterval(id);
  }, [animate, tokens, interval]);

  const done = count >= tokens.length;
  useEffect(() => {
    if (done && animate) onDoneRef.current?.();
  }, [done, animate]);

  const finish = useCallback(() => setCount(tokens.length), [tokens]);
  return {
    shown: tokens.slice(0, count).join(''),
    rest: tokens.slice(count).join(''),
    done,
    finish,
  };
}
