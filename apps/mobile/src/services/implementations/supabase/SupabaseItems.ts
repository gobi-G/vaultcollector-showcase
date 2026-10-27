import type { Item, ItemInsert, ItemUpdate } from "@vault-collector/shared";
import type { IItemRepository, QueryOptions } from "../../interfaces";
import { supabase } from "./SupabaseClient";
import { applyQueryOptions } from "./SupabaseUtils";

export const supabaseItems: IItemRepository = {
  async getAll(collectionId: string, options?: QueryOptions) {
    let query = supabase.from("items").select("*").eq("collection_id", collectionId);
    query = applyQueryOptions(query, options);
    const { data, error } = await query;
    if (error) throw error;
    return data as Item[];
  },

  async getAllByUser(userId: string, options?: QueryOptions) {
    let query = supabase.from("items").select("*").eq("user_id", userId);
    query = applyQueryOptions(query, options);
    const { data, error } = await query;
    if (error) throw error;
    return data as Item[];
  },

  async getByLocation(locationId: string) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("location_id", locationId)
      .order("name");
    if (error) throw error;
    return data as Item[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Item;
  },

  async create(data: ItemInsert) {
    const { data: result, error } = await supabase
      .from("items")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result as Item;
  },

  async update({ id, ...updates }: ItemUpdate) {
    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Item;
  },

  async delete(id: string) {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) throw error;
  },

  async getTotalValue(userId: string) {
    const { data, error } = await supabase
      .from("items")
      .select("current_market_price")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).reduce((sum, item) => sum + (item.current_market_price ?? 0), 0);
  },

  async getCount(userId: string) {
    const { count, error } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return count ?? 0;
  },
};
