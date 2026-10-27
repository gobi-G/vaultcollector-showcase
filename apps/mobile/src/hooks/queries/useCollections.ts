import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectionInsert, CollectionUpdate } from "@vault-collector/shared";
import { collectionRepository } from "@/services";
import { useAuth } from "@/providers/AuthProvider";

export function useCollections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["collections", user?.id],
    queryFn: () => collectionRepository.getAll(user!.id),
    enabled: !!user,
  });
}


export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => collectionRepository.getById(id),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CollectionInsert) => collectionRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CollectionUpdate) => collectionRepository.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
