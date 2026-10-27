import type { IStorageService, UploadResult } from "../../interfaces";
import { supabase } from "./SupabaseClient";

export const supabaseStorage: IStorageService = {
  async uploadImage(
    bucket: string,
    path: string,
    file: Blob | ArrayBuffer,
  ): Promise<UploadResult> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { path, publicUrl };
  },

  getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
