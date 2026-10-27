import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { env } from "../config/env.ts";

// Service role client — bypasses RLS, only for backend use
export function getServiceClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
