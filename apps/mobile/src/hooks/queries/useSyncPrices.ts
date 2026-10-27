import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";

type SyncPricesResult = {
  message: string;
  updated: number;
  failed: number;
  total: number;
  breakdown: {
    pokemon: number;
    magic: number;
    yugioh: number;
  };
};

async function syncPrices(): Promise<SyncPricesResult> {
  const { data, error } = await supabase.functions.invoke("price-sync");

  if (error) {
    throw new Error(`Price sync failed: ${JSON.stringify(error)}`);
  }

  return data?.data ?? data;
}

export function useSyncPrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncPrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["portfolioHistory"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
