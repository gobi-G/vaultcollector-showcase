import { z } from "zod";

export const ArtworkImageSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  imageUrlSmall: z.string(),
});

export const SetVersionSchema = z.object({
  setName: z.string(),
  setCode: z.string(),
  rarity: z.string().nullable(),
  price: z.number().nullable(),
  imageUrl: z.string().nullable(),
  artworkId: z.string().nullable(),
});

export const CardSearchResultSchema = z.object({
  cardApiId: z.string(),
  name: z.string(),
  setName: z.string(),
  setCode: z.string().nullable(),
  imageUrl: z.string(),
  rarity: z.string().nullable(),
  price: z.number().nullable(),
  cardNumber: z.string().nullable(),
  passcode: z.string().nullable(),
  setVersions: z.array(SetVersionSchema).nullable(),
  artworkImages: z.array(ArtworkImageSchema).nullable(),
});
