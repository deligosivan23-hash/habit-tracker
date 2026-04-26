import { useEffect, useState } from 'react';
import { useTimerStore } from '../store/timerStore';

/**
 * Returns live-updated elapsed milliseconds for a habit's timer.
 * Updates every second while the timer is running; returns stored value when paused.
 */
export function useElapsedTimer(habitId: string): number {
  const timer = useTimerStore((s) => s.timers[habitId]);
  const [elapsed, setElapsed] = useState<number>(
    timer?.state === 'running' && timer.startedAt != null
      ? timer.elapsedMs + (Date.now() - timer.startedAt)
      : (timer?.elapsedMs ?? 0),
  );

  useEffect(() => {
    if (!timer || timer.state !== 'running') {
      setElapsed(timer?.elapsedMs ?? 0);
      return;
    }

    // Immediately sync
    const tick = () => {
      if (timer.startedAt != null) {
        setElapsed(timer.elapsedMs + (Date.now() - timer.startedAt));
      }
    };
    tick();

    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer]);

  return elapsed;
}
