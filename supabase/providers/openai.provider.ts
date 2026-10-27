import type {
  CardRecognitionResult,
  ConditionAssessment,
  IAiProvider,
} from "./interfaces/index.ts";
import { env } from "../config/env.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEV_MODE = env.appEnv === "development";

async function callVision(systemPrompt: string, imageBase64: string): Promise<string> {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "{}";
}

const MOCK_RECOGNITION: CardRecognitionResult = {
  name: "Charizard VMAX",
  setName: "Darkness Ablaze",
  cardNumber: "020/189",
  rarity: "VMAX",
  confidence: 0.92,
  cardApiId: "swsh3-20",
  estimatedCondition: "near_mint",
};

const MOCK_CONDITION: ConditionAssessment = {
  condition: "near_mint",
  confidence: 0.88,
  details: "Card shows minimal wear. Edges are clean, slight whitening on back corners. Centering is good.",
};

export const openaiProvider: IAiProvider = {
  async recognizeCard(imageBase64: string): Promise<CardRecognitionResult> {
    if (DEV_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      return MOCK_RECOGNITION;
    }

    const systemPrompt = `You are a Pokémon TCG card recognition expert.
Analyze the image and identify the exact card.
Return JSON with these fields:
{
  "name": string (English card name),
  "setName": string (set name, e.g. "Darkness Ablaze"),
  "cardNumber": string (e.g. "020/189"),
  "rarity": string (e.g. "VMAX", "V", "EX", "Common"),
  "confidence": number (0-1),
  "cardApiId": string|null (pokemontcg.io ID if known, e.g. "swsh3-20"),
  "estimatedCondition": "mint"|"near_mint"|"played"|"damaged"
}
If you cannot identify the card, return confidence below 0.3.
Estimate the physical condition based on visible wear, edges, centering.`;

    const result = await callVision(systemPrompt, imageBase64);
    return JSON.parse(result) as CardRecognitionResult;
  },

  async assessCondition(imageBase64: string): Promise<ConditionAssessment> {
    if (DEV_MODE) {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_CONDITION;
    }

    const systemPrompt = `You are a trading card condition grading expert.
Analyze the card's physical condition from the image.
Grade as one of: "mint", "near_mint", "played", "damaged".
Return JSON: { "condition": string, "confidence": number (0-1), "details": string }
Details should explain visible wear, centering, edge condition, etc.`;

    const result = await callVision(systemPrompt, imageBase64);
    return JSON.parse(result) as ConditionAssessment;
  },
};
