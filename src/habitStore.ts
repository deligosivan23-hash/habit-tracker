import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitLog, TimerSession } from '../types';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];

  // Habit CRUD
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => string;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;

  // Log operations
  getLog: (habitId: string, date: string) => HabitLog | undefined;
  toggleCompletion: (habitId: string, date?: string) => void;
  updateLog: (habitId: string, date: string, updates: Partial<Omit<HabitLog, 'id'>>) => void;
  appendSession: (habitId: string, date: string, session: TimerSession) => void;
  getTodayLogs: () => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],

      addHabit: (habitData) => {
        const id = crypto.randomUUID();
        const habit: Habit = {
          ...habitData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        return id;
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        }));
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)),
        }));
      },

      getLog: (habitId, date) => {
        return get().logs.find((l) => l.habitId === habitId && l.date === date);
      },

      toggleCompletion: (habitId, date) => {
        const targetDate = date ?? getTodayString();
        const existing = get().getLog(habitId, targetDate);

        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.habitId === habitId && l.date === targetDate
                ? { ...l, completed: !l.completed }
                : l,
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date: targetDate,
            completed: true,
            sessions: [],
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }
      },

      updateLog: (habitId, date, updates) => {
        const existing = get().getLog(habitId, date);
        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.habitId === habitId && l.date === date ? { ...l, ...updates } : l,
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date,
            completed: false,
            sessions: [],
            ...updates,
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }
      },

      appendSession: (habitId, date, session) => {
        const existing = get().getLog(habitId, date);
        const prevDuration = existing?.duration ?? 0;
        const prevSessions = existing?.sessions ?? [];

        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.habitId === habitId && l.date === date
                ? {
                    ...l,
                    sessions: [...prevSessions, session],
                    duration: prevDuration + session.duration,
                  }
                : l,
            ),
          }));
        } else {
          const newLog: HabitLog = {
            id: crypto.randomUUID(),
            habitId,
            date,
            completed: false,
            sessions: [session],
            duration: session.duration,
          };
          set((state) => ({ logs: [...state.logs, newLog] }));
        }
      },

      getTodayLogs: () => {
        const today = getTodayString();
        return get().logs.filter((l) => l.date === today);
      },

      getLogsForHabit: (habitId) => {
        return get().logs.filter((l) => l.habitId === habitId);
      },
    }),
    { name: 'habit-tracker-v1' },
  ),
);
