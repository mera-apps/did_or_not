import type { Answer } from '../../types/database';

interface Props {
  value: Answer;
  onChange: (a: Answer) => void;
  disabled: boolean;
}

const styles = {
  YES: {
    on: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
  NO: {
    on: 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400',
    dot: 'bg-green-500',
  },
} as const;

export default function AnswerOptions({ value, onChange, disabled }: Props) {
  return (
    <div role="radiogroup" aria-label="Did you complete it?" className="grid grid-cols-2 gap-3 sm:gap-4">
      {(['YES', 'NO'] as const).map((a) => {
        const active = value === a;
        return (
          <label
            key={a}
            className={`flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 py-6 text-2xl font-bold transition sm:py-8 ${
              active ? styles[a].on : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 dark:border-zinc-800'
            } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="answer"
              value={a}
              checked={active}
              disabled={disabled}
              onChange={() => onChange(a)}
              className="sr-only"
            />
            <span
              className={`h-5 w-5 rounded-full border-2 ${
                active ? `${styles[a].dot} border-transparent` : 'border-zinc-400'
              }`}
            />
            {a}
          </label>
        );
      })}
    </div>
  );
}
