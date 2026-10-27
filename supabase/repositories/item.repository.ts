import type { Item } from "../types/index.ts";
import { getServiceClient } from "./base.repository.ts";

export const itemRepository = {
  async getAllByUser(userId: string): Promise<Item[]> {
    const { data, error } = await getServiceClient()
      .from("items")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as Item[];
  },

  async getItemsNeedingPriceUpdate(limit = 100): Promise<Item[]> {
    const { data, error } = await getServiceClient()
      .from("items")
      .select("*")
      .eq("category", "tcg")
      .order("updated_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data as Item[];
  },

  async updatePrice(itemId: string, price: number): Promise<void> {
    const { error } = await getServiceClient()
      .from("items")
      .update({ current_market_price: price })
      .eq("id", itemId);
    if (error) throw error;
  },

  async getCount(userId: string): Promise<number> {
    const { count, error } = await getServiceClient()
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return count ?? 0;
  },
};
