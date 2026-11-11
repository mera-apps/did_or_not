import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui/primitives';

export default function LoginForm({ justRegistered }: { justRegistered: boolean }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) return setError('Enter your username and password');
    setBusy(true);
    try {
      await signIn(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {justRegistered && (
        <p className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          Registration successful. Please log in.
        </p>
      )}
      <Input placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Logging in…' : 'Log in'}</Button>
      <p className="text-center text-sm text-zinc-500">
        New here? <Link to="/register" className="font-medium underline">Create an account</Link>
      </p>
    </form>
  );
}
