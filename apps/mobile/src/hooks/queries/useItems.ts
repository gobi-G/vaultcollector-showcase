import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ItemInsert } from "@vault-collector/shared";
import { itemRepository } from "@/services";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/services/implementations/supabase/SupabaseClient";

export function useItems(collectionId: string) {
  return useQuery({
    queryKey: ["items", collectionId],
    queryFn: () => itemRepository.getAll(collectionId),
    enabled: !!collectionId,
  });
}

export function useAllUserItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["items", "all", user?.id],
    queryFn: () => itemRepository.getAllByUser(user!.id),
    enabled: !!user,
  });
}

export function useItemsByLocation(locationId: string | null) {
  return useQuery({
    queryKey: ["items", "location", locationId],
    queryFn: () => itemRepository.getByLocation(locationId!),
    enabled: !!locationId,
  });
}

export function useCheckDuplicate() {
  return useCallback(async (collectionId: string, cardName: string): Promise<number> => {
    const { count } = await supabase
      .from("items")
      .select("id", { count: "exact", head: true })
      .eq("collection_id", collectionId)
      .ilike("name", cardName);
    return count ?? 0;
  }, []);
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ItemInsert) => itemRepository.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items", variables.collection_id] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
