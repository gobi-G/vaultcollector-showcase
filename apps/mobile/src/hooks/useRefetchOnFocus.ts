import { useEffect } from "react";
import { useNavigation } from "expo-router";
import type { UseQueryResult } from "@tanstack/react-query";

export function useRefetchOnFocus(...queries: UseQueryResult[]) {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      for (const query of queries) {
        query.refetch();
      }
    });

    return unsubscribe;
  }, [navigation, queries]);
}
