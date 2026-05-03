export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'custom';
export type HabitType = 'checklist' | 'timed' | 'both';
export type TimerState = 'idle' | 'running' | 'paused' | 'stopped';
export type RangeType = 'week' | 'month' | 'year';

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string; // hex
  type: HabitType;
  scheduledDays: DayOfWeek[]; // empty = daily
  timeOfDay: TimeOfDay;
  customTime?: string; // HH:MM
  targetDuration?: number; // seconds (for timed habits)
  createdAt: string; // ISO date string
  archived?: boolean;
}

export interface TimerSession {
  startTime: string; // ISO
  endTime: string; // ISO
  duration: number; // seconds
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  duration?: number; // total seconds for the day
  sessions: TimerSession[];
  notes?: string;
}

export interface ActiveTimer {
  habitId: string;
  state: TimerState;
  elapsedMs: number;
  startedAt?: number; // performance.now() or Date.now() when last started/resumed
  realStartTime?: number; // Date.now() when startTimer was first called (not reset on pause/resume)
  sessions: TimerSession[];
}

export interface AnalyticsSummary {
  habitId: string;
  completionRate: number; // 0–100
  totalTime: number; // seconds
  currentStreak: number;
  longestStreak: number;
  missedDays: number;
  completedDays: number;
  scheduledDays: number;
}

export interface GlobalAnalytics {
  consistencyScore: number; // 0–100
  bestHabitId: string | null;
  totalCompletions: number;
  totalTimeLogged: number; // seconds
}

export interface HeatmapEntry {
  date: string; // YYYY-MM-DD
  intensity: number; // 0–1
  count: number;
  total: number;
}
