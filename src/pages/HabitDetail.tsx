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
import { formatDuration, getTodayString, formatDate, getDateRange, isHabitScheduledForDate } from '../utils/dateUtils';
import type { Habit, HabitLog } from '../types';

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

/** Modal to manually set a day's logged duration */
function EditDurationModal({
  isOpen,
  onClose,
  log,
  habitId,
  date,
}: {
  isOpen: boolean;
  onClose: () => void;
  log?: HabitLog;
  habitId: string;
  date: string;
}) {
  const editLogDuration = useHabitStore((s) => s.editLogDuration);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const currentSeconds = log?.duration ?? 0;
  const [hours, setHours] = useState(String(Math.floor(currentSeconds / 3600)));
  const [minutes, setMinutes] = useState(String(Math.floor((currentSeconds % 3600) / 60)));
  const [secs, setSecs] = useState(String(currentSeconds % 60));

  const handleSave = () => {
    const total =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(secs) || 0);
    editLogDuration(habitId, date, total);
    // Auto-mark complete if time > 0
    if (total > 0 && !log?.completed) {
      toggleCompletion(habitId, date);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Time Logged" size="sm">
      <p className="text-text-muted text-sm mb-4">
        Manually set the time logged for <span className="font-mono text-text-secondary">{date}</span>.
        This replaces any session data for that day.
      </p>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1 text-center">Hours</label>
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary font-mono text-xl text-center focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
        </div>
        <span className="text-text-muted text-2xl font-mono mt-4">:</span>
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1 text-center">Minutes</label>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary font-mono text-xl text-center focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
        </div>
        <span className="text-text-muted text-2xl font-mono mt-4">:</span>
        <div className="flex-1">
          <label className="block text-xs text-text-muted mb-1 text-center">Seconds</label>
          <input
            type="number"
            min={0}
            max={59}
            value={secs}
            onChange={(e) => setSecs(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text-primary font-mono text-xl text-center focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="primary" className="flex-1" onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
}

/** Time balance table — surplus/deficit across recent days */
function TimeBalanceSection({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const target = habit.targetDuration ?? 0;
  if (target === 0) return null;

  const dates = getDateRange('week');
  const scheduledDates = dates.filter((d) => isHabitScheduledForDate(habit.scheduledDays, d));
  if (scheduledDates.length === 0) return null;

  const rows = scheduledDates.map((date) => {
    const log = logs.find((l) => l.habitId === habit.id && l.date === date);
    const logged = log?.duration ?? 0;
    const delta = logged - target;
    return { date, logged, delta };
  });

  const totalDelta = rows.reduce((s, r) => s + r.delta, 0);

  return (
    <div className="bg-surface-raised border border-border rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-text-primary">Time balance (7 days)</h3>
        <span
          className={[
            'font-mono text-sm font-medium',
            totalDelta > 0 ? 'text-success' : totalDelta < 0 ? 'text-danger' : 'text-text-muted',
          ].join(' ')}
        >
          {totalDelta > 0 ? '+' : ''}{formatDuration(Math.abs(totalDelta))}
          {totalDelta === 0 ? ' balanced' : totalDelta > 0 ? ' surplus' : ' deficit'}
        </span>
      </div>
      <p className="text-text-muted text-xs mb-3">
        Target: {formatDuration(target)} / session. Surplus days can compensate deficit days.
      </p>
      <div className="space-y-1.5">
        {rows.map(({ date, logged, delta }) => (
          <div key={date} className="flex items-center gap-3">
            <span className="font-mono text-xs text-text-muted w-24 flex-shrink-0">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {/* Bar */}
            <div className="flex-1 h-4 bg-surface-overlay rounded-full overflow-hidden relative">
              {logged > 0 && (
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (logged / Math.max(target, logged)) * 100)}%`,
                    backgroundColor: delta >= 0 ? '#10B981' : '#EF4444',
                    opacity: 0.7,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (logged / Math.max(target, logged)) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              )}
              {/* Target marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                style={{ left: `${(target / Math.max(target, logged || target)) * 100}%` }}
              />
            </div>
            <span
              className={[
                'font-mono text-xs w-16 text-right flex-shrink-0',
                delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-text-muted',
              ].join(' ')}
            >
              {logged > 0 ? (delta > 0 ? '+' : '') + formatDuration(Math.abs(delta)) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingLog, setEditingLog] = useState<{ date: string; log?: HabitLog } | null>(null);

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

  const recentLogs = [...habitLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const scheduledLabel =
    habit.scheduledDays.length === 0 ? 'Every day' : habit.scheduledDays.join(' · ');

  // Overtime for today
  const todayDuration = todayLog?.duration ?? 0;
  const target = habit.targetDuration ?? 0;
  const todayOvertime = isTimed && target > 0 && todayDuration > target ? todayDuration - target : 0;

  return (
    <>
      {/* Back + actions */}
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
          <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
        </div>
      </div>

      {/* Habit hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-raised border border-border rounded-2xl p-5 mb-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: habit.color }} />
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
              {habit.description && <p className="text-text-muted text-sm mt-0.5">{habit.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{scheduledLabel}</Badge>
            <Badge variant="neutral">{habit.timeOfDay === 'custom' ? habit.customTime : habit.timeOfDay}</Badge>
            <Badge variant={habit.type === 'checklist' ? 'neutral' : 'amber'}>
              {habit.type === 'both' ? 'Timed + Check' : habit.type}
            </Badge>
            {isTimed && target > 0 && (
              <Badge variant="amber">Target: {formatDuration(target)}</Badge>
            )}
            {todayOvertime > 0 && (
              <Badge variant="info">+{formatDuration(todayOvertime)} overtime today</Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Today completion toggle */}
      {(habit.type === 'checklist' || habit.type === 'both') && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="mb-5">
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
                Completed today — tap to undo
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

      {/* Timer */}
      {isTimed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="bg-surface-raised border border-border rounded-2xl p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-text-primary">Timer</h3>
            <button
              onClick={() => setEditingLog({ date: today, log: todayLog })}
              className="text-xs text-text-muted hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit today's time
            </button>
          </div>
          <TimerDisplay habit={habit} log={todayLog} />
        </motion.div>
      )}

      {/* Time balance / overtime compensation */}
      {isTimed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
          <TimeBalanceSection habit={habit} logs={logs} />
        </motion.div>
      )}

      {/* Analytics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-5">
        <h3 className="font-display text-lg text-text-primary mb-3">Last 30 days</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Completion" value={`${Math.round(analytics.completionRate)}%`} />
          <StatBox label="Streak" value={analytics.currentStreak} sub="days" />
          <StatBox label="Best Streak" value={analytics.longestStreak} sub="days" />
          <StatBox label="Missed" value={analytics.missedDays} sub="days" />
        </div>
        {isTimed && (
          <div className="mt-3">
            <StatBox label="Total time (30d)" value={formatDuration(analytics.totalTime)} />
          </div>
        )}
      </motion.div>

      {/* Log history with edit button */}
      {recentLogs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }} className="mb-8">
          <h3 className="font-display text-lg text-text-primary mb-3">Recent history</h3>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const logOvertime = target > 0 && (log.duration ?? 0) > target ? (log.duration ?? 0) - target : 0;
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-3 bg-surface-raised border border-border rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className={['w-2 h-2 rounded-full flex-shrink-0', log.completed ? 'bg-success' : 'bg-border'].join(' ')} />
                    <span className="text-text-secondary text-sm font-mono">{formatDate(log.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTimed && log.duration != null && log.duration > 0 && (
                      <span className="text-text-muted text-xs font-mono">{formatDuration(log.duration)}</span>
                    )}
                    {logOvertime > 0 && (
                      <span className="text-info text-xs font-mono">+{formatDuration(logOvertime)}</span>
                    )}
                    <Badge variant={log.completed ? 'success' : 'neutral'}>
                      {log.completed ? 'done' : 'missed'}
                    </Badge>
                    {/* Edit time button — only for timed habits */}
                    {isTimed && (
                      <button
                        onClick={() => setEditingLog({ date: log.date, log })}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-amber-400 p-1"
                        title="Edit time"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isTimed && (
            <p className="text-text-muted text-xs mt-2 text-center">
              Hover a row and tap ✏ to manually correct logged time
            </p>
          )}
        </motion.div>
      )}

      {/* Edit habit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Habit" size="md">
        <HabitForm initialData={habit} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} submitLabel="Save Changes" />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Habit?" size="sm">
        <p className="text-text-secondary text-sm mb-5">
          Permanently delete <strong className="text-text-primary">{habit.name}</strong> and all its logs?
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Edit duration modal */}
      {editingLog && (
        <EditDurationModal
          isOpen={!!editingLog}
          onClose={() => setEditingLog(null)}
          log={editingLog.log}
          habitId={habit.id}
          date={editingLog.date}
        />
      )}
    </>
  );
}
