import { shareAsync } from "expo-sharing";
import { File, Paths } from "expo-file-system";
import type { Item } from "@vault-collector/shared";

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportItemsToCsv(items: Item[], filename = "vault-collector-export"): Promise<void> {
  const headers = [
    "Name",
    "Category",
    "Condition",
    "Purchase Price",
    "Market Price",
    "Set Name",
    "Card Number",
    "Rarity",
    "Notes",
    "Created At",
  ];

  const rows = items.map((item) => {
    const meta = item.metadata as Record<string, unknown> | null;
    return [
      escapeCsv(item.name),
      escapeCsv(item.category),
      escapeCsv(item.condition),
      escapeCsv(item.purchase_price),
      escapeCsv(item.current_market_price),
      escapeCsv(meta?.set_name as string),
      escapeCsv(meta?.card_number as string),
      escapeCsv(meta?.rarity as string),
      escapeCsv(item.notes),
      escapeCsv(item.created_at),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const file = new File(Paths.cache, `${filename}.csv`);
  file.write(csv);

  await shareAsync(file.uri, {
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
  });
}
