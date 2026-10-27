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
import { createAiService } from "../../services/ai.service.ts";
import { openaiProvider } from "../../providers/openai.provider.ts";

const aiService = createAiService(openaiProvider);

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

    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image) {
      throw new ValidationError("Missing 'image' field (base64 encoded)");
    }

    const result = await aiService.assessCondition(user.id, image);
    incrementMonthlyAiUsage(supabase, user.id);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
});
