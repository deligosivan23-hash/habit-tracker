import { motion } from 'framer-motion';
import type { Habit, HabitLog } from '../../types';
import { useTimerStore } from '../../store/timerStore';
import { useHabitStore } from '../../store/habitStore';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { formatMs, formatDuration, getTodayString } from '../../utils/dateUtils';
import { ProgressRing } from '../ui/ProgressRing';
import { Button } from '../ui/Button';

interface TimerDisplayProps {
  habit: Habit;
  log?: HabitLog;
}

export function TimerDisplay({ habit, log }: TimerDisplayProps) {
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);
  const timer = useTimerStore((s) => s.timers[habit.id]);
  const appendSession = useHabitStore((s) => s.appendSession);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);

  const elapsed = useElapsedTimer(habit.id);

  const isRunning = timer?.state === 'running';
  const isPaused = timer?.state === 'paused';
  const isStopped = timer?.state === 'stopped';
  const isIdle = !timer || isStopped;

  const loggedDuration = log?.duration ?? 0;
  const targetDuration = habit.targetDuration ?? 0;
  const totalElapsedSec = loggedDuration + Math.floor(elapsed / 1000);
  const progress = targetDuration > 0 ? Math.min(100, (totalElapsedSec / targetDuration) * 100) : 0;

  const handleStart = () => startTimer(habit.id);
  const handlePause = () => pauseTimer(habit.id);
  const handleResume = () => resumeTimer(habit.id);

  const handleStop = () => {
    const result = stopTimer(habit.id);
    if (result && result.sessions.length > 0) {
      const today = getTodayString();
      const lastSession = result.sessions[result.sessions.length - 1];
      appendSession(habit.id, today, lastSession);

      if (habit.type === 'both' && targetDuration > 0) {
        const total = loggedDuration + lastSession.duration;
        if (total >= targetDuration && !log?.completed) {
          toggleCompletion(habit.id);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Large progress ring */}
      <div className="relative">
        <ProgressRing
          value={progress}
          size={180}
          strokeWidth={8}
          color={habit.color}
          trackColor="#1E2A40"
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-1">{habit.emoji}</span>
            <span
              className={[
                'font-mono text-2xl font-medium tabular-nums',
                isRunning ? 'text-amber-400' : 'text-text-primary',
              ].join(' ')}
            >
              {formatMs(elapsed)}
            </span>
            <span className="text-text-muted text-xs mt-0.5">
              {isRunning ? 'running' : isPaused ? 'paused' : 'idle'}
            </span>
          </div>
        </ProgressRing>

        {/* Pulsing border when running */}
        {isRunning && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 0 0 rgba(240,165,0,0.4)', '0 0 0 12px rgba(240,165,0,0)'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="font-mono text-lg text-text-primary">{formatDuration(loggedDuration)}</p>
          <p className="text-text-muted text-xs">logged today</p>
        </div>
        {targetDuration > 0 && (
          <>
            <div className="w-px bg-border" />
            <div>
              <p className="font-mono text-lg" style={{ color: habit.color }}>
                {Math.round(progress)}%
              </p>
              <p className="text-text-muted text-xs">of {formatDuration(targetDuration)}</p>
            </div>
          </>
        )}
        {log?.sessions && log.sessions.length > 0 && (
          <>
            <div className="w-px bg-border" />
            <div>
              <p className="font-mono text-lg text-text-primary">{log.sessions.length}</p>
              <p className="text-text-muted text-xs">sessions</p>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isIdle && (
          <Button variant="primary" size="lg" onClick={handleStart}>
            ▶ Start Timer
          </Button>
        )}
        {isRunning && (
          <>
            <Button variant="amber" size="lg" onClick={handlePause}>
              ⏸ Pause
            </Button>
            <Button variant="danger" size="lg" onClick={handleStop}>
              ⏹ Stop & Log
            </Button>
          </>
        )}
        {isPaused && (
          <>
            <Button variant="primary" size="lg" onClick={handleResume}>
              ▶ Resume
            </Button>
            <Button variant="danger" size="lg" onClick={handleStop}>
              ⏹ Stop & Log
            </Button>
          </>
        )}
      </div>

      {/* Session history for today */}
      {log?.sessions && log.sessions.length > 0 && (
        <div className="w-full space-y-1.5">
          <p className="text-text-muted text-xs uppercase tracking-widest">Today's sessions</p>
          {log.sessions.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-surface-raised rounded-lg border border-border"
            >
              <span className="text-text-secondary text-xs">
                Session {i + 1} ·{' '}
                {new Date(s.startTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="font-mono text-xs text-text-primary">{formatDuration(s.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
