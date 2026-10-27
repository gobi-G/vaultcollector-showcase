import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useCollections, useCreateCollection } from "@/hooks/queries/useCollections";
import { useAuth } from "@/providers";

export function useEnsureDefaultCollection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const queryClient = useQueryClient();
  const isCreatingRef = useRef(false);

  const ensureCollection = useCallback(async (): Promise<string> => {
    if (!user?.id) throw new Error("User not authenticated");
    if (collections && collections.length > 0) {
      return collections[0].id;
    }
    if (isCreatingRef.current) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearInterval(check);
          reject(new Error("Timed out waiting for collection creation"));
        }, 5000);
        const check = setInterval(() => {
          const cached = queryClient.getQueryData<Array<{ id: string }>>(["collections", user.id]);
          if (cached && cached.length > 0) {
            clearInterval(check);
            clearTimeout(timeout);
            resolve(cached[0].id);
          }
        }, 100);
      });
    }
    isCreatingRef.current = true;
    try {
      const result = await createCollection.mutateAsync({
        name: t("firstRun.defaultCollectionName"),
        category: "tcg",
        user_id: user.id,
      });
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      return result.id;
    } finally {
      isCreatingRef.current = false;
    }
  }, [collections, createCollection, queryClient, user, t]);

  return { ensureCollection, isCreating: createCollection.isPending };
}
