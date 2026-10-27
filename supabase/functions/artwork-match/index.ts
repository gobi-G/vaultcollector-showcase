import { createClient } from "npm:@supabase/supabase-js@2";
import {
  authenticateRequest,
  checkMonthlyAiLimit,
  errorResponse,
  getMonthlyAiUsage,
  handleCors,
  incrementMonthlyAiUsage,
  jsonResponse,
  ValidationError,
} from "../_shared/index.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type ArtworkMatchRequest = {
  image: string;
  artworkUrls: string[];
};

type ArtworkMatchResult = {
  matchIndex: number;
  confidence: number;
};

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const user = await authenticateRequest(req);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { tier } = await getMonthlyAiUsage(supabase, user.id);
    await checkMonthlyAiLimit(supabase, user.id, tier);

    const body: ArtworkMatchRequest = await req.json();
    const { image, artworkUrls } = body;

    if (!image || typeof image !== "string") {
      throw new ValidationError("Missing or empty 'image' field (base64)");
    }
    if (!artworkUrls || !Array.isArray(artworkUrls) || artworkUrls.length < 2) {
      throw new ValidationError("'artworkUrls' must be an array with at least 2 URLs");
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse({ matchIndex: 0, confidence: 0 });
    }

    // Build image content: scanned photo + artwork variants
    const imageContent: Array<{ type: string; image_url?: { url: string }; text?: string }> = [
      { type: "text", text: "This is the scanned card photo:" },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
      { type: "text", text: `Now here are ${artworkUrls.length} possible artwork variants (numbered 0 to ${artworkUrls.length - 1}):` },
    ];

    for (let i = 0; i < artworkUrls.length; i++) {
      imageContent.push({ type: "text", text: `Artwork ${i}:` });
      imageContent.push({ type: "image_url", image_url: { url: artworkUrls[i] } });
    }

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
            content: `You are comparing a scanned trading card photo against possible artwork variants of the same card.
The user will show you their scanned card photo, then numbered artwork variants (0-indexed).
Your job is to identify which artwork variant matches the scanned card.
Compare the character pose, background colors, art style, and composition.
Return JSON: { "matchIndex": <0-based index>, "confidence": <0-1 score> }
If you cannot determine a match, return matchIndex: 0 with low confidence.`,
          },
          {
            role: "user",
            content: imageContent,
          },
        ],
        max_tokens: 100,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("OpenAI artwork-match error:", res.status, errorBody);
      return jsonResponse({ matchIndex: 0, confidence: 0 });
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content) as ArtworkMatchResult;

    // Clamp matchIndex to valid range
    const matchIndex = Math.max(0, Math.min(result.matchIndex ?? 0, artworkUrls.length - 1));

    incrementMonthlyAiUsage(supabase, user.id);
    return jsonResponse({ matchIndex, confidence: result.confidence ?? 0 });
  } catch (error) {
    return errorResponse(error);
  }
});
