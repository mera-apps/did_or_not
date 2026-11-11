-- Requires the pg_cron extension (Dashboard > Database > Extensions if this line errors).
create extension if not exists pg_cron;

-- pg_cron runs in UTC. 11:00 PM IST (UTC+5:30, no DST) = 17:30 UTC.
select cron.schedule('finalize-daily-2300-ist', '30 17 * * *', $$select public.finalize_daily_responses();$$);

-- Hourly recovery run: finalizes anything missed (late/skipped runs). Safe to repeat.
select cron.schedule('finalize-daily-recovery', '5 * * * *', $$select public.finalize_daily_responses();$$);
