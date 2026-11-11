import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import ThemeToggle from '../components/layout/ThemeToggle';
import { Card } from '../components/ui/primitives';

export default function LoginPage() {
  const { session } = useAuth();
  const location = useLocation();
  if (session) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Log in</h1>
        <LoginForm justRegistered={!!(location.state as { registered?: boolean } | null)?.registered} />
      </Card>
    </div>
  );
}
