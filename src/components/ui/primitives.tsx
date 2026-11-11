import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
        className,
      )}
    />
  );
}

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={cn(
        'w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-700',
        className,
      )}
    />
  );
}

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...p}
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6',
        className,
      )}
    />
  );
}
