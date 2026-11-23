import { useCallback, useEffect, useState } from 'react';

/**
 * Counts down `cooldownSeconds` after `start()` and exposes when a resend is allowed again.
 */
export function useResendCountdown(cooldownSeconds = 60) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(cooldownSeconds), [cooldownSeconds]);

  return { remaining, start, canResend: remaining === 0 };
}
