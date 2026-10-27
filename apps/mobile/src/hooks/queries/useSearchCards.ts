import { useQuery } from "@tanstack/react-query";
import type { TcgType } from "@vault-collector/shared";
import { getSearchProvider } from "@/services/CardSearchFactory";

export function useSearchCards(query: string, tcgType: TcgType = "pokemon") {
  const provider = getSearchProvider(tcgType);
  return useQuery({
    queryKey: ["searchCards", query, tcgType],
    queryFn: () => provider.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 60,
  });
}
