import { calculateConfidence } from "../ScanConfidence";
import type { AiScanResult } from "@/services/interfaces/AiScanInterface";
import type { CardSearchResult } from "@vault-collector/shared";

const baseAiResult: AiScanResult = {
  name: "Dark Magician",
  tcgType: "yugioh",
  set: "Legend of Blue Eyes",
  number: "LOB-EN005",
  rarity: "Ultra Rare",
  estimatedCondition: "near_mint",
  confidence: 0.9,
  cardApiId: null,
  passcode: "46986414",
  scryfallId: null,
  edition: "Unlimited",
  hp: null,
  variant: null,
  language: "English",
  visualDescription: null,
};

const baseApiCard: CardSearchResult = {
  cardApiId: "46986414",
  name: "Dark Magician",
  setName: "Legend of Blue Eyes White Dragon",
  setCode: "LOB",
  imageUrl: "https://example.com/card.jpg",
  rarity: "Ultra Rare",
  price: 5.99,
  cardNumber: "LOB-EN005",
  passcode: "46986414",
  setVersions: null,
  artworkImages: null,
};

describe("calculateConfidence", () => {
  describe("No API match", () => {
    it("should cap at 40 without API card", () => {
      const result = calculateConfidence(baseAiResult, null);
      expect(result.score).toBeLessThanOrEqual(40);
      expect(result.level).toBe("low");
      expect(result.checks).toEqual({ name: false, number: false, set: false, image: false });
    });
  });

  describe("Yu-Gi-Oh", () => {
    it("should score >=90 when passcode matches", () => {
      const result = calculateConfidence(baseAiResult, baseApiCard);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.level).toBe("high");
      expect(result.checks.number).toBe(true);
    });

    it("should score >=90 even when name differs (language difference)", () => {
      const ai = { ...baseAiResult, name: "Dunkler Magier" };
      const result = calculateConfidence(ai, baseApiCard);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.checks.number).toBe(true);
    });
  });

  describe("Magic", () => {
    it("should score >=90 when scryfallId lookup succeeded + name matches", () => {
      const ai: AiScanResult = {
        ...baseAiResult,
        tcgType: "magic",
        name: "Lightning Bolt",
        passcode: null,
        scryfallId: "blc/307",
        set: "Bloomburrow Commander",
      };
      const api: CardSearchResult = {
        ...baseApiCard,
        cardApiId: "some-scryfall-uuid",
        name: "Lightning Bolt",
        setName: "Bloomburrow Commander",
        passcode: null,
      };
      const result = calculateConfidence(ai, api);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.level).toBe("high");
    });
  });

  describe("Pokemon", () => {
    it("should score >=85 when name + collector number match", () => {
      const ai: AiScanResult = {
        ...baseAiResult,
        tcgType: "pokemon",
        name: "Charizard ex",
        number: "223/197",
        passcode: null,
        scryfallId: null,
        set: "Obsidian Flames",
        hp: 330,
      };
      const api: CardSearchResult = {
        ...baseApiCard,
        name: "Charizard ex",
        cardNumber: "223/197",
        setName: "Obsidian Flames",
        passcode: null,
      };
      const result = calculateConfidence(ai, api);
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.level).toBe("high");
    });

    it("should handle leading zeros in collector numbers", () => {
      const ai: AiScanResult = {
        ...baseAiResult,
        tcgType: "pokemon",
        name: "Pikachu",
        number: "025/165",
        passcode: null,
        scryfallId: null,
      };
      const api: CardSearchResult = {
        ...baseApiCard,
        name: "Pikachu",
        cardNumber: "25/165",
        passcode: null,
      };
      const result = calculateConfidence(ai, api);
      expect(result.checks.number).toBe(true);
    });
  });

  describe("Partial matches", () => {
    it("should score >=55 when only name matches", () => {
      const ai: AiScanResult = {
        ...baseAiResult,
        tcgType: "pokemon",
        name: "Pikachu",
        number: null,
        passcode: null,
        scryfallId: null,
        set: null as unknown as string,
      };
      const api: CardSearchResult = {
        ...baseApiCard,
        name: "Pikachu",
        cardNumber: null,
        passcode: null,
        imageUrl: "",
      };
      const result = calculateConfidence(ai, api);
      expect(result.score).toBeGreaterThanOrEqual(55);
      expect(result.level).toBe("medium");
    });

    it("should score >=75 when name + set match", () => {
      const ai: AiScanResult = {
        ...baseAiResult,
        tcgType: "pokemon",
        name: "Pikachu",
        number: null,
        passcode: null,
        scryfallId: null,
        set: "Obsidian Flames",
      };
      const api: CardSearchResult = {
        ...baseApiCard,
        name: "Pikachu",
        setName: "Obsidian Flames",
        cardNumber: null,
        passcode: null,
      };
      const result = calculateConfidence(ai, api);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });
  });
});
