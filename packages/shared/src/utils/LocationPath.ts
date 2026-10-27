import type { Location } from "../types/Location.types";

export function getFullLocationPath(locations: Location[], locationId: string): string {
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]));
  const parts: string[] = [];
  let currentId: string | null = locationId;

  while (currentId) {
    const loc = locationMap.get(currentId);
    if (!loc) break;
    parts.unshift(loc.name);
    currentId = loc.parent_id;
  }

  return parts.join(" › ");
}

export function getLocationBreadcrumbs(locations: Location[], locationId: string): Location[] {
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]));
  const breadcrumbs: Location[] = [];
  let currentId: string | null = locationId;

  while (currentId) {
    const loc = locationMap.get(currentId);
    if (!loc) break;
    breadcrumbs.unshift(loc);
    currentId = loc.parent_id;
  }

  return breadcrumbs;
}
