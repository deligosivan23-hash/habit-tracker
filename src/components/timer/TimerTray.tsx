import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '../../store/timerStore';
import { useHabitStore } from '../../store/habitStore';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { formatMs, getTodayString } from '../../utils/dateUtils';
import type { ActiveTimer } from '../../types';

function TrayTimer({ timer }: { timer: ActiveTimer }) {
  const elapsed = useElapsedTimer(timer.habitId);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === timer.habitId));
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const appendSession = useHabitStore((s) => s.appendSession);
  const navigate = useNavigate();

  if (!habit) return null;

  const isRunning = timer.state === 'running';

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = stopTimer(timer.habitId);
    if (result && result.sessions.length > 0) {
      const lastSession = result.sessions[result.sessions.length - 1];
      appendSession(timer.habitId, getTodayString(), lastSession);
    }
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) pauseTimer(timer.habitId);
    else resumeTimer(timer.habitId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors cursor-pointer',
        isRunning
          ? 'bg-amber-500/10 border-amber-500/25'
          : 'bg-surface-raised border-border',
      ].join(' ')}
      onClick={() => navigate(`/habit/${timer.habitId}`)}
    >
      {/* Status dot — FIXED: relative wrapper */}
      <div className="relative flex-shrink-0 w-2 h-2">
        {isRunning && (
          <span className="absolute inset-0 rounded-full bg-amber-400 opacity-75 animate-ping" />
        )}
        <span
          className={[
            'absolute inset-0 rounded-full',
            isRunning ? 'bg-amber-500' : 'bg-info/60',
          ].join(' ')}
        />
      </div>

      <span className="text-base leading-none select-none">{habit.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-xs font-medium truncate">{habit.name}</p>
        <p className={['font-mono text-xs', isRunning ? 'text-amber-400' : 'text-text-muted'].join(' ')}>
          {formatMs(elapsed)}
          {!isRunning && ' · paused'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleTogglePause}
          className={[
            'w-7 h-7 rounded-md text-xs flex items-center justify-center transition-colors',
            isRunning
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/35'
              : 'bg-info/20 text-info hover:bg-info/35',
          ].join(' ')}
          title={isRunning ? 'Pause' : 'Resume'}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleStop}
          className="w-7 h-7 rounded-md text-xs flex items-center justify-center bg-danger/15 text-danger hover:bg-danger/30 transition-colors"
          title="Stop & log"
        >
          ⏹
        </button>
      </div>
    </motion.div>
  );
}

export function TimerTray() {
  const [collapsed, setCollapsed] = useState(false);

  // FIX: select timers map, not call getActiveTimers() — avoids new-array-every-render
  const activeTimers = useTimerStore(
    useShallow((s) =>
      Object.values(s.timers).filter(
        (t) => t.state === 'running' || t.state === 'paused',
      ),
    ),
  );

  if (activeTimers.length === 0) return null;

  const runningCount = activeTimers.filter((t) => t.state === 'running').length;
  const label =
    runningCount > 0
      ? `${runningCount} running · ${activeTimers.length - runningCount} paused`
      : `${activeTimers.length} paused`;

  return (
    // FIX: bottom-[calc(4rem+0.5rem)] on mobile = above nav (nav ~64px) ; bottom-4 on desktop
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      // z-20 so mobile nav (z-30) stays on top — tray sits behind nav visually but above content
      className="fixed bottom-[4.5rem] md:bottom-4 left-3 right-3 z-20 max-w-lg mx-auto pointer-events-none"
    >
      <div className="glass rounded-2xl shadow-surface border border-border overflow-hidden pointer-events-auto">
        {/* Header row */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative w-2 h-2 flex-shrink-0">
              {runningCount > 0 && (
                <span className="absolute inset-0 rounded-full bg-amber-400 opacity-60 animate-ping" />
              )}
              <span className={[
                'absolute inset-0 rounded-full',
                runningCount > 0 ? 'bg-amber-500' : 'bg-info/60',
              ].join(' ')} />
            </div>
            <span className="text-xs font-medium text-text-secondary">{label}</span>
          </div>
          <svg
            className={[
              'w-3.5 h-3.5 text-text-muted transition-transform duration-200 flex-shrink-0',
              collapsed ? '' : 'rotate-180',
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
          {!collapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2 max-h-52 overflow-y-auto overscroll-contain">
                <AnimatePresence mode="popLayout">
                  {activeTimers.map((t) => (
                    <TrayTimer key={t.habitId} timer={t} />
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
