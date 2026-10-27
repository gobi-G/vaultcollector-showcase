import type { PriceHistory } from "../types/index.ts";
import { getServiceClient } from "./base.repository.ts";

export const priceHistoryRepository = {
  async create(data: Omit<PriceHistory, "id" | "recorded_at">): Promise<PriceHistory> {
    const { data: result, error } = await getServiceClient()
      .from("price_history")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result as PriceHistory;
  },

  async getLatest(itemId: string, source?: string): Promise<PriceHistory | null> {
    let query = getServiceClient()
      .from("price_history")
      .select("*")
      .eq("item_id", itemId)
      .order("recorded_at", { ascending: false })
      .limit(1);

    if (source) {
      query = query.eq("source", source);
    }

    const { data, error } = await query.single();
    if (error && error.code !== "PGRST116") throw error;
    return (data as PriceHistory) ?? null;
  },
};
