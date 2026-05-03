import { useState, useEffect, useMemo } from 'react';
import { useHabitStore } from '../store/habitStore';
import { isHabitScheduledForDate, getTodayString } from '../utils/dateUtils';

export function useTodayHabits() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const getLog = useHabitStore((s) => s.getLog);

  const [today, setToday] = useState(getTodayString);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = getTodayString();
      setToday((prev) => (prev !== current ? current : prev));
    }, 60_000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const todayHabits = useMemo(
    () =>
      habits
        .filter((h) => !h.archived && isHabitScheduledForDate(h.scheduledDays, today))
        .map((h) => ({
          habit: h,
          log: getLog(h.id, today),
        })),
    [habits, logs, today, getLog],
  );

  const completed = todayHabits.filter((x) => x.log?.completed).length;
  const total = todayHabits.length;

  return { todayHabits, completed, total, today };
}
