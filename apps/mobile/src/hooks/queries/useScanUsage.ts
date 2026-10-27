import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";
import { useAuth } from "@/providers/AuthProvider";
import { TIER_LIMITS } from "@vault-collector/shared";
import type { SubscriptionTier } from "@vault-collector/shared";
import { useProfile } from "./useProfile";

export function useScanUsage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const tier = (profile?.subscription_tier ?? "free") as SubscriptionTier;
  const maxScans = TIER_LIMITS[tier].maxAiScans;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const query = useQuery({
    queryKey: ["scanUsage", user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("scan_usage")
        .select("scan_count")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .maybeSingle();
      return (data as { scan_count: number } | null)?.scan_count ?? 0;
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  const used = query.data ?? 0;
  const limit = maxScans === Infinity ? -1 : maxScans;
  const remaining = maxScans === Infinity ? -1 : Math.max(0, maxScans - used);
  const isUnlimited = maxScans === Infinity;

  return { used, limit, remaining, isUnlimited, isLoading: query.isLoading, refetch: query.refetch };
}
