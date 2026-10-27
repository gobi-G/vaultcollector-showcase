import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@vault-collector/shared";
import { authService } from "@/services";
import { storage } from "@/utils/storage";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.getProfile(),
    select: (data) => {
      if (data?.ai_consent_given != null) {
        storage.set("ai_consent_given", data.ai_consent_given);
      }
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
