interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, icon, accent }: MetricCardProps) {
  return (
    <div
      className={[
        'rounded-xl p-4 border transition-colors',
        accent
          ? 'bg-amber-500/8 border-amber-500/20'
          : 'bg-surface-raised border-border',
      ].join(' ')}
    >
      {icon && (
        <div className="text-2xl mb-2 leading-none">{icon}</div>
      )}
      <p className="text-text-muted text-xs font-body uppercase tracking-widest mb-1">{label}</p>
      <p
        className={[
          'font-mono text-2xl font-medium',
          accent ? 'text-amber-400' : 'text-text-primary',
        ].join(' ')}
      >
        {value}
      </p>
      {sub && <p className="text-text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}
