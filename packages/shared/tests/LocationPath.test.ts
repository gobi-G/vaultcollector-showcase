import { describe, expect, it } from "vitest";
import type { Location } from "../src/types/Location.types";
import { getFullLocationPath, getLocationBreadcrumbs } from "../src/utils/LocationPath";

const USER_ID = "00000000-0000-4000-8000-000000000000";
const TIMESTAMP = "2026-01-01T00:00:00.000Z";

function location(id: string, name: string, parentId: string | null): Location {
  return {
    id,
    name,
    parent_id: parentId,
    user_id: USER_ID,
    icon: "box",
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
  };
}

const room = location("room", "Office", null);
const shelf = location("shelf", "Shelf", "room");
const binder = location("binder", "Binder 1", "shelf");
const locations = [binder, room, shelf];

describe("getFullLocationPath", () => {
  it("joins the chain from root to leaf", () => {
    expect(getFullLocationPath(locations, "binder")).toBe("Office › Shelf › Binder 1");
  });

  it("returns just the name for a root location", () => {
    expect(getFullLocationPath(locations, "room")).toBe("Office");
  });

  it("returns an empty string for an unknown id", () => {
    expect(getFullLocationPath(locations, "missing")).toBe("");
  });

  it("stops at a dangling parent reference", () => {
    const orphan = location("orphan", "Orphan box", "deleted-parent");
    expect(getFullLocationPath([orphan], "orphan")).toBe("Orphan box");
  });

  it("terminates on cyclic parent references", () => {
    const a = location("a", "A", "b");
    const b = location("b", "B", "a");
    expect(getFullLocationPath([a, b], "a")).toBe("B › A");
  });
});

describe("getLocationBreadcrumbs", () => {
  it("returns location objects ordered from root to leaf", () => {
    expect(getLocationBreadcrumbs(locations, "binder").map((loc) => loc.id)).toEqual([
      "room",
      "shelf",
      "binder",
    ]);
  });
});
