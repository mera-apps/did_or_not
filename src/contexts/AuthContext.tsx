import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, signupClient, usernameToEmail } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (name: string, username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile((data as Profile) ?? null));
  }, [session?.user.id]);

  const signIn = async (username: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error) throw new Error('Invalid username or password');
  };

  const signUp = async (name: string, username: string, password: string) => {
    const uname = username.trim().toLowerCase();
    const { data: free, error: checkErr } = await supabase.rpc('username_available', { p_username: uname });
    if (checkErr) throw new Error('Could not check username. Try again.');
    if (!free) throw new Error('That username is already taken');

    const { error } = await signupClient.auth.signUp({
      email: usernameToEmail(uname),
      password,
      options: { data: { name: name.trim(), username: uname } },
    });
    if (error) {
      if (/already|registered|database error/i.test(error.message)) {
        throw new Error('That username is already taken');
      }
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
