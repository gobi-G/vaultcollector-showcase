-- Global AI budget tracking to prevent cost explosion
-- Counts total scans across ALL users per day
-- Pro users bypass this limit

CREATE TABLE IF NOT EXISTS public.ai_daily_budget (
  date text PRIMARY KEY,
  scan_count integer NOT NULL DEFAULT 0,
  max_budget integer NOT NULL DEFAULT 1000
);

-- RLS: Only service role can read/write (Edge Functions use service role key)
ALTER TABLE public.ai_daily_budget ENABLE ROW LEVEL SECURITY;
