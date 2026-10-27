import { useEffect } from "react";
import { MutationCache, onlineManager, QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import NetInfo from "@react-native-community/netinfo";
import { toast } from "sonner-native";
import i18n from "@/i18n";
import type { ReactNode } from "react";
import { storage } from "@/utils/storage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 2,
      networkMode: "offlineFirst",
    },
    mutations: {
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
  mutationCache: new MutationCache({
    onError: () => {
      if (!onlineManager.isOnline()) {
        toast.error(i18n.t("offline.mutationBlocked"));
      }
    },
  }),
});

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => { storage.remove(key); },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      onlineManager.setOnline(!!state.isConnected);
    });
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  );
}
