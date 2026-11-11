import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrackerPage from './pages/TrackerPage';

function Protected({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-sm text-zinc-500">Loading…</div>;
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Protected><TrackerPage /></Protected>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
