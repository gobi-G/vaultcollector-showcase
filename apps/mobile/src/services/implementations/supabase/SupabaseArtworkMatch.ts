import type { ArtworkImage } from "@vault-collector/shared";
import { supabase } from "./SupabaseClient";
import { logger } from "@/utils/Logger";

type ArtworkMatchResult = {
  matchIndex: number;
  confidence: number;
};

export async function matchArtwork(
  scannedImageBase64: string,
  artworkImages: ArtworkImage[],
): Promise<ArtworkMatchResult> {
  logger.info("ArtworkMatch", `Matching against ${artworkImages.length} artworks`);

  const { data, error } = await supabase.functions.invoke("artwork-match", {
    body: {
      image: scannedImageBase64,
      artworkUrls: artworkImages.map((a) => a.imageUrlSmall),
    },
  });

  if (error) {
    logger.error("ArtworkMatch", "Edge Function error", error);
    return { matchIndex: 0, confidence: 0 };
  }

  const result: ArtworkMatchResult = data?.data ?? data ?? { matchIndex: 0, confidence: 0 };
  logger.info("ArtworkMatch", `Matched artwork index: ${result.matchIndex} (confidence: ${result.confidence})`);

  return result;
}
