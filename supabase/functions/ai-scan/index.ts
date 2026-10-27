import {
  authenticateRequest,
  createServiceClient,
  handleCors,
  jsonResponse,
  errorResponse,
  AppError,
  ValidationError,
  checkMonthlyAiLimit,
  checkGlobalAiBudget,
  getMonthlyAiUsage,
  incrementMonthlyAiUsage,
  incrementGlobalAiBudget,
} from "../_shared/index.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type CardRecognitionResult = {
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

const MOCK_RESULT: CardRecognitionResult = {
  name: "Charizard VMAX",
  setName: "Darkness Ablaze",
  cardNumber: "020/189",
  rarity: "VMAX",
  confidence: 0.92,
  cardApiId: "swsh3-20",
  estimatedCondition: "near_mint",
  tcgType: "pokemon",
  passcode: null,
  scryfallId: null,
  edition: null,
  hp: 330,
  variant: "VMAX",
  language: "English",
  visualDescription: "Orange dragon breathing fire, dark purple background",
};

function normalizeCardNumber(
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

function normalizeResult(result: CardRecognitionResult): CardRecognitionResult {
  return {
    ...result,
    cardNumber: normalizeCardNumber(result.cardNumber, result.tcgType),
  };
}

// Scryfall lookup: only used when GPT already identified a set.
// Constructs scryfallId from name+set — does NOT override GPT's cardNumber or setName.
async function validateWithScryfall(
  result: CardRecognitionResult,
): Promise<CardRecognitionResult> {
  if (result.tcgType !== "magic" || !result.name || !result.setName) return result;

  try {
    const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(result.name)}&set=${encodeURIComponent(result.setName)}`;
    const res = await fetch(url, { headers: { "User-Agent": "VaultCollector/1.0" } });
    if (!res.ok) return result;

    const card = await res.json();
    if (card.object !== "card") return result;

    // Build canonical scryfallId from Scryfall response
    const canonicalId = `${card.set}/${card.collector_number}`;

    // If GPT provided a scryfallId, normalize it (strip promo prefix, lowercase)
    // If GPT's scryfallId doesn't match Scryfall's, prefer Scryfall's (GPT may have hallucinated)
    const gptId = result.scryfallId
      ?.toLowerCase()
      .replace(/\/p\s*0*(\d)/, "/$1"); // "ltr/p0451" → "ltr/451"
    const scryfallId = gptId === canonicalId ? gptId : canonicalId;

    return { ...result, scryfallId };
  } catch {
    return result;
  }
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const user = await authenticateRequest(req);
    const supabase = createServiceClient();

    // Check scan limits (per-user monthly + global daily budget)
    const { current, max, tier } = await getMonthlyAiUsage(supabase, user.id);
    await checkMonthlyAiLimit(supabase, user.id, tier);
    await checkGlobalAiBudget(supabase, tier);

    // Parse request
    const { image } = await req.json();
    if (!image) {
      throw new ValidationError("Missing 'image' field (base64)");
    }

    // Check if dev mode (no OpenAI key = dev mode)
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(MOCK_RESULT);
    }

    // Call OpenAI GPT-4o Vision
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a precise TCG card scanner for VaultCollector. Extract metadata from card images.
Principle: FACTS OVER GUESSES. Only write what you can directly read on the card. If uncertain, use null and lower confidence.

CRITICAL RULES:
1. Read ALL identifiers DIRECTLY from the card image — NEVER guess or infer from memory.
2. The COLLECTOR NUMBER / PASSCODE is the most reliable identifier — read character by character.
3. Set cardApiId to null always — the app handles API lookup.
4. Keep the "name" field CLEAN for API lookup. Do NOT append visual descriptors like "(Full Art)", "(Alternate Art)", "(Rainbow Rare)" to the name. Put these in "variant" and "visualDescription" instead.
5. Cards may be in ANY language. Always return the ENGLISH card name.
6. PRINTING ACCURACY: Identify the EXACT printing shown. Use the set logo, copyright year, collector number, and frame design — NOT your assumption of the most common printing. A card reprinted in many sets must be identified by the SPECIFIC set visible on this card.

=== POKÉMON CARDS ===
- Name: Top of card, including suffix (ex, VMAX, V, GX, EX). "Mew ex" ≠ "Mew". Preserve hyphens exactly: "Mewtwo-GX" not "Mewtwo GX".
- Collector Number: Bottom of card, format "XXX/YYY" (e.g. "205/165"). READ EXACTLY as printed. Secret Rares have numbers ABOVE the set total (e.g. "76/73") — this is correct, do not "fix" it.
- HP: Top right (e.g. "HP 180"). Use as confirmation only.
- Set Symbol: Small icon next to collector number. Identify the set name from the symbol — do not guess from card art alone.
- Rarity: Determine from card design (Common, Uncommon, Rare Holo, Ultra Rare, Special Art Rare, Hyper Rare).
- Variant: "Regular", "Full Art", "Gold / Hyper Rare", "Metal Card".
- Language: From card text (English, German, Japanese, etc.)

=== YU-GI-OH! CARDS ===
- Passcode: 8-digit number at bottom-left. MOST RELIABLE identifier. Read digit by digit. Must be EXACTLY 8 digits. If no passcode exists (promo/god cards), return null — do NOT invent "00000000".
- Set Code → return this in the "cardNumber" field: Below artwork right side (e.g. "LOB-EN005", "TDGS-EN040"). CRITICAL: Read the FULL code including the language infix exactly as printed. Language infixes: EN=English, DE=German, FR=French, IT=Italian, SP=Spanish, PT=Portuguese. Return the code EXACTLY as visible — "TN19-IT010" if it says IT, "PSV-000" if no infix. Do NOT normalize or translate to EN. This is the MOST IMPORTANT identifier for determining the exact set/printing.
- Edition: Look for "1st Edition" text or edition markers.

=== MAGIC: THE GATHERING CARDS ===
- Collector Number: Bottom-left (e.g. "123/259"). Read character by character. Borderless/Extended Art variants often have collector numbers ABOVE the set total (e.g. "433/273") — this is correct.
- Set Code: 3-letter code bottom-left (e.g. "RNA", "MH2", "LTR", "DMU", "WAR"). Read DIRECTLY from the card — do NOT guess from the card name or your knowledge.
- Copyright year: Bottom of card shows "™ & © 1993-YYYY Wizards". Use this year to narrow the set — e.g. "© 1993-1994" = Alpha/Beta/Unlimited/Arabian Nights era, "© 1993-2003" = Revised/8th Edition era.
- Construct scryfallId: lowercase "set/number" (e.g. "ltr/433"). Rules:
  - Use the 3-letter set code in lowercase
  - Use ONLY the collector number without "/total" suffix: "138" NOT "138/303"
  - Strip promo prefix: "ltr/451" NOT "ltr/p0451"
  - If the set code is uncertain, return scryfallId as null
- If the set code is NOT clearly readable on the card (common for pre-2015 cards):
  1. Check the copyright year at the bottom to narrow the era
  2. Check the frame style (old frame = pre-8th Edition 2003, modern frame = 8th+, M15 frame = 2015+)
  3. Check the set symbol shape and color
  4. If you still cannot determine the EXACT set, set setName to your best guess but set scryfallId to null and lower confidence to 0.6
  5. NEVER hallucinate a set code — if unsure, return null for scryfallId

=== VERIFICATION RULES ===
After reading any number (collector number, passcode, set code):
1. Double-check each digit/character against the image.
2. Common OCR mistakes: 0↔O, 1↔l↔I, 5↔S, 8↔B, 6↔G. Prefer digits in number fields.
3. Yu-Gi-Oh passcodes: if you read fewer or more than 8 digits, re-examine carefully.
4. Magic set codes: verify against the 3-letter code on the card, not from memory.
5. If any identifier is hard to read (glare, angle, blur), set it to null rather than guessing.

=== VISUAL DESCRIPTION ===
Describe the card's central artwork motif in 5-8 words (colors, character pose, background). This helps match artwork variants without a second scan.

Return JSON:
{
  "name": string (ENGLISH name with suffix, NO visual descriptors),
  "tcgType": "pokemon"|"yugioh"|"magic",
  "setName": string|null (English set name),
  "cardNumber": string|null (collector number ONLY — e.g. "138" NOT "138/303". For Yu-Gi-Oh: the set code e.g. "LOB-EN005"),
  "rarity": string|null,
  "confidence": number (0-1),
  "cardApiId": null,
  "estimatedCondition": "mint"|"near_mint"|"played"|"damaged",
  "passcode": string|null (Yu-Gi-Oh only, exactly 8 digits),
  "scryfallId": string|null (Magic only, format "set/number"),
  "edition": string|null (Yu-Gi-Oh edition),
  "hp": number|null (Pokémon HP),
  "variant": string|null,
  "language": string|null,
  "visualDescription": string|null (5-8 word artwork description)
}

EXAMPLES:
Pokemon: {"name":"Charizard ex","tcgType":"pokemon","setName":"Obsidian Flames","cardNumber":"223/197","rarity":"Special Art Rare","confidence":0.95,"cardApiId":null,"estimatedCondition":"near_mint","passcode":null,"scryfallId":null,"edition":null,"hp":330,"variant":"Special Art Rare","language":"English","visualDescription":"Fire dragon roaring, volcanic orange background"}
Yu-Gi-Oh: {"name":"Dark Magician","tcgType":"yugioh","setName":"Legend of Blue Eyes White Dragon","cardNumber":"LOB-EN005","rarity":"Ultra Rare","confidence":0.9,"cardApiId":null,"estimatedCondition":"near_mint","passcode":"46986414","scryfallId":null,"edition":"Unlimited","hp":null,"variant":null,"language":"English","visualDescription":"Purple robed wizard, dark swirling background"}
Magic: {"name":"Lightning Bolt","tcgType":"magic","setName":"Bloomburrow Commander","cardNumber":"307/307","rarity":"Uncommon","confidence":0.9,"cardApiId":null,"estimatedCondition":"mint","passcode":null,"scryfallId":"blc/307","edition":null,"hp":null,"variant":null,"language":"English","visualDescription":"Red lightning strike hitting ground, stormy sky"}

If you cannot identify the card, return confidence below 0.3.
Estimate physical condition from visible wear, edge whitening, centering, scratches, creases.`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image}`, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 700,
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("OpenAI error:", res.status, errorBody);
      throw new AppError(`OpenAI error (${res.status}): ${errorBody}`, 502, "OPENAI_ERROR");
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content ?? "{}";
    const raw = JSON.parse(content) as CardRecognitionResult;
    const normalized = normalizeResult(raw);
    const result = await validateWithScryfall(normalized);

    // Increment scan counts (don't block response)
    incrementMonthlyAiUsage(supabase, user.id);
    incrementGlobalAiBudget(supabase);

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
});
