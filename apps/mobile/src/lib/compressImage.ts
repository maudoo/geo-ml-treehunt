import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Camera photos are 2-5MB+; verification and storage only need ~1280px.
// Resize + re-encode to shrink the GCS upload payload ~5-10x.
const MAX_WIDTH = 1280;

export async function compressImage(uri: string): Promise<string> {
  try {
    const rendered = await ImageManipulator.manipulate(uri)
      .resize({ width: MAX_WIDTH })
      .renderAsync();
    const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });
    return result.uri;
  } catch {
    // ponytail: on any manipulation failure, fall back to the original photo
    // so a quest is never blocked by compression.
    return uri;
  }
}
