import { useState } from 'react';
import type { Habit, DayOfWeek, TimeOfDay, HabitType } from '../../types';
import { Button } from '../ui/Button';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EMOJIS = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎯', '🧠', '🎵', '🌿', '🔥', '❤️', '🌅', '⚡'];
const COLORS = [
  '#F0A500', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#EF4444', '#F97316', '#06B6D4',
  '#84CC16', '#A78BFA', '#FB923C', '#34D399',
];

type FormData = Omit<Habit, 'id' | 'createdAt'>;

interface HabitFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function HabitForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Habit',
}: HabitFormProps) {
  const [form, setForm] = useState<FormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    emoji: initialData?.emoji ?? '🎯',
    color: initialData?.color ?? '#F0A500',
    type: initialData?.type ?? 'checklist',
    scheduledDays: initialData?.scheduledDays ?? [],
    timeOfDay: initialData?.timeOfDay ?? 'morning',
    customTime: initialData?.customTime ?? '',
    targetDuration: initialData?.targetDuration ?? 1800,
    archived: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleDay = (day: DayOfWeek) => {
    const days = form.scheduledDays.includes(day)
      ? form.scheduledDays.filter((d) => d !== day)
      : [...form.scheduledDays, day];
    set('scheduledDays', days);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.name.length > 60) newErrors.name = 'Max 60 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const isTimed = form.type === 'timed' || form.type === 'both';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
          Habit Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Read for 30 minutes"
          maxLength={60}
          className={[
            'w-full bg-surface border rounded-lg px-4 py-2.5 text-text-primary',
            'placeholder:text-text-muted font-body text-sm',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all',
            errors.name ? 'border-danger' : 'border-border focus:border-amber-500/60',
          ].join(' ')}
        />
        {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What does this habit do for you?"
          rows={2}
          maxLength={200}
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted font-body text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all resize-none"
        />
      </div>

      {/* Emoji + Color row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Emoji */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
            Icon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => set('emoji', e)}
                className={[
                  'w-8 h-8 text-base rounded-md flex items-center justify-center transition-all',
                  form.emoji === e
                    ? 'bg-amber-500/20 ring-1 ring-amber-500 scale-110'
                    : 'bg-surface-overlay hover:bg-surface-overlay/80',
                ].join(' ')}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
            Color Tag
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => set('color', c)}
                className={[
                  'w-7 h-7 rounded-full transition-transform',
                  form.color === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110',
                ].join(' ')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
          Habit Type
        </label>
        <div className="flex gap-2">
          {(['checklist', 'timed', 'both'] as HabitType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => set('type', t)}
              className={[
                'flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all border',
                form.type === t
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-surface border-border text-text-secondary hover:border-border-bright',
              ].join(' ')}
            >
              {t === 'both' ? 'Timed + Check' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Target duration — only for timed */}
      {isTimed && (
        <div>
          <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
            Target Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={480}
            value={Math.round((form.targetDuration ?? 1800) / 60)}
            onChange={(e) => set('targetDuration', Math.round(Number(e.target.value)) * 60)}
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all"
          />
        </div>
      )}

      {/* Scheduled Days */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
          Schedule{' '}
          <span className="text-text-muted normal-case">
            (leave empty for every day)
          </span>
        </label>
        <div className="flex gap-1.5">
          {DAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={[
                'flex-1 py-2 text-xs font-mono rounded-md transition-all border',
                form.scheduledDays.includes(day)
                  ? 'bg-amber-500 text-obsidian-900 border-amber-500 font-semibold'
                  : 'bg-surface border-border text-text-muted hover:border-border-bright hover:text-text-secondary',
              ].join(' ')}
            >
              {day.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-1.5">
          Time of Day
        </label>
        <div className="flex gap-2">
          {(['morning', 'afternoon', 'evening', 'custom'] as TimeOfDay[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => set('timeOfDay', t)}
              className={[
                'flex-1 py-2 px-2 rounded-lg text-xs capitalize transition-all border',
                form.timeOfDay === t
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-surface border-border text-text-secondary hover:border-border-bright',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
        {form.timeOfDay === 'custom' && (
          <input
            type="time"
            value={form.customTime ?? ''}
            onChange={(e) => set('customTime', e.target.value)}
            className="mt-2 w-full bg-surface border border-border rounded-lg px-4 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
