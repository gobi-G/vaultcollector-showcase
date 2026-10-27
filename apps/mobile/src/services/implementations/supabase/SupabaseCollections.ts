import type {
  Collection,
  CollectionInsert,
  CollectionUpdate,
} from "@vault-collector/shared";
import type { ICollectionRepository, QueryOptions } from "../../interfaces";
import { supabase } from "./SupabaseClient";
import { applyQueryOptions } from "./SupabaseUtils";

export const supabaseCollections: ICollectionRepository = {
  async getAll(userId: string, options?: QueryOptions) {
    let query = supabase.from("collections").select("*").eq("user_id", userId);
    query = applyQueryOptions(query, options);
    const { data, error } = await query;
    if (error) throw error;
    return data as Collection[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Collection;
  },

  async create(data: CollectionInsert) {
    const { data: result, error } = await supabase
      .from("collections")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result as Collection;
  },

  async update({ id, ...updates }: CollectionUpdate) {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Collection;
  },

  async delete(id: string) {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw error;
  },

  async getItemCount(collectionId: string) {
    const { count, error } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("collection_id", collectionId);
    if (error) throw error;
    return count ?? 0;
  },
};
