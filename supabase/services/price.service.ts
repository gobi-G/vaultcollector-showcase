import type { IPriceProvider } from "../providers/interfaces/index.ts";
import { itemRepository } from "../repositories/item.repository.ts";
import { priceHistoryRepository } from "../repositories/price-history.repository.ts";

export function createPriceService(priceProvider: IPriceProvider) {
  return {
    async syncAllPrices(): Promise<{ updated: number; failed: number }> {
      const items = await itemRepository.getItemsNeedingPriceUpdate();

      let updated = 0;
      let failed = 0;

      for (const item of items) {
        const cardApiId = item.category === "tcg"
          ? (item.metadata as { card_api_id?: string }).card_api_id
          : undefined;
        if (!cardApiId) continue;

        try {
          const price = await priceProvider.getPrice(cardApiId);
          if (!price) {
            failed++;
            continue;
          }

          await itemRepository.updatePrice(item.id, price.price);

          await priceHistoryRepository.create({
            item_id: item.id,
            price: price.price,
            source: price.source as "tcgplayer" | "cardmarket" | "ebay",
          });

          updated++;
        } catch {
          failed++;
        }
      }

      return { updated, failed };
    },

    async getItemPrice(cardApiId: string) {
      return priceProvider.getPrice(cardApiId);
    },

    async searchCards(query: string, limit?: number) {
      return priceProvider.searchCards(query, limit);
    },

    async lookupBarcode(barcode: string) {
      return priceProvider.lookupByBarcode(barcode);
    },
  };
}
