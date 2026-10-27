import { useCallback } from "react";
import type { ArtworkImage, CardSearchResult } from "@vault-collector/shared";
import type { AiScanResult } from "@/services/interfaces/AiScanInterface";
import {
  getSearchProvider,
  pokemonTcgSearch,
  scryfallSearch,
  ygoProSearch,
} from "@/services";
import { calculateConfidence } from "@/utils/ScanConfidence";
import { logger } from "@/utils/Logger";

type ConfidenceChecks = {
  name: boolean;
  number: boolean;
  set: boolean;
  image: boolean;
};

type LookupResult = {
  imageUrl: string | undefined;
  price: number | null;
  confidence: number;
  checks: ConfidenceChecks | null;
  alternativeCards: CardSearchResult[];
  artworkData: {
    images: ArtworkImage[];
    matchedIndex: number;
    matchConfidence: number;
  } | null;
  correctedName: string | null;
  correctedSet: string | null;
  correctedNumber: string | null;
};

export function useCardLookup() {
  const lookup = useCallback(
    async (result: AiScanResult, base64: string): Promise<LookupResult> => {
      let imageUrl: string | undefined;
      let validatedConfidence = result.confidence;
      let price: number | null = null;
      let correctedName: string | null = null;
      let correctedSet: string | null = null;
      let correctedNumber: string | null = null;
      let alternativeCards: CardSearchResult[] = [];
      let artworkData: LookupResult["artworkData"] = null;
      let confidenceChecks: ConfidenceChecks | null = null;

      try {
        let card = null;
        let foundByDirectLookup = false;

        // 1. Pokemon: use name + collector number for precise match
        if (result.tcgType === "pokemon" && result.number) {
          card =
            (await pokemonTcgSearch.searchByNameAndNumber?.(
              result.name,
              result.number,
            )) ?? null;
          foundByDirectLookup = !!card;
          logger.info("Scan", "Pokemon lookup by name+number", {
            name: result.name,
            number: result.number,
            found: !!card,
          });
        }
        // Yu-Gi-Oh: passcode lookup
        else if (result.tcgType === "yugioh" && result.passcode) {
          card = (await ygoProSearch.getById?.(result.passcode)) ?? null;
          foundByDirectLookup = !!card;
          logger.info("Scan", "YuGiOh lookup by passcode", {
            passcode: result.passcode,
            found: !!card,
          });
        }
        // Magic: scryfall ID lookup
        else if (result.tcgType === "magic" && result.scryfallId) {
          card = (await scryfallSearch.getById?.(result.scryfallId)) ?? null;
          foundByDirectLookup = !!card;
          logger.info("Scan", "Magic lookup by scryfallId", {
            scryfallId: result.scryfallId,
            found: !!card,
          });

          // Secondary lookup: scryfallId failed (wrong set code), try name + collector number
          if (!card && result.number) {
            const num = result.number.split("/")[0];
            const secondaryQuery = `${result.name} cn:${num}`;
            logger.info("Scan", "Magic secondary lookup by name+number", {
              query: secondaryQuery,
            });
            const secondaryResults = await scryfallSearch.search(secondaryQuery, 1);
            card = secondaryResults[0] ?? null;
          }
        }

        // Fallback: name search, prefer matching set
        if (!card) {
          const cleanedName = result.name
            .replace(/\s*\(.*?\)\s*$/g, "")
            .replace(/\s*[-–]\s*\d+$/, "")
            .trim();

          logger.info("Scan", "Falling back to name search", {
            name: cleanedName,
            originalName: result.name,
            set: result.set,
          });
          const provider = getSearchProvider(result.tcgType);
          let cards = await provider.search(cleanedName);

          if (cards.length === 0 && cleanedName.split(/\s+/).length > 2) {
            const shortName = cleanedName.split(/\s+/).slice(0, 3).join(" ");
            logger.info("Scan", "Retrying with shorter name", { shortName });
            cards = await provider.search(shortName);
          }
          alternativeCards = cards;

          const numFromId = result.cardApiId?.match(/-(\d+)$/)?.[1];
          const rawNum = result.number || numFromId || null;
          if (rawNum && cards.length > 0) {
            const cleanNum = rawNum.split("/")[0].replace(/^0+/, "");
            const numMatch = cards.find((c) => c.cardNumber === cleanNum);
            if (numMatch) {
              logger.info("Scan", "Matched by card number", {
                number: numMatch.cardNumber,
                set: numMatch.setName,
              });
              card = numMatch;
            }
          }

          if (!card && result.set && cards.length > 0) {
            const setWords = result.set
              .toLowerCase()
              .split(/[\s:,]+/)
              .filter((w) => w.length > 2);
            const setMatch = cards.find((c) => {
              const apiSet = c.setName.toLowerCase();
              return (
                setWords.some((word) => apiSet.includes(word)) ||
                apiSet.split(/\s+/).some((w) => setWords.includes(w))
              );
            });
            if (setMatch) {
              logger.info("Scan", "Matched by set name", { set: setMatch.setName });
              card = setMatch;
            }
          }

          if (!card) {
            card = cards[0] ?? null;
          }
        }

        if (card) {
          imageUrl = card.imageUrl;
          price = card.price ?? null;
          correctedName = card.name;
          correctedSet = card.setName;
          correctedNumber = card.cardNumber ?? null;

          // Artwork matching — only when NOT found by direct ID lookup (direct lookup already has the exact card)
          if (
            !foundByDirectLookup &&
            (result.tcgType === "yugioh" || result.tcgType === "magic") &&
            card.artworkImages &&
            card.artworkImages.length > 1
          ) {
            try {
              const { matchArtwork } =
                await import("@/services/implementations/supabase/SupabaseArtworkMatch");
              logger.info("Scan", "Matching artwork...", {
                count: card.artworkImages.length,
              });
              const matchResult = await matchArtwork(base64, card.artworkImages);
              logger.info("Scan", "Artwork matched", {
                index: matchResult.matchIndex,
                confidence: matchResult.confidence,
              });
              artworkData = {
                images: card.artworkImages,
                matchedIndex: matchResult.matchIndex,
                matchConfidence: matchResult.confidence,
              };
              imageUrl = card.artworkImages[matchResult.matchIndex]?.imageUrl ?? imageUrl;
            } catch {
              logger.warn("Scan", "Artwork matching failed, using default");
            }
          }
        }

        // Set versions: match scanned photo against version images to find correct printing
        // Skip when found by direct ID lookup — we already have the exact printing
        if (!foundByDirectLookup && card?.setVersions && card.setVersions.length > 1) {
          const versionsWithImages = card.setVersions.filter((v) => v.imageUrl);

          // Use artwork matching to find the right printing
          if (versionsWithImages.length > 1) {
            try {
              const { matchArtwork } =
                await import("@/services/implementations/supabase/SupabaseArtworkMatch");
              const versionArtworks: ArtworkImage[] = versionsWithImages.map((v, i) => ({
                id: v.artworkId ?? `version-${i}`,
                imageUrl: v.imageUrl ?? "",
                imageUrlSmall: v.imageUrl ?? "",
              }));
              logger.info("Scan", "Matching against set versions...", {
                count: versionArtworks.length,
              });
              const versionMatch = await matchArtwork(base64, versionArtworks);
              const matched = versionsWithImages[versionMatch.matchIndex];
              if (matched && versionMatch.confidence > 0.5) {
                imageUrl = matched.imageUrl ?? imageUrl;
                price = matched.price ?? price;
                logger.info("Scan", "Version matched", {
                  set: matched.setName,
                  confidence: versionMatch.confidence,
                });
              }
            } catch {
              logger.warn("Scan", "Version matching failed, using default");
            }
          }

          const versionAlts: CardSearchResult[] = card.setVersions.map((v) => ({
            cardApiId: v.artworkId ?? card.cardApiId,
            name: card.name,
            setName: v.setName,
            setCode: v.setCode,
            imageUrl: v.imageUrl ?? card.imageUrl,
            rarity: v.rarity,
            price: v.price,
            cardNumber: null,
            passcode: null,
            setVersions: null,
            artworkImages: null,
          }));
          alternativeCards = versionAlts;
          logger.info("Scan", "Set versions loaded", { count: versionAlts.length });
        }

        // Calculate app-side confidence
        const { score, level, checks } = calculateConfidence(result, card);
        logger.info("Scan", "Confidence calculated", {
          score,
          level,
          aiConfidence: result.confidence,
        });
        validatedConfidence = score / 100;
        confidenceChecks = checks;
      } catch (lookupErr) {
        logger.warn("Scan", "Could not fetch card data from API", {
          error: String(lookupErr),
        });
      }

      if (!imageUrl) {
        logger.warn("Scan", "No image URL found for scanned card", {
          name: result.name,
          tcgType: result.tcgType,
        });
      }

      return {
        imageUrl,
        price,
        confidence: validatedConfidence,
        checks: confidenceChecks,
        alternativeCards,
        artworkData,
        correctedName,
        correctedSet,
        correctedNumber,
      };
    },
    [],
  );

  return { lookup };
}
