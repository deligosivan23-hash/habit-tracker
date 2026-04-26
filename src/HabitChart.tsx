import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';

interface WeekBarData {
  label: string;
  completed: number;
  total: number;
  rate: number;
}

interface HabitBarChartProps {
  data: WeekBarData[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: WeekBarData }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-raised border border-border rounded-xl px-3 py-2 shadow-surface">
      <p className="text-text-secondary text-xs font-mono mb-1">{label}</p>
      <p className="text-amber-400 text-sm font-mono">
        {d.completed}/{d.total} completed
      </p>
      <p className="text-text-muted text-xs">{Math.round(d.rate * 100)}% rate</p>
    </div>
  );
};

export function HabitBarChart({ data }: HabitBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2A40" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4A5C72', fontSize: 11, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4A5C72', fontSize: 11, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,165,0,0.05)' }} />
        <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.rate === 1
                  ? '#10B981'
                  : entry.rate >= 0.5
                  ? '#F0A500'
                  : '#1E2A40'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface CompletionLineData {
  label: string;
  rate: number;
}

interface CompletionLineChartProps {
  data: CompletionLineData[];
  color?: string;
}

export function CompletionLineChart({ data, color = '#F0A500' }: CompletionLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2A40" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4A5C72', fontSize: 10, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4A5C72', fontSize: 10, fontFamily: 'DM Mono' }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={(v: number) => [`${Math.round(v)}%`, 'Completion']}
          contentStyle={{
            background: '#121B2D',
            border: '1px solid #1E2A40',
            borderRadius: 12,
            fontFamily: 'DM Mono',
            fontSize: 12,
          }}
          labelStyle={{ color: '#94A3B8' }}
          itemStyle={{ color }}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
