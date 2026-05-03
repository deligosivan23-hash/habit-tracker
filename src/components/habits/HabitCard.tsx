import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Habit, HabitLog } from '../../types';
import { useHabitStore } from '../../store/habitStore';
import { useTimerStore } from '../../store/timerStore';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { formatMs, formatDuration, getTodayString } from '../../utils/dateUtils';
import { Badge } from '../ui/Badge';
import { ProgressRing } from '../ui/ProgressRing';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
}

export function HabitCard({ habit, log }: HabitCardProps) {
  const navigate = useNavigate();
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const appendSession = useHabitStore((s) => s.appendSession);

  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const timer = useTimerStore((s) => s.timers[habit.id]);
  const elapsed = useElapsedTimer(habit.id);

  const [justCompleted, setJustCompleted] = useState(false);
  const justCompletedTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(justCompletedTimeout.current);
  }, []);

  const isCompleted = log?.completed ?? false;
  const isTimed = habit.type === 'timed' || habit.type === 'both';

  // FIX: only running/paused count as "active" — stopped is already finalized
  const isRunning = timer?.state === 'running';
  const isPaused = timer?.state === 'paused';
  const isActiveTimer = isRunning || isPaused;

  const loggedDuration = log?.duration ?? 0;
  const targetDuration = habit.targetDuration ?? 0;

  const liveSeconds = Math.floor(elapsed / 1000);
  const totalSeconds = loggedDuration + (isActiveTimer ? liveSeconds : 0);

  const timedProgress =
    targetDuration > 0 && isTimed ? Math.min(100, (totalSeconds / targetDuration) * 100) : 0;

  // Overtime: logged more than target
  const overtime = targetDuration > 0 && loggedDuration > targetDuration
    ? loggedDuration - targetDuration
    : 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompletion(habit.id);
    if (!isCompleted) {
      clearTimeout(justCompletedTimeout.current);
      setJustCompleted(true);
      justCompletedTimeout.current = setTimeout(() => setJustCompleted(false), 900);
    }
  };

  const handleTimerAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActiveTimer) {
      startTimer(habit.id);
    } else if (isRunning) {
      pauseTimer(habit.id);
    } else if (isPaused) {
      resumeTimer(habit.id);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = stopTimer(habit.id);
    if (result && result.sessions.length > 0) {
      const lastSession = result.sessions[result.sessions.length - 1];
      appendSession(habit.id, getTodayString(), lastSession);

      if (habit.type === 'both' && targetDuration > 0) {
        const total = loggedDuration + lastSession.duration;
        if (total >= targetDuration && !isCompleted) {
          toggleCompletion(habit.id);
        }
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className={[
        'relative rounded-2xl border overflow-hidden transition-colors duration-200',
        'cursor-pointer group',
        isCompleted
          ? 'bg-surface-raised border-success/20'
          : isRunning
          ? 'bg-surface-raised border-amber-500/35'
          : 'bg-surface-raised border-border hover:border-border-bright',
      ].join(' ')}
      style={isRunning ? { boxShadow: '0 0 0 1px rgba(240,165,0,0.15), 0 4px 20px rgba(240,165,0,0.07)' } : undefined}
      onClick={() => navigate(`/habit/${habit.id}`)}
    >
      {/* Color strip */}
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: habit.color }} />

      {/* Running pulse indicator */}
      {isRunning && (
        <div className="absolute top-3.5 right-3.5">
          <div className="relative w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-amber-400 opacity-70 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-amber-500" />
          </div>
        </div>
      )}

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Emoji / Progress ring */}
          <div className="flex-shrink-0 mt-0.5">
            {isTimed && targetDuration > 0 ? (
              <ProgressRing value={timedProgress} size={44} color={habit.color}>
                <span className="text-base">{habit.emoji}</span>
              </ProgressRing>
            ) : (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${habit.color}18` }}
              >
                {habit.emoji}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={[
                'font-body font-semibold text-sm truncate mb-0.5',
                isCompleted ? 'text-text-secondary line-through' : 'text-text-primary',
              ].join(' ')}
            >
              {habit.name}
            </h3>

            {habit.description && (
              <p className="text-text-muted text-xs truncate mb-1.5">{habit.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral">
                {habit.timeOfDay === 'custom' ? habit.customTime : habit.timeOfDay}
              </Badge>

              {/* Duration progress */}
              {isTimed && loggedDuration > 0 && (
                <Badge variant={timedProgress >= 100 ? 'success' : 'amber'}>
                  {formatDuration(loggedDuration)}
                  {targetDuration > 0 && ` / ${formatDuration(targetDuration)}`}
                </Badge>
              )}

              {/* Overtime badge */}
              {overtime > 0 && (
                <Badge variant="info">+{formatDuration(overtime)} over</Badge>
              )}

              {/* Live timer display */}
              {isActiveTimer && (
                <span className={['font-mono text-xs font-medium', isRunning ? 'text-amber-400' : 'text-text-muted'].join(' ')}>
                  {formatMs(elapsed)}{isPaused && ' ⏸'}
                </span>
              )}
            </div>
          </div>

          {/* Controls — stop propagation so clicks don't navigate */}
          <div
            className="flex-shrink-0 flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Completion toggle */}
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={handleToggle}
              className={[
                'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors',
                isCompleted
                  ? 'bg-success border-success text-white'
                  : 'border-border hover:border-success/60 hover:bg-success/10',
              ].join(' ')}
              aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.button>

            {/* Timer controls */}
            {isTimed && (
              <div className="flex gap-1">
                <button
                  onClick={handleTimerAction}
                  className={[
                    'w-7 h-7 rounded-md flex items-center justify-center transition-colors text-xs',
                    isRunning
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/35'
                      : isPaused
                      ? 'bg-info/20 text-info hover:bg-info/35'
                      : 'bg-surface-overlay text-text-muted hover:text-text-secondary hover:bg-surface-overlay/70',
                  ].join(' ')}
                  title={isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start timer'}
                >
                  {isRunning ? '⏸' : '▶'}
                </button>
                {isActiveTimer && (
                  <button
                    onClick={handleStop}
                    className="w-7 h-7 rounded-md flex items-center justify-center bg-danger/15 text-danger hover:bg-danger/30 transition-colors text-xs"
                    title="Stop and log"
                  >
                    ⏹
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion flash */}
      {justCompleted && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-success/10 pointer-events-none rounded-2xl"
        />
      )}
    </motion.div>
  );
}
