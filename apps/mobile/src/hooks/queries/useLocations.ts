import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LocationInsert } from "@vault-collector/shared";
import { locationRepository } from "@/services";
import { useAuth } from "@/providers/AuthProvider";

export function useLocations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["locations", user?.id],
    queryFn: () => locationRepository.getAll(user!.id),
    enabled: !!user,
  });
}

export function useRootLocations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["locations", "root", user?.id],
    queryFn: () => locationRepository.getRootLocations(user!.id),
    enabled: !!user,
  });
}

export function useChildLocations(parentId: string | null) {
  return useQuery({
    queryKey: ["locations", "children", parentId],
    queryFn: () => locationRepository.getChildren(parentId!),
    enabled: !!parentId,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LocationInsert) => locationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
