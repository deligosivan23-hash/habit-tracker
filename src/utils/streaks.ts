import type { Habit, HabitLog } from '../types';
import { isHabitScheduledForDate, localDateString } from './dateUtils';

export function computeStreaks(
  habit: Habit,
  logs: HabitLog[],
): { currentStreak: number; longestStreak: number } {
  const today = new Date();
  const todayStr = localDateString(today);
  const created = new Date(habit.createdAt);

  // Build array of all dates from creation to today
  const allDates: string[] = [];
  const cursor = new Date(created);
  while (cursor <= today) {
    allDates.push(localDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Filter to only scheduled dates
  const scheduled = allDates.filter((d) =>
    isHabitScheduledForDate(habit.scheduledDays, d),
  );

  // Build a set of completed dates for O(1) lookup
  const completedSet = new Set(
    logs.filter((l) => l.completed && l.habitId === habit.id).map((l) => l.date),
  );

  // Compute longest streak by scanning forward
  let longestStreak = 0;
  let runningStreak = 0;
  for (const date of scheduled) {
    if (completedSet.has(date)) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  // Compute current streak by scanning backward from today
  let currentStreak = 0;
  const reversedScheduled = [...scheduled].reverse();

  for (const date of reversedScheduled) {
    // Skip future dates
    if (date > todayStr) continue;

    if (completedSet.has(date)) {
      currentStreak++;
    } else {
      // If today is not yet completed, allow a grace period
      // (today doesn't break the streak)
      if (date === todayStr && currentStreak === 0) continue;
      break;
    }
  }

  return { currentStreak, longestStreak };
}
