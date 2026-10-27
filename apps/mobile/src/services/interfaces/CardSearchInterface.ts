import type { CardSearchResult } from "@vault-collector/shared";

export type { CardSearchResult } from "@vault-collector/shared";

export interface ICardSearchService {
  search(query: string, limit?: number): Promise<CardSearchResult[]>;
  getById?(id: string): Promise<CardSearchResult | null>;
  searchByNameAndNumber?(name: string, number: string): Promise<CardSearchResult | null>;
}
