import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { useTimerStore } from '../store/timerStore';
import { HabitForm } from '../components/habits/HabitForm';
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { computeHabitAnalytics } from '../utils/analytics';
import { formatDuration, getTodayString, formatDate } from '../utils/dateUtils';
import type { Habit } from '../types';

type FormData = Omit<Habit, 'id' | 'createdAt'>;

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
      <p className="font-mono text-2xl text-text-primary">{value}</p>
      <p className="text-text-muted text-xs uppercase tracking-widest mt-0.5">{label}</p>
      {sub && <p className="text-text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const logs = useHabitStore((s) => s.logs);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const resetTimer = useTimerStore((s) => s.resetTimer);

  const today = getTodayString();
  const todayLog = logs.find((l) => l.habitId === id && l.date === today);
  const habitLogs = logs.filter((l) => l.habitId === id);
  const isTimed = habit?.type === 'timed' || habit?.type === 'both';

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h2 className="font-display text-xl text-text-primary mb-2">Habit not found</h2>
        <Button variant="ghost" onClick={() => navigate('/')}>← Back to Today</Button>
      </div>
    );
  }

  const analytics = computeHabitAnalytics(habit, habitLogs, 'month');

  const handleUpdate = (data: FormData) => {
    updateHabit(habit.id, data);
    setShowEdit(false);
  };

  const handleDelete = () => {
    resetTimer(habit.id);
    deleteHabit(habit.id);
    navigate('/habits');
  };

  // Recent log history (last 7)
  const recentLogs = [...habitLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const scheduledLabel =
    habit.scheduledDays.length === 0 ? 'Every day' : habit.scheduledDays.join(' · ');

  return (
    <>
      {/* Back + actions header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Habit hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-raised border border-border rounded-2xl p-5 mb-5 relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
          style={{ backgroundColor: habit.color }}
        />
        <div className="pl-3">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${habit.color}18` }}
            >
              {habit.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl text-text-primary leading-tight">{habit.name}</h2>
              {habit.description && (
                <p className="text-text-muted text-sm mt-0.5">{habit.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{scheduledLabel}</Badge>
            <Badge variant="neutral">{habit.timeOfDay === 'custom' ? habit.customTime : habit.timeOfDay}</Badge>
            <Badge variant={habit.type === 'checklist' ? 'neutral' : 'amber'}>
              {habit.type === 'both' ? 'Timed + Check' : habit.type}
            </Badge>
            {isTimed && habit.targetDuration && (
              <Badge variant="amber">Target: {formatDuration(habit.targetDuration)}</Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Today's completion toggle (checklist / both) */}
      {(habit.type === 'checklist' || habit.type === 'both') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <button
            onClick={() => toggleCompletion(habit.id)}
            className={[
              'w-full py-3 px-5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2',
              todayLog?.completed
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-surface-raised border-border text-text-secondary hover:border-border-bright hover:text-text-primary',
            ].join(' ')}
          >
            {todayLog?.completed ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Completed today — click to undo
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current" />
                Mark as done today
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Timer — for timed habits */}
      {isTimed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-raised border border-border rounded-2xl p-5 mb-5"
        >
          <h3 className="font-display text-lg text-text-primary mb-4">Timer</h3>
          <TimerDisplay habit={habit} log={todayLog} />
        </motion.div>
      )}

      {/* Analytics cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-5"
      >
        <h3 className="font-display text-lg text-text-primary mb-3">Last 30 days</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Completion" value={`${Math.round(analytics.completionRate)}%`} />
          <StatBox label="Streak" value={analytics.currentStreak} sub="days" />
          <StatBox label="Best Streak" value={analytics.longestStreak} sub="days" />
          <StatBox label="Missed" value={analytics.missedDays} sub="days" />
        </div>
        {isTimed && (
          <div className="mt-3">
            <StatBox
              label="Total time (30d)"
              value={formatDuration(analytics.totalTime)}
            />
          </div>
        )}
      </motion.div>

      {/* Log history */}
      {recentLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-5"
        >
          <h3 className="font-display text-lg text-text-primary mb-3">Recent history</h3>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-4 py-3 bg-surface-raised border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'w-2 h-2 rounded-full',
                      log.completed ? 'bg-success' : 'bg-border',
                    ].join(' ')}
                  />
                  <span className="text-text-secondary text-sm font-mono">{formatDate(log.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {log.duration != null && log.duration > 0 && (
                    <span className="text-text-muted text-xs font-mono">{formatDuration(log.duration)}</span>
                  )}
                  <Badge variant={log.completed ? 'success' : 'neutral'}>
                    {log.completed ? 'done' : 'missed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Edit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Habit" size="md">
        <HabitForm
          initialData={habit}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Habit?" size="sm">
        <p className="text-text-secondary text-sm mb-5">
          This will permanently delete <strong className="text-text-primary">{habit.name}</strong> and all its logs. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
