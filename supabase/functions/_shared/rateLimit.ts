import { createClient } from "npm:@supabase/supabase-js@2";
import { RateLimitError } from "./errors.ts";

const AI_LIMITS: Record<string, number> = {
  free: 10,
  premium: 50,
  pro: Infinity,
};

export async function checkMonthlyAiLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tier: string,
): Promise<void> {
  const maxScans = AI_LIMITS[tier] ?? 5;
  if (maxScans === Infinity) return;

  const month = new Date().toISOString().slice(0, 7);
  const { data } = await supabase
    .from("scan_usage")
    .select("scan_count")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  const current = data?.scan_count ?? 0;
  if (current >= maxScans) {
    throw new RateLimitError(
      `Monthly AI limit reached (${maxScans}). Upgrade for more.`,
    );
  }
}

export async function incrementMonthlyAiUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await supabase
    .from("scan_usage")
    .select("scan_count")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  const current = data?.scan_count ?? 0;
  supabase
    .from("scan_usage")
    .upsert(
      { user_id: userId, month, scan_count: current + 1 },
      { onConflict: "user_id,month" },
    )
    .then(() => {})
    .catch(() => {});
}

const GLOBAL_DAILY_MAX = 1000;

export async function checkGlobalAiBudget(
  supabase: ReturnType<typeof createClient>,
  tier: string,
): Promise<void> {
  if (tier === "pro") return;

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("ai_daily_budget")
    .select("scan_count")
    .eq("date", today)
    .maybeSingle();

  const current = data?.scan_count ?? 0;
  if (current >= GLOBAL_DAILY_MAX) {
    throw new RateLimitError("Global daily AI budget exhausted. Try again tomorrow.");
  }
}

export async function incrementGlobalAiBudget(
  supabase: ReturnType<typeof createClient>,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("ai_daily_budget")
    .select("scan_count")
    .eq("date", today)
    .maybeSingle();

  const current = data?.scan_count ?? 0;
  supabase
    .from("ai_daily_budget")
    .upsert(
      { date: today, scan_count: current + 1, max_budget: GLOBAL_DAILY_MAX },
      { onConflict: "date" },
    )
    .then(() => {})
    .catch(() => {});
}

export async function getMonthlyAiUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ current: number; max: number; tier: string }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = profile?.subscription_tier ?? "free";
  const max = AI_LIMITS[tier] ?? 5;

  const month = new Date().toISOString().slice(0, 7);
  const { data } = await supabase
    .from("scan_usage")
    .select("scan_count")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  return { current: data?.scan_count ?? 0, max, tier };
}
