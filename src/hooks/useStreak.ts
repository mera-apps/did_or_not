import { useMemo } from 'react';
import { addDays, todayIST } from '../lib/date';
import type { History } from '../types/database';

/** NO builds the streak. YES, NULL or a missing day breaks it. Finalized days only. */
export function computeStreaks(history: History, today: string) {
  // Current: walk back from today (if finalized) or yesterday.
  let cursor = today in history ? today : addDays(today, -1);
  let current = 0;
  while (history[cursor] === 'NO') {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Longest: runs of NO on consecutive calendar dates.
  let longest = 0;
  let run = 0;
  let prevNo: string | null = null;
  for (const d of Object.keys(history).sort()) {
    if (history[d] === 'NO') {
      run = prevNo && addDays(prevNo, 1) === d ? run + 1 : 1;
      prevNo = d;
      longest = Math.max(longest, run);
    } else {
      run = 0;
      prevNo = null;
    }
  }
  return { current, longest };
}

export function useStreak(history: History) {
  const today = todayIST();
  return useMemo(() => computeStreaks(history, today), [history, today]);
}
