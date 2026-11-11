import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { daysInYear, shortDate, todayIST, weekday } from '../../lib/date';
import type { History } from '../../types/database';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CELL = 12;
const GAP = 3;

interface Props {
  history: History;
  year: number;
  onYearChange: (y: number) => void;
}

export default function ContributionCalendar({ history, year, onYearChange }: Props) {
  const today = todayIST();
  const currentYear = Number(today.slice(0, 4));

  const { cells, weeks, monthLabels } = useMemo(() => {
    const first = `${year}-01-01`;
    const offset = weekday(first); // Sunday-first columns
    const total = daysInYear(year);
    const cells: (string | null)[] = Array(offset).fill(null);
    const start = new Date(first + 'T00:00:00Z');
    for (let i = 0; i < total; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      cells.push(d.toISOString().slice(0, 10));
    }
    const weeks = Math.ceil(cells.length / 7);
    const monthLabels: { col: number; label: string }[] = [];
    cells.forEach((d, i) => {
      if (d && d.endsWith('-01')) monthLabels.push({ col: Math.floor(i / 7) + 1, label: MONTHS[Number(d.slice(5, 7)) - 1] });
    });
    return { cells, weeks, monthLabels };
  }, [year]);

  const colorOf = (d: string) => {
    if (d > today) return 'bg-zinc-100 dark:bg-zinc-900';
    const a = history[d];
    if (a === 'YES') return 'bg-red-500';
    if (a === 'NO') return 'bg-green-500';
    return 'bg-zinc-200 dark:bg-zinc-800';
  };
  const labelOf = (d: string) => {
    if (d > today) return 'Upcoming';
    return history[d] ?? 'No response';
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{year}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onYearChange(year - 1)}
            aria-label="Previous year"
            className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={year >= currentYear}
            aria-label="Next year"
            className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="w-max">
          <div
            className="mb-1 grid text-[10px] text-zinc-500"
            style={{ gridTemplateColumns: `repeat(${weeks}, ${CELL}px)`, columnGap: GAP }}
          >
            {monthLabels.map((m) => (
              <span key={m.label} style={{ gridColumnStart: m.col, gridRow: 1 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div
            className="grid"
            style={{
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              gridAutoFlow: 'column',
              gridAutoColumns: `${CELL}px`,
              gap: GAP,
            }}
          >
            {cells.map((d, i) =>
              d ? (
                <div
                  key={d}
                  title={`${shortDate(d)}: ${labelOf(d)}`}
                  className={`rounded-[3px] transition-colors ${colorOf(d)}`}
                />
              ) : (
                <div key={`pad-${i}`} />
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-[3px] bg-red-500" /> YES</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-[3px] bg-green-500" /> NO</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-[3px] bg-zinc-200 dark:bg-zinc-800" /> No response</span>
      </div>
    </div>
  );
}
