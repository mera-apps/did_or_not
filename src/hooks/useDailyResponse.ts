import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isAfterCutoffIST, todayIST } from '../lib/date';
import type { Answer, DailyResponse } from '../types/database';

export function useDailyResponse(userId: string) {
  const [selected, setSelected] = useState<Answer>('YES'); // default is NOT a submission
  const [saved, setSaved] = useState<DailyResponse | null>(null);
  const [today, setToday] = useState(todayIST());
  const [afterCutoff, setAfterCutoff] = useState(isAfterCutoffIST());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const d = todayIST();
    setToday(d);
    const { data } = await supabase
      .from('daily_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('response_date', d)
      .maybeSingle();
    const row = (data as DailyResponse) ?? null;
    setSaved(row);
    if (row?.answer) setSelected(row.answer);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the lock state and date accurate while the tab stays open.
  useEffect(() => {
    const t = setInterval(() => {
      setAfterCutoff(isAfterCutoffIST());
      if (todayIST() !== today) load();
    }, 15000);
    return () => clearInterval(t);
  }, [today, load]);

  const locked = afterCutoff || !!saved?.is_finalized;

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    const { data, error: err } = await supabase.rpc('save_answer', { p_answer: selected });
    setSaving(false);
    if (err) {
      setError(err.message);
      load();
      return;
    }
    setSaved(data as DailyResponse);
    setMessage('Your answer has been saved successfully!');
  };

  return { today, selected, setSelected, saved, locked, saving, message, error, save };
}
