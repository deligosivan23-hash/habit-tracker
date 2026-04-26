type BadgeVariant = 'amber' | 'success' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  success: 'bg-success/15 text-success border border-success/25',
  danger: 'bg-danger/15 text-danger border border-danger/25',
  info: 'bg-info/15 text-info border border-info/25',
  neutral: 'bg-surface-overlay text-text-secondary border border-border',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
