import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#$%&";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function scramble(token) {
  return token.replace(/./g, randomGlyph);
}

export default function useScrambleReveal(targetTokens, { totalMs = 2800, onDone } = {}) {
  const [display, setDisplay] = useState(() => targetTokens.map(scramble));
  const [lockedCount, setLockedCount] = useState(0);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (targetTokens.length === 0) {
      setDone(true);
      onDoneRef.current?.();
      return;
    }

    setDisplay(targetTokens.map(scramble));
    setLockedCount(0);
    setDone(false);

    const perTokenMs = Math.min(120, Math.max(30, totalMs / targetTokens.length));
    const startedAt = performance.now();

    const id = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const locked = Math.min(targetTokens.length, Math.floor(elapsed / perTokenMs));

      setDisplay(targetTokens.map((token, i) => (i < locked ? token : scramble(token))));
      setLockedCount(locked);

      if (locked === targetTokens.length) {
        clearInterval(id);
        setDone(true);
        onDoneRef.current?.();
      }
    }, 16);

    return () => clearInterval(id);
  }, [targetTokens, totalMs]);

  return { display, lockedCount, done };
}
