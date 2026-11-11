import { Card } from '../ui/primitives';

export default function StreakStatistics({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="!p-4 text-center">
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{current}</p>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Current NO Streak</p>
      </Card>
      <Card className="!p-4 text-center">
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{longest}</p>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Longest NO Streak</p>
      </Card>
    </div>
  );
}
