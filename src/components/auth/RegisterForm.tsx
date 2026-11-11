import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../ui/primitives';

export default function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!name.trim() || name.trim().length > 60) return 'Enter your name (max 60 characters)';
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) return 'Username: 3–20 letters, numbers or underscores';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setBusy(true);
    try {
      await signUp(name, username, password);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input placeholder="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" placeholder="Password (min 8 characters)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full">{busy ? 'Creating…' : 'Register'}</Button>
      <p className="text-center text-sm text-zinc-500">
        Already registered? <Link to="/login" className="font-medium underline">Log in</Link>
      </p>
    </form>
  );
}
