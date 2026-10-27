import type { CardSearchResult } from "@vault-collector/shared";
import type { AiScanResult } from "@/services/interfaces/AiScanInterface";

type ConfidenceResult = {
  score: number;
  level: "high" | "medium" | "low";
  checks: { name: boolean; number: boolean; set: boolean; image: boolean };
};

function wordsOverlap(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().split(/[\s:,-]+/).filter((w) => w.length > 2);
  const wordsB = b.toLowerCase().split(/[\s:,-]+/).filter((w) => w.length > 2);
  return wordsA.some((wa) => wordsB.some((wb) => wa.includes(wb) || wb.includes(wa)));
}

function cleanNumber(num: string): string {
  return num.split("/")[0].replace(/^0+/, "");
}

function namesMatch(aiName: string, apiName: string): boolean {
  const a = aiName.toLowerCase().trim();
  const b = apiName.toLowerCase().trim();
  return a === b || b.includes(a) || a.includes(b);
}

export function calculateConfidence(
  aiResult: AiScanResult,
  apiCard: CardSearchResult | null,
): ConfidenceResult {
  if (!apiCard) {
    const aiScore = Math.round(aiResult.confidence * 100);
    return {
      score: Math.min(aiScore, 40),
      level: "low",
      checks: { name: false, number: false, set: false, image: false },
    };
  }

  const checks = { name: false, number: false, set: false, image: false };

  // Check individual factors
  const hasNameMatch = namesMatch(aiResult.name, apiCard.name);
  if (hasNameMatch) checks.name = true;

  let hasIdMatch = false;

  if (aiResult.tcgType === "yugioh") {
    if (aiResult.passcode && apiCard.passcode && aiResult.passcode === apiCard.passcode) {
      hasIdMatch = true;
      checks.number = true;
    }
  } else if (aiResult.tcgType === "magic") {
    if (aiResult.scryfallId && apiCard.cardApiId) {
      hasIdMatch = true;
      checks.number = true;
    }
  } else if (aiResult.tcgType === "pokemon") {
    if (aiResult.number && apiCard.cardNumber) {
      const aiNum = cleanNumber(aiResult.number);
      const apiNum = cleanNumber(apiCard.cardNumber);
      if (aiNum === apiNum) {
        hasIdMatch = true;
        checks.number = true;
      }
    }
  }

  const hasSetMatch = !!(aiResult.set && apiCard.setName && wordsOverlap(aiResult.set, apiCard.setName));
  if (hasSetMatch) checks.set = true;

  const hasImage = !!apiCard.imageUrl;
  if (hasImage) checks.image = true;

  // Tier-based scoring: definitive matches get high base scores
  let score: number;

  if (aiResult.tcgType === "yugioh" && hasIdMatch) {
    // YGO passcode is a unique identifier — definitive match
    score = 90;
  } else if (aiResult.tcgType === "magic" && hasIdMatch && hasNameMatch) {
    // Magic scryfallId lookup succeeded + name confirms
    score = 90;
  } else if (aiResult.tcgType === "pokemon" && hasIdMatch && hasNameMatch) {
    // Pokemon name + collector number both match
    score = 85;
  } else if (hasNameMatch && hasSetMatch) {
    score = 75;
  } else if (hasNameMatch && hasIdMatch) {
    score = 80;
  } else if (hasIdMatch) {
    // ID matches but name doesn't (possible language difference)
    score = 75;
  } else if (hasNameMatch) {
    score = 55;
  } else {
    score = 30;
  }

  // Bonuses
  if (hasImage) score += 5;
  if (hasSetMatch && score >= 70) score += 5;

  score = Math.min(score, 95);

  const level = score >= 80 ? "high" : score >= 50 ? "medium" : "low";

  return { score, level, checks };
}
