import { Dimensions } from "react-native";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import ReactNativeBlobUtil from "react-native-blob-util";
import { logger } from "./Logger";

const SCAN_IMAGE_WIDTH = 1024;
const SCAN_JPEG_QUALITY = 0.85;

// Bounding box from ScanCameraOverlay (centered)
const FRAME_WIDTH = 260;
const FRAME_HEIGHT = 360;

export async function compressAndEncodeImage(photoPath: string): Promise<string> {
  // 1. Fix orientation
  const oriented = await ImageManipulator.manipulate(`file://${photoPath}`)
    .rotate(0)
    .renderAsync();
  const full = await oriented.saveAsync({ format: SaveFormat.JPEG, compress: 1 });

  // 2. Crop to card area (map screen bounding box to image coordinates)
  const screen = Dimensions.get("window");
  const scaleX = full.width / screen.width;
  const scaleY = full.height / screen.height;

  const cropX = Math.max(0, Math.round((screen.width - FRAME_WIDTH) / 2 * scaleX));
  const cropY = Math.max(0, Math.round((screen.height - FRAME_HEIGHT) / 2 * scaleY));
  const cropW = Math.min(Math.round(FRAME_WIDTH * scaleX), full.width - cropX);
  const cropH = Math.min(Math.round(FRAME_HEIGHT * scaleY), full.height - cropY);

  logger.info("Image", "Cropping", { cropX, cropY, cropW, cropH, imgW: full.width, imgH: full.height });

  const imageRef = await ImageManipulator.manipulate(full.uri)
    .crop({ originX: cropX, originY: cropY, width: cropW, height: cropH })
    .resize({ width: SCAN_IMAGE_WIDTH })
    .renderAsync();
  const compressed = await imageRef.saveAsync({
    format: SaveFormat.JPEG,
    compress: SCAN_JPEG_QUALITY,
  });
  logger.info("Image", "Compressed", { width: compressed.width, height: compressed.height });

  // Convert to base64
  const cleanPath = compressed.uri.replace("file://", "");
  const base64 = await ReactNativeBlobUtil.fs.readFile(cleanPath, "base64");
  logger.info("Image", "Base64 ready", { size: `${Math.round(base64.length / 1024)}KB` });

  return base64;
}

/**
 * Crops and orients the photo to the card bounding box area for display.
 * Returns a file:// URI of the cropped image.
 */
export async function cropCardPreview(photoPath: string): Promise<string> {
  const screen = Dimensions.get("window");

  // Fix orientation first
  const oriented = await ImageManipulator.manipulate(`file://${photoPath}`)
    .rotate(0)
    .renderAsync();
  const full = await oriented.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });

  const scaleX = full.width / screen.width;
  const scaleY = full.height / screen.height;

  const cropX = Math.max(0, Math.round((screen.width - FRAME_WIDTH) / 2 * scaleX));
  const cropY = Math.max(0, Math.round((screen.height - FRAME_HEIGHT) / 2 * scaleY));
  const cropW = Math.min(Math.round(FRAME_WIDTH * scaleX), full.width - cropX);
  const cropH = Math.min(Math.round(FRAME_HEIGHT * scaleY), full.height - cropY);

  const cropped = await ImageManipulator.manipulate(full.uri)
    .crop({ originX: cropX, originY: cropY, width: cropW, height: cropH })
    .renderAsync();
  const result = await cropped.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });

  return result.uri;
}
