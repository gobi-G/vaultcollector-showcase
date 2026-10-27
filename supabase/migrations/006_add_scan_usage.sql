-- Track AI scan usage per user per month
-- Used to enforce tier-based scan limits

CREATE TABLE IF NOT EXISTS scan_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL, -- format: "2026-03"
  scan_count integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_scan_usage_user_month
  ON scan_usage (user_id, month);

-- RLS
ALTER TABLE scan_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan usage"
  ON scan_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert/update (from Edge Function)
CREATE POLICY "Service role full access"
  ON scan_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
