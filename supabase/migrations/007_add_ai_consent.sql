-- DSGVO Compliance: AI Scan Consent (Art. 6(1)(a) DSGVO)
-- ai_consent_given: explicit user consent for photo processing via OpenAI
-- ai_consent_at:    ISO timestamp of consent grant (audit trail, not overwritten on revoke)
-- RLS: Covered by existing "Users can update own profile" policy (auth.uid() = id) from 001_initial_schema.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_consent_given boolean,
  ADD COLUMN IF NOT EXISTS ai_consent_at timestamptz;
