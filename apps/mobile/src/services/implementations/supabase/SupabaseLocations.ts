import type { Location, LocationInsert, LocationUpdate } from "@vault-collector/shared";
import type { ILocationRepository } from "../../interfaces/LocationInterface";
import { supabase } from "./SupabaseClient";

export const supabaseLocations: ILocationRepository = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (error) throw error;
    return data as Location[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Location;
  },

  async getChildren(parentId: string) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("parent_id", parentId)
      .order("name");
    if (error) throw error;
    return data as Location[];
  },

  async getRootLocations(userId: string) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("user_id", userId)
      .is("parent_id", null)
      .order("name");
    if (error) throw error;
    return data as Location[];
  },

  async create(data: LocationInsert) {
    const { data: result, error } = await supabase
      .from("locations")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result as Location;
  },

  async update({ id, ...updates }: LocationUpdate) {
    const { data, error } = await supabase
      .from("locations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Location;
  },

  async delete(id: string) {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) throw error;
  },

  async getItemCount(locationId: string) {
    const { count, error } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("location_id", locationId);
    if (error) throw error;
    return count ?? 0;
  },
};
