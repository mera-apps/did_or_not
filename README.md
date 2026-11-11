# Daily YES/NO Tracker

React + TypeScript + Vite + Tailwind + Supabase. One question every day — **"Did you complete it?"** — YES (red) or NO (green), a LeetCode-style yearly calendar, and **NO streaks**. Days are finalized automatically at **11:00 PM IST** by a Postgres cron job.

## 1. Install
```bash
npm install
cp .env.example .env     # then fill in the values (step 2)
```

## 2. Supabase setup
1. Create a project at https://supabase.com.
2. **Authentication → Providers → Email**: turn **OFF "Confirm email"** (users have no real email; usernames are mapped to internal addresses like `username@dailytracker.app`, and no mail is ever sent). Keep Email provider enabled.
3. **SQL Editor**: run, in order, the contents of
   - `supabase/migrations/0001_init.sql` (tables, RLS, triggers, `save_answer`, `finalize_daily_responses`)
   - `supabase/migrations/0002_cron.sql` (schedules finalization; if `create extension pg_cron` errors, enable **pg_cron** under *Database → Extensions* and re-run)
   (Or use the CLI: `supabase link --project-ref <ref> && supabase db push`.)
4. **Project Settings → API**: copy *Project URL* and the **anon public** key into `.env`. Never put the `service_role` key in the frontend.

## 3. Run locally
```bash
npm run dev      # http://localhost:5173
```
Register → you are sent to Login → Log in → tracker page.

## 4. Deploy
`npm run build` produces `dist/`. Deploy to Vercel / Netlify / Cloudflare Pages / any static host:
- Build command `npm run build`, output `dist`
- Add env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_AUTH_EMAIL_DOMAIN`)
- Add an SPA fallback so all routes serve `index.html` (Netlify: `/* /index.html 200`; Vercel: rewrite to `/index.html`)

## How it works
- **Username login**: no email needed. The username is mapped to `username@<VITE_AUTH_EMAIL_DOMAIN>` for Supabase Auth; a DB trigger creates the `profiles` row (unique username). Passwords are hashed by Supabase Auth. Keep the domain value identical at registration and login (don't change it after users exist).
- **Saving**: clients cannot write tables directly. They call `save_answer()` (security definer), which uses the IST date, rejects saves from 11:00 PM IST, and never touches finalized rows. YES is only a UI default — nothing is stored until Save is pressed.
- **Finalization**: `finalize_daily_responses()` runs at 17:30 UTC (= 11:00 PM IST) plus an hourly recovery run. It locks saved answers, stores NULL for unanswered days, back-fills any missed days since sign-up, and is idempotent. A trigger blocks any update/delete of finalized rows.
- **RLS**: users can only SELECT their own profile and responses.
- **Streaks**: finalized days only; NO increments, YES / NULL / missing day resets.
- **Password reset**: manual by the admin in Supabase → Authentication → Users.
- **Manual finalize / test** (SQL editor): `select public.finalize_daily_responses();`
