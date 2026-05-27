import { useState, useEffect, useRef } from "react";
import { secondsUntil } from "@/lib/utils";

interface CountdownState {
  seconds: number;
  isExpired: boolean;
  isWarning: boolean; // < 5 min
  isDanger: boolean;  // < 2 min
}

/**
 * Live countdown to a given expiry date string.
 * Ticks every second using requestAnimationFrame for smoothness.
 */
export function useCountdown(expiresAt: string | undefined): CountdownState {
  const [seconds, setSeconds] = useState(() =>
    expiresAt ? secondsUntil(expiresAt) : 0
  );
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const now = Date.now();
      if (now - lastTickRef.current >= 1000) {
        lastTickRef.current = now;
        const remaining = secondsUntil(expiresAt);
        setSeconds(remaining);
        if (remaining <= 0) return; // Stop
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [expiresAt]);

  return {
    seconds,
    isExpired: seconds <= 0,
    isWarning: seconds > 0 && seconds <= 300,  // 5 min
    isDanger: seconds > 0 && seconds <= 120,   // 2 min
  };
}
