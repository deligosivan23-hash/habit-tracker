import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTimerStore } from '../../store/timerStore';
import { useHabitStore } from '../../store/habitStore';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { formatMs, getTodayString } from '../../utils/dateUtils';

function TrayTimer({ habitId }: { habitId: string }) {
  const elapsed = useElapsedTimer(habitId);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const timer = useTimerStore((s) => s.timers[habitId]);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const appendSession = useHabitStore((s) => s.appendSession);
  const navigate = useNavigate();

  if (!habit || !timer) return null;

  const isRunning = timer.state === 'running';
  const isPaused = timer.state === 'paused';

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = stopTimer(habitId);
    if (result && result.sessions.length > 0) {
      const today = getTodayString();
      const lastSession = result.sessions[result.sessions.length - 1];
      appendSession(habitId, today, lastSession);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer',
        isRunning
          ? 'bg-amber-500/10 border-amber-500/25'
          : 'bg-surface-raised border-border',
      ].join(' ')}
      onClick={() => navigate(`/habit/${habitId}`)}
    >
      {/* Indicator dot */}
      <div className="flex-shrink-0">
        {isRunning ? (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        ) : (
          <div className="h-2 w-2 rounded-full bg-info/60" />
        )}
      </div>

      {/* Emoji + name */}
      <span className="text-base leading-none">{habit.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-xs font-medium truncate">{habit.name}</p>
        <p
          className={[
            'font-mono text-xs',
            isRunning ? 'text-amber-400' : 'text-text-muted',
          ].join(' ')}
        >
          {formatMs(elapsed)}
          {isPaused && ' · paused'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) pauseTimer(habitId);
            else resumeTimer(habitId);
          }}
          className={[
            'w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all',
            isRunning
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-info/20 text-info hover:bg-info/30',
          ].join(' ')}
          title={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleStop}
          className="w-7 h-7 rounded-md text-xs flex items-center justify-center bg-danger/15 text-danger hover:bg-danger/25 transition-all"
          title="Stop and log"
        >
          ⏹
        </button>
      </div>
    </motion.div>
  );
}

export function TimerTray() {
  const [expanded, setExpanded] = useState(true);
  const activeTimers = useTimerStore((s) => s.getActiveTimers());

  if (activeTimers.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto"
    >
      <div className="glass rounded-2xl shadow-surface border border-border overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-raised/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-slow" />
            <span className="text-xs font-medium text-text-secondary">
              {activeTimers.length} active timer{activeTimers.length > 1 ? 's' : ''}
            </span>
          </div>
          <svg
            className={[
              'w-4 h-4 text-text-muted transition-transform duration-200',
              expanded ? 'rotate-180' : '',
            ].join(' ')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Timer list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                <AnimatePresence>
                  {activeTimers.map((t) => (
                    <TrayTimer key={t.habitId} habitId={t.habitId} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
