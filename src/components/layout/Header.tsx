import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { profile, signOut } = useAuth();
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Daily Tracker</h1>
        {profile && <p className="text-sm text-zinc-500">{profile.name} · @{profile.username}</p>}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
