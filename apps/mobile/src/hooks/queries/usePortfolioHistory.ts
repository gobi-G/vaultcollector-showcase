import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";
import { useAuth } from "@/providers/AuthProvider";

type PortfolioDataPoint = {
  date: string;
  value: number;
};

async function fetchPortfolioHistory(userId: string): Promise<PortfolioDataPoint[]> {
  // Get all items for this user to know which item_ids to aggregate
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("id")
    .eq("user_id", userId);

  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];

  const itemIds = items.map((item) => item.id);

  // Get price history for all user items
  const { data: history, error: historyError } = await supabase
    .from("price_history")
    .select("item_id, price, recorded_at")
    .in("item_id", itemIds)
    .order("recorded_at", { ascending: true });

  if (historyError) throw historyError;
  if (!history || history.length === 0) return [];

  // Group by day and aggregate: for each day, sum the latest price per item up to that day
  const dayMap = new Map<string, Map<string, number>>();
  const latestPriceByItem = new Map<string, number>();
  const allDays: string[] = [];

  for (const record of history) {
    const day = record.recorded_at.split("T")[0];
    latestPriceByItem.set(record.item_id, record.price);

    if (!dayMap.has(day)) {
      dayMap.set(day, new Map());
      allDays.push(day);
    }

    // Snapshot all known prices at this day
    dayMap.set(day, new Map(latestPriceByItem));
  }

  // Convert to array of { date, value } by summing per-item prices for each day
  const result: PortfolioDataPoint[] = allDays.map((day) => {
    const pricesOnDay = dayMap.get(day)!;
    let total = 0;
    for (const price of pricesOnDay.values()) {
      total += price;
    }
    return { date: day, value: Math.round(total * 100) / 100 };
  });

  return result;
}

export function usePortfolioHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["portfolioHistory", user?.id],
    queryFn: () => fetchPortfolioHistory(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
