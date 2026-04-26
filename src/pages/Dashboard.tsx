import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodayHabits } from '../hooks/useTodayHabits';
import { useHabitStore } from '../store/habitStore';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import type { Habit } from '../types';

type FormData = Omit<Habit, 'id' | 'createdAt'>;

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="text-6xl mb-4">🌑</div>
      <h2 className="font-display text-2xl text-text-primary mb-2">No habits yet</h2>
      <p className="text-text-muted text-sm max-w-xs mb-6">
        Start building discipline. Add your first habit and track it daily.
      </p>
      <Button variant="primary" size="lg" onClick={onAdd}>
        + Add First Habit
      </Button>
    </motion.div>
  );
}

function GreetingHeader({ completed, total }: { completed: number; total: number }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest mb-0.5">
            {day}, {date}
          </p>
          <h1 className="font-display text-3xl text-text-primary leading-tight">
            {greeting}.
          </h1>
        </div>
        {total > 0 && (
          <div className="flex-shrink-0">
            <ProgressRing value={pct} size={56} strokeWidth={5} color="#F0A500">
              <span className="font-mono text-xs text-amber-400">{pct}%</span>
            </ProgressRing>
          </div>
        )}
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-text-muted text-xs">
              {completed} of {total} habits done today
            </p>
            {completed === total && total > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-success font-medium"
              >
                ✓ Perfect day!
              </motion.span>
            )}
          </div>
          <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const addHabit = useHabitStore((s) => s.addHabit);
  const { todayHabits, completed, total } = useTodayHabits();

  const handleAddHabit = (data: FormData) => {
    addHabit(data);
    setShowForm(false);
  };

  const filtered = todayHabits.filter((x) => {
    if (filter === 'pending') return !x.log?.completed;
    if (filter === 'done') return x.log?.completed;
    return true;
  });

  const pendingCount = todayHabits.filter((x) => !x.log?.completed).length;
  const doneCount = todayHabits.filter((x) => x.log?.completed).length;

  return (
    <>
      <GreetingHeader completed={completed} total={total} />

      {total > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <div className="flex gap-1 flex-1 bg-surface-raised p-1 rounded-xl border border-border">
            {(['all', 'pending', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all',
                  filter === f
                    ? 'bg-amber-500 text-obsidian-900 font-semibold'
                    : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
              >
                {f === 'pending'
                  ? `Pending · ${pendingCount}`
                  : f === 'done'
                  ? `Done · ${doneCount}`
                  : `All · ${total}`}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            + Add
          </Button>
        </div>
      )}

      {total === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">
          {filter === 'pending' ? '🎉 All caught up!' : 'Nothing completed yet.'}
        </div>
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(({ habit, log }) => (
              <HabitCard key={habit.id} habit={habit} log={log} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {total > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowForm(true)}
            className="text-text-muted text-sm hover:text-text-secondary transition-colors"
          >
            + Add another habit
          </button>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Habit" size="md">
        <HabitForm
          onSubmit={handleAddHabit}
          onCancel={() => setShowForm(false)}
          submitLabel="Create Habit"
        />
      </Modal>
    </>
  );
}
