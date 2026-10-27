import type { AiScanResult, IAiScanService } from "../../interfaces/AiScanInterface";
import { supabase } from "./SupabaseClient";
import { logger } from "@/utils/Logger";

export const supabaseAiScan: IAiScanService = {
  async recognizeCard(imageBase64: string): Promise<AiScanResult> {
    logger.info("AiScan", "Sending image to Edge Function", {
      imageSize: `${Math.round(imageBase64.length / 1024)}KB`,
    });

    const { data, error } = await supabase.functions.invoke("ai-scan", {
      body: { image: imageBase64 },
    });

    if (error) {
      let detail = "";
      try {
        const ctx = (error as Record<string, unknown>).context as Response | undefined;
        if (ctx) {
          const body = await ctx.clone().json().catch(() => null);
          if (body) {
            detail = JSON.stringify(body);
            if (ctx.status === 429) {
              throw new Error(`SCAN_LIMIT_REACHED:${body.maxScans ?? 5}`);
            }
          }
          logger.error("AiScan", `Edge Function HTTP ${ctx.status}`, { body: detail });
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("SCAN_LIMIT_REACHED")) throw e;
      }
      logger.error("AiScan", `Edge Function error (${detail || "no body"})`, {
        error: String(error),
        errorKeys: Object.keys(error as object),
      });
      throw new Error(`AI scan failed: ${detail || String(error)}`);
    }

    logger.info("AiScan", "Recognition result", data);

    return {
      name: data.name ?? "",
      tcgType: data.tcgType ?? "pokemon",
      set: data.setName ?? "",
      number: data.cardNumber ?? "",
      rarity: data.rarity ?? "",
      estimatedCondition: data.estimatedCondition ?? "near_mint",
      confidence: data.confidence ?? 0,
      cardApiId: data.cardApiId ?? null,
      passcode: data.passcode ?? null,
      scryfallId: data.scryfallId ?? null,
      edition: data.edition ?? null,
      hp: data.hp ?? null,
      variant: data.variant ?? null,
      language: data.language ?? null,
    };
  },
};
