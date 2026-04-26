import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { HeatmapCalendar } from '../components/analytics/HeatmapCalendar';
import { HabitBarChart, CompletionLineChart } from '../components/analytics/HabitChart';
import { MetricCard } from '../components/ui/MetricCard';
import {
  computeGlobalAnalytics,
  computeHabitAnalytics,
  getHeatmapData,
  getWeeklyBarData,
} from '../utils/analytics';
import { formatDuration, getDateRange } from '../utils/dateUtils';
import type { RangeType } from '../types';

const RANGE_LABELS: Record<RangeType, string> = {
  week: '7 days',
  month: '30 days',
  year: '365 days',
};

function EmptyAnalytics() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📊</div>
      <h2 className="font-display text-2xl text-text-primary mb-2">No data yet</h2>
      <p className="text-text-muted text-sm max-w-xs">
        Complete some habits to see your analytics here.
      </p>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<RangeType>('week');
  const habits = useHabitStore((s) => s.habits.filter((h) => !h.archived));
  const logs = useHabitStore((s) => s.logs);

  const global = useMemo(
    () => computeGlobalAnalytics(habits, logs, range),
    [habits, logs, range],
  );

  const heatmap = useMemo(() => getHeatmapData(logs, habits), [logs, habits]);
  const weekBarData = useMemo(() => getWeeklyBarData(habits, logs), [habits, logs]);

  const bestHabit = habits.find((h) => h.id === global.bestHabitId);

  const habitSummaries = useMemo(
    () => habits.map((h) => ({ habit: h, summary: computeHabitAnalytics(h, logs, range) })),
    [habits, logs, range],
  );

  // Build line chart data for the selected range
  const lineData = useMemo(() => {
    const dates = getDateRange(range);
    const step = range === 'year' ? 30 : range === 'month' ? 7 : 1;
    const result = [];
    for (let i = 0; i < dates.length; i += step) {
      const slice = dates.slice(i, i + step);
      if (slice.length === 0) continue;

      let totalScheduled = 0;
      let totalCompleted = 0;

      for (const date of slice) {
        for (const habit of habits) {
          const scheduled =
            habit.scheduledDays.length === 0 ||
            habit.scheduledDays.includes(
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
                new Date(date + 'T00:00:00').getDay()
              ] as never,
            );
          if (!scheduled) continue;
          totalScheduled++;
          if (logs.some((l) => l.habitId === habit.id && l.date === date && l.completed)) {
            totalCompleted++;
          }
        }
      }

      const d = new Date(slice[0] + 'T00:00:00');
      const label =
        range === 'year'
          ? d.toLocaleDateString('en-US', { month: 'short' })
          : range === 'month'
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-US', { weekday: 'short' });

      result.push({
        label,
        rate: totalScheduled > 0 ? (totalCompleted / totalScheduled) * 100 : 0,
      });
    }
    return result;
  }, [habits, logs, range]);

  if (habits.length === 0) return <EmptyAnalytics />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-text-primary">Analytics</h1>
        {/* Range tabs */}
        <div className="flex gap-1 bg-surface-raised p-1 rounded-xl border border-border">
          {(Object.keys(RANGE_LABELS) as RangeType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                range === r
                  ? 'bg-amber-500 text-obsidian-900 font-semibold'
                  : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Global metrics */}
      <motion.div
        key={range}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4"
      >
        <MetricCard
          label="Consistency"
          value={`${Math.round(global.consistencyScore)}%`}
          accent
          icon="🎯"
        />
        <MetricCard
          label="Completions"
          value={global.totalCompletions}
          icon="✅"
        />
        <MetricCard
          label="Time logged"
          value={formatDuration(global.totalTimeLogged)}
          icon="⏱"
        />
        <MetricCard
          label="Top habit"
          value={bestHabit ? bestHabit.emoji : '—'}
          sub={bestHabit?.name ?? 'none yet'}
          icon=""
        />
      </motion.div>

      {/* Consistency over time */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-raised border border-border rounded-2xl p-5 mb-5"
      >
        <h3 className="font-display text-lg text-text-primary mb-4">Consistency over time</h3>
        <CompletionLineChart data={lineData} />
      </motion.div>

      {/* Weekly bar chart */}
      {range === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-raised border border-border rounded-2xl p-5 mb-5"
        >
          <h3 className="font-display text-lg text-text-primary mb-4">This week</h3>
          <HabitBarChart data={weekBarData} />
        </motion.div>
      )}

      {/* Activity heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-raised border border-border rounded-2xl p-5 mb-5"
      >
        <h3 className="font-display text-lg text-text-primary mb-4">Activity heatmap</h3>
        <HeatmapCalendar data={heatmap} />
      </motion.div>

      {/* Per-habit breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        <h3 className="font-display text-lg text-text-primary mb-3">Per-habit breakdown</h3>
        <div className="space-y-3">
          {habitSummaries
            .sort((a, b) => b.summary.completionRate - a.summary.completionRate)
            .map(({ habit, summary }) => {
              const isTimed = habit.type === 'timed' || habit.type === 'both';
              return (
                <div
                  key={habit.id}
                  className="bg-surface-raised border border-border rounded-2xl p-4"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${habit.color}18` }}
                    >
                      {habit.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{habit.name}</p>
                      <p className="text-text-muted text-xs">
                        {summary.completedDays}/{summary.scheduledDays} days
                      </p>
                    </div>
                    <span
                      className="font-mono text-lg font-medium"
                      style={{ color: habit.color }}
                    >
                      {Math.round(summary.completionRate)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: habit.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${summary.completionRate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="font-mono text-sm text-text-primary">{summary.currentStreak}</p>
                      <p className="text-text-muted text-xs">streak</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-text-primary">{summary.longestStreak}</p>
                      <p className="text-text-muted text-xs">best</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-text-primary">{summary.missedDays}</p>
                      <p className="text-text-muted text-xs">missed</p>
                    </div>
                    {isTimed && (
                      <div>
                        <p className="font-mono text-sm text-text-primary">{formatDuration(summary.totalTime)}</p>
                        <p className="text-text-muted text-xs">time</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
