import type {
  Habit,
  HabitLog,
  AnalyticsSummary,
  GlobalAnalytics,
  HeatmapEntry,
  RangeType,
} from '../types';
import { getDateRange, isHabitScheduledForDate } from './dateUtils';
import { computeStreaks } from './streaks';

export function computeHabitAnalytics(
  habit: Habit,
  logs: HabitLog[],
  rangeType: RangeType,
): AnalyticsSummary {
  const dates = getDateRange(rangeType);
  const habitLogs = logs.filter((l) => l.habitId === habit.id);

  const scheduledDates = dates.filter((d) =>
    isHabitScheduledForDate(habit.scheduledDays, d),
  );

  const completedDates = scheduledDates.filter((d) =>
    habitLogs.some((l) => l.date === d && l.completed),
  );

  const missedDays = scheduledDates.length - completedDates.length;
  const completionRate =
    scheduledDates.length > 0
      ? (completedDates.length / scheduledDates.length) * 100
      : 0;

  const totalTime = habitLogs
    .filter((l) => dates.includes(l.date))
    .reduce((sum, l) => sum + (l.duration ?? 0), 0);

  const allHabitLogs = logs.filter((l) => l.habitId === habit.id);
  const { currentStreak, longestStreak } = computeStreaks(habit, allHabitLogs);

  return {
    habitId: habit.id,
    completionRate,
    totalTime,
    currentStreak,
    longestStreak,
    missedDays,
    completedDays: completedDates.length,
    scheduledDays: scheduledDates.length,
  };
}

export function computeGlobalAnalytics(
  habits: Habit[],
  logs: HabitLog[],
  rangeType: RangeType,
): GlobalAnalytics {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) {
    return {
      consistencyScore: 0,
      bestHabitId: null,
      totalCompletions: 0,
      totalTimeLogged: 0,
    };
  }

  const summaries = active.map((h) => computeHabitAnalytics(h, logs, rangeType));

  const avgCompletion =
    summaries.reduce((s, a) => s + a.completionRate, 0) / summaries.length;

  const best = summaries.reduce((prev, curr) =>
    curr.completionRate > prev.completionRate ? curr : prev,
  );

  const totalCompletions = summaries.reduce((s, a) => s + a.completedDays, 0);
  const totalTimeLogged = summaries.reduce((s, a) => s + a.totalTime, 0);

  return {
    consistencyScore: avgCompletion,
    bestHabitId: best.completionRate > 0 ? best.habitId : null,
    totalCompletions,
    totalTimeLogged,
  };
}

export function getHeatmapData(
  logs: HabitLog[],
  habits: Habit[],
): HeatmapEntry[] {
  const activeHabits = habits.filter((h) => !h.archived);
  const dates = getDateRange('year');
  const completedSet = new Map<string, Set<string>>();

  for (const log of logs) {
    if (!log.completed) continue;
    if (!completedSet.has(log.date)) completedSet.set(log.date, new Set());
    completedSet.get(log.date)!.add(log.habitId);
  }

  return dates.map((date) => {
    const scheduledHabits = activeHabits.filter((h) =>
      isHabitScheduledForDate(h.scheduledDays, date),
    );
    const total = scheduledHabits.length;
    if (total === 0) return { date, intensity: 0, count: 0, total: 0 };

    const completed = completedSet.get(date);
    const count = completed
      ? scheduledHabits.filter((h) => completed.has(h.id)).length
      : 0;

    return {
      date,
      intensity: count / total,
      count,
      total,
    };
  });
}

export function getWeeklyBarData(
  habits: Habit[],
  logs: HabitLog[],
): { date: string; label: string; completed: number; total: number; rate: number }[] {
  const dates = getDateRange('week');
  const activeHabits = habits.filter((h) => !h.archived);

  return dates.map((date) => {
    const scheduled = activeHabits.filter((h) =>
      isHabitScheduledForDate(h.scheduledDays, date),
    );
    const total = scheduled.length;
    const completed = scheduled.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.date === date && l.completed),
    ).length;

    const d = new Date(date + 'T00:00:00');
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });

    return { date, label, completed, total, rate: total > 0 ? completed / total : 0 };
  });
}
