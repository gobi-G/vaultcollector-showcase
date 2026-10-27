import type { Location, LocationInsert, LocationUpdate } from "@vault-collector/shared";

export interface ILocationRepository {
  getAll(userId: string): Promise<Location[]>;
  getById(id: string): Promise<Location | null>;
  getChildren(parentId: string): Promise<Location[]>;
  getRootLocations(userId: string): Promise<Location[]>;
  create(data: LocationInsert): Promise<Location>;
  update(data: LocationUpdate): Promise<Location>;
  delete(id: string): Promise<void>;
  getItemCount(locationId: string): Promise<number>;
}
