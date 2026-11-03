import type { Location } from "../types/Location.types";

/**
 * Walks from a location up to its root via `parent_id`.
 * Stops on unknown ids and on cycles, so corrupted data can never hang the UI.
 */
function walkToRoot(locations: Location[], locationId: string): Location[] {
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]));
  const visited = new Set<string>();
  const chain: Location[] = [];
  let currentId: string | null = locationId;

  while (currentId && !visited.has(currentId)) {
    const loc = locationMap.get(currentId);
    if (!loc) break;
    visited.add(currentId);
    chain.unshift(loc);
    currentId = loc.parent_id;
  }

  return chain;
}

export function getFullLocationPath(locations: Location[], locationId: string): string {
  return walkToRoot(locations, locationId)
    .map((loc) => loc.name)
    .join(" › ");
}

export function getLocationBreadcrumbs(
  locations: Location[],
  locationId: string,
): Location[] {
  return walkToRoot(locations, locationId);
}
