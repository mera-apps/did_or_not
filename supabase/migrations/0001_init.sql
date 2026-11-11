-- Daily YES/NO Tracker: schema, security, RPCs, finalization

-- ============ TABLES ============
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 60),
  username   text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

create table public.daily_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  response_date date not null,
  answer        text check (answer in ('YES','NO')),   -- NULL = no answer
  is_finalized  boolean not null default false,
  saved_at      timestamptz,
  finalized_at  timestamptz,
  created_at    timestamptz not null default now(),
  constraint daily_responses_user_date_key unique (user_id, response_date)
);
create index daily_responses_user_date_idx on public.daily_responses (user_id, response_date);

-- ============ PROFILE CREATION ON SIGN-UP ============
-- Username/name come from signUp() metadata. Duplicate usernames abort sign-up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username)
  values (new.id, trim(new.raw_user_meta_data->>'name'), lower(trim(new.raw_user_meta_data->>'username')));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ FINALIZED ROWS ARE IMMUTABLE ============
create or replace function public.guard_finalized()
returns trigger language plpgsql as $$
begin
  if old.is_finalized then
    raise exception 'Finalized records cannot be modified';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create trigger daily_responses_guard
  before update or delete on public.daily_responses
  for each row execute function public.guard_finalized();

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles        enable row level security;
alter table public.daily_responses enable row level security;

create policy "read own profile"   on public.profiles        for select to authenticated using (id = auth.uid());
create policy "read own responses" on public.daily_responses for select to authenticated using (user_id = auth.uid());

-- No client INSERT/UPDATE/DELETE: all writes go through save_answer() / finalize job.
revoke insert, update, delete on public.profiles        from anon, authenticated;
revoke insert, update, delete on public.daily_responses from anon, authenticated;
revoke all on public.profiles, public.daily_responses from anon;

-- ============ RPC: username availability (pre-check on sign-up) ============
create or replace function public.username_available(p_username text)
returns boolean language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where username = lower(trim(p_username)));
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ============ RPC: save today's answer (IST, before 11 PM) ============
create or replace function public.save_answer(p_answer text)
returns public.daily_responses language plpgsql security definer set search_path = public as $$
declare
  v_now   timestamp := now() at time zone 'Asia/Kolkata';
  v_today date     := (now() at time zone 'Asia/Kolkata')::date;
  r       public.daily_responses;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_answer is null or p_answer not in ('YES','NO') then raise exception 'Invalid answer'; end if;
  if v_now::time >= time '23:00' then
    raise exception 'Answers are locked after 11:00 PM IST';
  end if;

  insert into public.daily_responses (user_id, response_date, answer, saved_at)
  values (auth.uid(), v_today, p_answer, now())
  on conflict (user_id, response_date) do update
    set answer = excluded.answer, saved_at = excluded.saved_at
    where public.daily_responses.is_finalized = false
  returning * into r;

  if r.id is null then raise exception 'Today''s record is already finalized'; end if;
  return r;
end $$;
revoke all on function public.save_answer(text) from public, anon;
grant execute on function public.save_answer(text) to authenticated;

-- ============ FINALIZATION (idempotent, self-healing) ============
-- Finalizes every day up to the cutoff: today (IST) if it is >= 11 PM IST, else yesterday.
--  * saved answers are locked as-is
--  * days with no saved answer are stored as NULL
--  * days missed because the job ran late/never ran are back-filled from the user's sign-up date
--  * already finalized rows are never touched
create or replace function public.finalize_daily_responses()
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_now    timestamp := now() at time zone 'Asia/Kolkata';
  v_cutoff date;
  v_count  integer;
begin
  v_cutoff := case when v_now::time >= time '23:00' then v_now::date else v_now::date - 1 end;

  insert into public.daily_responses (user_id, response_date, answer, is_finalized, finalized_at)
  select p.id, d::date, null, true, now()
  from public.profiles p
  cross join lateral generate_series(
    (p.created_at at time zone 'Asia/Kolkata')::date, v_cutoff, interval '1 day') as d
  on conflict (user_id, response_date) do nothing;

  update public.daily_responses
     set is_finalized = true, finalized_at = now()
   where is_finalized = false and response_date <= v_cutoff;
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke all on function public.finalize_daily_responses() from public, anon, authenticated;
