import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import DailyQuestion from '../components/tracker/DailyQuestion';
import AnswerOptions from '../components/tracker/AnswerOptions';
import SaveButton from '../components/tracker/SaveButton';
import ContributionCalendar from '../components/tracker/ContributionCalendar';
import StreakStatistics from '../components/tracker/StreakStatistics';
import { Card } from '../components/ui/primitives';
import { useDailyResponse } from '../hooks/useDailyResponse';
import { useContributionHistory } from '../hooks/useContributionHistory';
import { useStreak } from '../hooks/useStreak';

export default function TrackerPage() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const daily = useDailyResponse(userId);
  const { history, loading } = useContributionHistory(userId);
  const streak = useStreak(history);
  const [year, setYear] = useState(Number(daily.today.slice(0, 4)));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Header />

      <Card className="space-y-6 sm:!p-8">
        <DailyQuestion date={daily.today} />
        <AnswerOptions value={daily.selected} onChange={daily.setSelected} disabled={daily.locked} />
        <SaveButton onClick={daily.save} saving={daily.saving} disabled={daily.locked} />
        <div aria-live="polite" className="min-h-5 text-center text-sm">
          {daily.locked && (
            <span className="text-zinc-500">
              Today's answer is locked{daily.saved?.answer ? ` (${daily.saved.answer})` : ' (no answer saved)'}.
            </span>
          )}
          {!daily.locked && daily.message && <span className="text-green-600 dark:text-green-400">{daily.message}</span>}
          {daily.error && <span className="text-red-500">{daily.error}</span>}
        </div>
      </Card>

      <StreakStatistics current={streak.current} longest={streak.longest} />

      <Card>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading history…</p>
        ) : (
          <ContributionCalendar history={history} year={year} onYearChange={setYear} />
        )}
      </Card>
    </div>
  );
}
