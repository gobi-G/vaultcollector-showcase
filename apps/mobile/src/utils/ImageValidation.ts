import { Image as RNImage } from "react-native";

type ValidationResult = {
  valid: boolean;
  issue?: "too_dark" | "too_blurry" | "too_small";
};

/**
 * Basic image validation before sending to AI scan.
 * Checks dimensions to ensure the photo is usable.
 */
export function validateCapturedImage(photoPath: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    RNImage.getSize(
      photoPath,
      (width, height) => {
        if (width < 200 || height < 200) {
          resolve({ valid: false, issue: "too_small" });
          return;
        }
        resolve({ valid: true });
      },
      () => {
        resolve({ valid: false, issue: "too_small" });
      },
    );
  });
}
