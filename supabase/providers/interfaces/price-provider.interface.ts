export type CardPrice = {
  cardApiId: string;
  name: string;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
};

export type CardSearchResult = {
  cardApiId: string;
  name: string;
  setName: string;
  imageUrl: string;
  rarity: string | null;
  price: number | null;
};

export interface IPriceProvider {
  name: string;
  getPrice(cardApiId: string): Promise<CardPrice | null>;
  searchCards(query: string, limit?: number): Promise<CardSearchResult[]>;
  lookupByBarcode(barcode: string): Promise<CardSearchResult | null>;
}
