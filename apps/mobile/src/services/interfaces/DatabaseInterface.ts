import type {
  Collection,
  CollectionInsert,
  CollectionUpdate,
  Item,
  ItemInsert,
  ItemUpdate,
  PriceHistory,
} from "@vault-collector/shared";

export type QueryFilter = {
  column: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "in";
  value: unknown;
};

export type QueryOrder = {
  column: string;
  ascending?: boolean;
};

export type QueryOptions = {
  filters?: QueryFilter[];
  order?: QueryOrder;
  limit?: number;
  offset?: number;
};

export interface ICollectionRepository {
  getAll(userId: string, options?: QueryOptions): Promise<Collection[]>;
  getById(id: string): Promise<Collection | null>;
  create(data: CollectionInsert): Promise<Collection>;
  update(data: CollectionUpdate): Promise<Collection>;
  delete(id: string): Promise<void>;
  getItemCount(collectionId: string): Promise<number>;
}

export interface IItemRepository {
  getAll(collectionId: string, options?: QueryOptions): Promise<Item[]>;
  getAllByUser(userId: string, options?: QueryOptions): Promise<Item[]>;
  getByLocation(locationId: string): Promise<Item[]>;
  getById(id: string): Promise<Item | null>;
  create(data: ItemInsert): Promise<Item>;
  update(data: ItemUpdate): Promise<Item>;
  delete(id: string): Promise<void>;
  getTotalValue(userId: string): Promise<number>;
  getCount(userId: string): Promise<number>;
}

export interface IPriceHistoryRepository {
  getByItem(itemId: string, options?: QueryOptions): Promise<PriceHistory[]>;
  create(data: Omit<PriceHistory, "id" | "recorded_at">): Promise<PriceHistory>;
  getLatestPrice(itemId: string): Promise<number | null>;
}
