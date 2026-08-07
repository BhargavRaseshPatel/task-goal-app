import { useEffect, useState } from 'react';

// Ticks once a second while `startTime` is set, so a running Activity Log's
// elapsed time updates live without writing to state every second.
export function useElapsedSeconds(startTime: string | undefined): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime) return 0;
  return Math.max(0, Math.floor((now - new Date(startTime).getTime()) / 1000));
}

export function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
