import type { z } from "zod";
import type { ProfileSchema, ProfileUpdateSchema } from "../schemas/profile.schema";

export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
