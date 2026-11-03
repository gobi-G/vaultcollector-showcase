/** Pure helpers for the ai-scan function, kept free of I/O so they can be unit tested. */

export type CardRecognitionResult = {
  name: string;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  confidence: number;
  cardApiId: string | null;
  estimatedCondition: "mint" | "near_mint" | "played" | "damaged";
  tcgType: "pokemon" | "magic" | "yugioh";
  passcode: string | null;
  scryfallId: string | null;
  edition: string | null;
  hp: number | null;
  variant: string | null;
  language: string | null;
  visualDescription: string | null;
};

export function normalizeCardNumber(
  cardNumber: string | null,
  tcgType: string,
): string | null {
  if (!cardNumber) return null;

  if (tcgType === "yugioh") {
    // Strip language/region prefix from set code part: "PSV-G000" → "PSV-000", "TN19-IT010" → keep as-is (language info)
    // Remove single-letter region suffix between hyphen and digits: LOB-G001 → LOB-001, PSV-G000 → PSV-000
    return cardNumber.replace(/^([A-Z0-9]+-)[A-Z](\d+)$/, "$1$2");
  }

  if (tcgType === "magic") {
    // Strip "/total" suffix: "138/303" → "138"
    // Strip promo prefix: "P 0451" → "451", "P0451" → "451"
    // Strip leading zeros from number part
    return cardNumber
      .split("/")[0]
      .replace(/^P\s*/i, "")
      .replace(/^0+(\d)/, "$1");
  }

  return cardNumber;
}

export function normalizeResult(result: CardRecognitionResult): CardRecognitionResult {
  return {
    ...result,
    cardNumber: normalizeCardNumber(result.cardNumber, result.tcgType),
  };
}
