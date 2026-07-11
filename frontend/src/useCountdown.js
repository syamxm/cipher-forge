import { useEffect, useRef, useState } from "react";

export default function useCountdown(seconds, onExpired) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (seconds <= 0) return;
    setRemaining(seconds);

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onExpiredRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [seconds]);

  const pct = Math.round((remaining / seconds) * 100);
  return { remaining, pct };
}