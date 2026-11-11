import { prettyDate } from '../../lib/date';

export default function DailyQuestion({ date }: { date: string }) {
  return (
    <div className="text-center">
      <p className="text-sm text-zinc-500">{prettyDate(date)} · IST</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Did you complete it?</h2>
    </div>
  );
}
