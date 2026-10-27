/**
 * Service Layer — Single point to swap implementations.
 *
 * All app code imports from here, never from implementations/ directly.
 * To replace Supabase with another backend, only change this file.
 */
import {
  supabaseAuth,
  supabaseCollections,
  supabaseItems,
  supabasePriceHistory,
  supabaseStorage,
} from "./implementations/supabase";
import { supabaseAiScan } from "./implementations/supabase/SupabaseAiScan";

// Active implementations
export const authService = supabaseAuth;
export const collectionRepository = supabaseCollections;
export const itemRepository = supabaseItems;
export const priceHistoryRepository = supabasePriceHistory;
export const storageService = supabaseStorage;
export const aiScanService = supabaseAiScan;
export { pokemonTcgSearch as cardSearchService } from "./implementations/supabase";
export { pokemonTcgSearch } from "./implementations/supabase";
export { supabaseLocations as locationRepository } from "./implementations/supabase";
export { scryfallSearch } from "./implementations/scryfall/ScryfallSearch";
export { ygoProSearch } from "./implementations/ygopro/YgoProSearch";
export { getSearchProvider } from "./CardSearchFactory";

// Re-export interfaces for type usage
export type {
  IAuthService,
  ICollectionRepository,
  IItemRepository,
  IPriceHistoryRepository,
  IStorageService,
} from "./interfaces";
