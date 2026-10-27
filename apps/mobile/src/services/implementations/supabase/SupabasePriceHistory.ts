import type { PriceHistory } from "@vault-collector/shared";
import type { IPriceHistoryRepository, QueryOptions } from "../../interfaces";
import { supabase } from "./SupabaseClient";
import { applyQueryOptions } from "./SupabaseUtils";

export const supabasePriceHistory: IPriceHistoryRepository = {
  async getByItem(itemId: string, options?: QueryOptions) {
    let query = supabase.from("price_history").select("*").eq("item_id", itemId);
    query = applyQueryOptions(query, options);
    const { data, error } = await query;
    if (error) throw error;
    return data as PriceHistory[];
  },

  async create(data: Omit<PriceHistory, "id" | "recorded_at">) {
    const { data: result, error } = await supabase
      .from("price_history")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result as PriceHistory;
  },

  async getLatestPrice(itemId: string) {
    const { data, error } = await supabase
      .from("price_history")
      .select("price")
      .eq("item_id", itemId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data?.price ?? null;
  },
};
