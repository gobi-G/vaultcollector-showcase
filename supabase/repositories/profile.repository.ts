import type { Profile } from "../types/index.ts";
import { getServiceClient } from "./base.repository.ts";

export const profileRepository = {
  async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await getServiceClient()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return (data as Profile) ?? null;
  },

  async getSubscriptionTier(userId: string): Promise<string> {
    const profile = await profileRepository.getById(userId);
    return profile?.subscription_tier ?? "free";
  },
};
