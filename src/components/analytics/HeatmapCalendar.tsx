import { useMemo } from 'react';
import type { HeatmapEntry } from '../../types';

interface HeatmapCalendarProps {
  data: HeatmapEntry[];
}

function getColor(intensity: number, total: number): string {
  if (total === 0) return '#1A2540'; // no habits scheduled
  if (intensity === 0) return '#0D1420'; // scheduled but none done
  if (intensity <= 0.25) return 'rgba(240,165,0,0.2)';
  if (intensity <= 0.5) return 'rgba(240,165,0,0.4)';
  if (intensity <= 0.75) return 'rgba(240,165,0,0.65)';
  return '#F0A500';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    if (data.length === 0) return { weeks: [], monthLabels: [] };

    // Pad the start so the first day lines up with its weekday
    const firstDate = new Date(data[0].date + 'T00:00:00');
    const startPadding = firstDate.getDay(); // 0 = Sunday
    const paddedEntries: (HeatmapEntry | null)[] = [
      ...Array(startPadding).fill(null),
      ...data,
    ];

    // Chunk into columns of 7
    const weeks: (HeatmapEntry | null)[][] = [];
    for (let i = 0; i < paddedEntries.length; i += 7) {
      weeks.push(paddedEntries.slice(i, i + 7));
    }

    // Build month labels (position of each month's first occurrence)
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let col = 0; col < weeks.length; col++) {
      const firstReal = weeks[col].find((e): e is HeatmapEntry => e !== null);
      if (!firstReal) continue;
      const month = new Date(firstReal.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], col });
        lastMonth = month;
      }
    }

    return { weeks, monthLabels: labels };
  }, [data]);

  if (weeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-text-muted text-sm">
        No data yet
      </div>
    );
  }

  const cellSize = 11;
  const gap = 2;
  const stride = cellSize + gap;

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div style={{ position: 'relative', minWidth: weeks.length * stride + 36 }}>
        {/* Month labels */}
        <div style={{ marginLeft: 36, marginBottom: 4, display: 'flex', position: 'relative', height: 14 }}>
          {monthLabels.map(({ label, col }) => (
            <span
              key={label + col}
              style={{
                position: 'absolute',
                left: col * stride,
                fontSize: 10,
                color: '#4A5C72',
                whiteSpace: 'nowrap',
                fontFamily: 'DM Mono, monospace',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {/* Weekday labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4, paddingTop: 0 }}>
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 9,
                  color: '#4A5C72',
                  fontFamily: 'DM Mono, monospace',
                  width: 28,
                  justifyContent: 'flex-end',
                  paddingRight: 4,
                  opacity: i % 2 === 0 ? 1 : 0, // only show every other label
                }}
              >
                {i % 2 === 0 ? d : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: 2 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {week.map((entry, di) => (
                  <div
                    key={di}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 2,
                      backgroundColor: entry
                        ? getColor(entry.intensity, entry.total)
                        : 'transparent',
                      cursor: entry ? 'pointer' : 'default',
                    }}
                    title={
                      entry
                        ? `${entry.date}: ${entry.count}/${entry.total} habits`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-text-muted text-xs">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <div
              key={v}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: v === 0 ? '#0D1420' : getColor(v, 1),
              }}
            />
          ))}
          <span className="text-text-muted text-xs">More</span>
        </div>
      </div>
    </div>
  );
}
