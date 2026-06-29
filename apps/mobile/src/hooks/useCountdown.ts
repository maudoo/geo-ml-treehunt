import { useState, useEffect } from 'react';

export function useCountdown(expiresAt: string | null) {
  const getSecondsLeft = () => {
    if (!expiresAt) return null;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const s = getSecondsLeft();
      setSecondsLeft(s);
      if (s === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (secondsLeft === null) return { display: null, expired: false };

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return {
    display: `${mins}:${secs}`,
    expired: secondsLeft === 0,
  };
}
