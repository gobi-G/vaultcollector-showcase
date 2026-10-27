export type UploadResult = {
  path: string;
  publicUrl: string;
};

export interface IStorageService {
  uploadImage(
    bucket: string,
    path: string,
    file: Blob | ArrayBuffer,
  ): Promise<UploadResult>;
  getPublicUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<void>;
}
