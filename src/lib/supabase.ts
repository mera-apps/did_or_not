import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env');
}

export const supabase = createClient(url, key);

// Separate, non-persisting client for sign-up so registering never creates a browser session.
export const signupClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const DOMAIN = (import.meta.env.VITE_AUTH_EMAIL_DOMAIN as string) || 'dailytracker.app';
export const usernameToEmail = (username: string) => `${username.trim().toLowerCase()}@${DOMAIN}`;
