import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveTimer, TimerSession } from '../types';

interface StopResult {
  sessions: TimerSession[];
  totalDuration: number; // seconds
}

interface TimerStore {
  timers: Record<string, ActiveTimer>;

  startTimer: (habitId: string) => void;
  pauseTimer: (habitId: string) => void;
  resumeTimer: (habitId: string) => void;
  stopTimer: (habitId: string) => StopResult | null;
  resetTimer: (habitId: string) => void;

  getTimer: (habitId: string) => ActiveTimer | undefined;
  getElapsedMs: (habitId: string) => number;
  getActiveTimers: () => ActiveTimer[];
  hasActiveOrPaused: (habitId: string) => boolean;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      timers: {},

      startTimer: (habitId) => {
        set((state) => {
          const { [habitId]: _removed, ...rest } = state.timers;
          return {
            timers: {
              ...rest,
              [habitId]: {
                habitId,
                state: 'running',
                elapsedMs: 0,
                startedAt: Date.now(),
                realStartTime: Date.now(),
                sessions: [],
              },
            },
          };
        });
      },

      pauseTimer: (habitId) => {
        const timer = get().timers[habitId];
        if (!timer || timer.state !== 'running') return;

        const now = Date.now();
        const added = timer.startedAt != null ? now - timer.startedAt : 0;

        set((state) => ({
          timers: {
            ...state.timers,
            [habitId]: {
              ...timer,
              state: 'paused',
              elapsedMs: timer.elapsedMs + added,
              startedAt: undefined,
            },
          },
        }));
      },

      resumeTimer: (habitId) => {
        const timer = get().timers[habitId];
        if (!timer || timer.state !== 'paused') return;

        set((state) => ({
          timers: {
            ...state.timers,
            [habitId]: {
              ...timer,
              state: 'running',
              startedAt: Date.now(),
            },
          },
        }));
      },

      stopTimer: (habitId) => {
        const timer = get().timers[habitId];
        if (!timer || timer.state === 'idle') return null;

        const now = Date.now();
        const added =
          timer.state === 'running' && timer.startedAt != null
            ? now - timer.startedAt
            : 0;
        const totalMs = timer.elapsedMs + added;
        const totalSeconds = Math.floor(totalMs / 1000);

        if (totalSeconds === 0) {
          // Nothing to log — just clean up
          set((state) => {
            const updated = { ...state.timers };
            delete updated[habitId];
            return { timers: updated };
          });
          return null;
        }

        const session: TimerSession = {
          startTime: new Date(timer.realStartTime ?? (now - totalMs)).toISOString(),
          endTime: new Date(now).toISOString(),
          duration: totalSeconds,
        };

        set((state) => ({
          timers: {
            ...state.timers,
            [habitId]: {
              ...timer,
              state: 'stopped',
              elapsedMs: totalMs,
              startedAt: undefined,
              sessions: [...timer.sessions, session],
            },
          },
        }));

        return {
          sessions: [...timer.sessions, session],
          totalDuration: totalSeconds,
        };
      },

      resetTimer: (habitId) => {
        set((state) => {
          const updated = { ...state.timers };
          delete updated[habitId];
          return { timers: updated };
        });
      },

      getTimer: (habitId) => get().timers[habitId],

      getElapsedMs: (habitId) => {
        const timer = get().timers[habitId];
        if (!timer) return 0;
        if (timer.state === 'running' && timer.startedAt != null) {
          return timer.elapsedMs + (Date.now() - timer.startedAt);
        }
        return timer.elapsedMs;
      },

      getActiveTimers: () =>
        Object.values(get().timers).filter(
          (t) => t.state === 'running' || t.state === 'paused',
        ),

      hasActiveOrPaused: (habitId) => {
        const timer = get().timers[habitId];
        return timer?.state === 'running' || timer?.state === 'paused';
      },
    }),
    { name: 'timer-store-v1',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        for (const id of Object.keys(state.timers)) {
          const timer = state.timers[id];
          if (timer.state === 'running' && timer.startedAt != null) {
            state.timers[id] = {
              ...timer,
              state: 'paused',
              elapsedMs: timer.elapsedMs + (now - timer.startedAt),
              startedAt: undefined,
            };
          }
        }
      },
    },
  ),
);
