import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { HabitForm } from '../components/habits/HabitForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { isHabitScheduledForDate } from '../utils/dateUtils';
import type { Habit, DayOfWeek } from '../types';

type FormData = Omit<Habit, 'id' | 'createdAt'>;

const DAY_SHORT: Record<string, string> = {
  Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S',
};
const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function HabitRow({ habit, onEdit, onDelete }: {
  habit: Habit;
  onEdit: (h: Habit) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const scheduledToday = isHabitScheduledForDate(habit.scheduledDays, today);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-surface-raised border border-border rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:border-border-bright transition-colors group"
      onClick={() => navigate(`/habit/${habit.id}`)}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: habit.color }}
      />
      <div className="pl-3 flex items-start gap-3">
        {/* Emoji */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${habit.color}18` }}
        >
          {habit.emoji}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-medium text-text-primary text-sm truncate">{habit.name}</h3>
            {scheduledToday && (
              <Badge variant="amber">Today</Badge>
            )}
          </div>
          {habit.description && (
            <p className="text-text-muted text-xs truncate mb-1.5">{habit.description}</p>
          )}
          {/* Schedule dots */}
          <div className="flex items-center gap-1">
            {ALL_DAYS.map((d) => (
              <div
                key={d}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono"
                style={
                  habit.scheduledDays.length === 0 || habit.scheduledDays.includes(d)
                    ? { backgroundColor: `${habit.color}25`, color: habit.color }
                    : { backgroundColor: '#1E2A40', color: '#4A5C72' }
                }
              >
                {DAY_SHORT[d]}
              </div>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div
          className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(habit)}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="text-text-muted hover:text-danger transition-colors p-1"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function HabitsPage() {
  const habits = useHabitStore((s) => s.habits.filter((h) => !h.archived));
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [showAdd, setShowAdd] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = (data: FormData) => {
    addHabit(data);
    setShowAdd(false);
  };

  const handleUpdate = (data: FormData) => {
    if (!editingHabit) return;
    updateHabit(editingHabit.id, data);
    setEditingHabit(null);
  };

  const deletingHabit = habits.find((h) => h.id === deletingId);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-text-primary">All Habits</h1>
          <p className="text-text-muted text-xs mt-0.5 font-mono">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          + New Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="font-display text-xl text-text-primary mb-2">No habits yet</h2>
          <p className="text-text-muted text-sm mb-5">Create your first habit to get started.</p>
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            + New Habit
          </Button>
        </div>
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onEdit={setEditingHabit}
                onDelete={setDeletingId}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Habit" size="md">
        <HabitForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel="Create Habit"
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editingHabit} onClose={() => setEditingHabit(null)} title="Edit Habit" size="md">
        {editingHabit && (
          <HabitForm
            initialData={editingHabit}
            onSubmit={handleUpdate}
            onCancel={() => setEditingHabit(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Habit?" size="sm">
        <p className="text-text-secondary text-sm mb-5">
          Permanently delete <strong className="text-text-primary">{deletingHabit?.name}</strong>?
          All logs will be lost.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (deletingId) deleteHabit(deletingId);
              setDeletingId(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
