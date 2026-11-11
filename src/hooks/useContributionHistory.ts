import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Answer, History } from '../types/database';

/** Loads all FINALIZED responses of the user (paged past the 1000-row API default). */
export function useContributionHistory(userId: string) {
  const [history, setHistory] = useState<History>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const out: History = {};
    const page = 1000;
    for (let from = 0; ; from += page) {
      const { data, error } = await supabase
        .from('daily_responses')
        .select('response_date, answer')
        .eq('user_id', userId)
        .eq('is_finalized', true)
        .order('response_date')
        .range(from, from + page - 1);
      if (error || !data) break;
      for (const r of data as { response_date: string; answer: Answer | null }[]) {
        out[r.response_date] = r.answer;
      }
      if (data.length < page) break;
    }
    setHistory(out);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  return { history, loading };
}
