-- Search cache table for card search results
-- Stores query + tcg_type → JSONB results with a 24h TTL (enforced at app level)

CREATE TABLE IF NOT EXISTS search_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query text NOT NULL,
  tcg_type text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (query, tcg_type)
);

-- Index for fast lookups by query + tcg_type
CREATE INDEX IF NOT EXISTS idx_search_cache_query_type
  ON search_cache (query, tcg_type);

-- Index for TTL cleanup
CREATE INDEX IF NOT EXISTS idx_search_cache_created_at
  ON search_cache (created_at);

-- Enable RLS
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cache entries
CREATE POLICY "Authenticated users can read search cache"
  ON search_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert cache entries
CREATE POLICY "Authenticated users can insert search cache"
  ON search_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow service role full access (for upsert from Edge Functions)
CREATE POLICY "Service role has full access to search cache"
  ON search_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
