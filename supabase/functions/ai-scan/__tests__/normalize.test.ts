import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  type CardRecognitionResult,
  normalizeCardNumber,
  normalizeResult,
} from "../normalize.ts";

Deno.test("normalizeCardNumber", async (t) => {
  await t.step("returns null for missing numbers", () => {
    assertEquals(normalizeCardNumber(null, "pokemon"), null);
  });

  await t.step(
    "keeps Pokémon numbers untouched (the set total is part of the id)",
    () => {
      assertEquals(normalizeCardNumber("020/189", "pokemon"), "020/189");
    },
  );

  await t.step("strips the single-letter region code from Yu-Gi-Oh! set codes", () => {
    assertEquals(normalizeCardNumber("LOB-G001", "yugioh"), "LOB-001");
    assertEquals(normalizeCardNumber("PSV-G000", "yugioh"), "PSV-000");
  });

  await t.step("keeps Yu-Gi-Oh! codes that carry a multi-letter language code", () => {
    assertEquals(normalizeCardNumber("TN19-IT010", "yugioh"), "TN19-IT010");
    assertEquals(normalizeCardNumber("LOB-001", "yugioh"), "LOB-001");
  });

  await t.step("strips the set total from Magic collector numbers", () => {
    assertEquals(normalizeCardNumber("138/303", "magic"), "138");
  });

  await t.step("strips promo prefixes and leading zeros from Magic numbers", () => {
    assertEquals(normalizeCardNumber("P 0451", "magic"), "451");
    assertEquals(normalizeCardNumber("p0451", "magic"), "451");
    assertEquals(normalizeCardNumber("007", "magic"), "7");
  });

  await t.step("keeps a lone zero as a valid Magic number", () => {
    assertEquals(normalizeCardNumber("0", "magic"), "0");
  });
});

Deno.test("normalizeResult only rewrites the card number", () => {
  const input: CardRecognitionResult = {
    name: "Lightning Bolt",
    setName: "M10",
    cardNumber: "146/249",
    rarity: "Common",
    confidence: 0.9,
    cardApiId: null,
    estimatedCondition: "near_mint",
    tcgType: "magic",
    passcode: null,
    scryfallId: null,
    edition: null,
    hp: null,
    variant: null,
    language: "English",
    visualDescription: null,
  };

  assertEquals(normalizeResult(input), { ...input, cardNumber: "146" });
});
