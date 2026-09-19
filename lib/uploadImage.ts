import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const TOO_LARGE_MESSAGE = 'Image is too large. Please choose an image under 5 MB.';

async function prepareNative(localUri: string): Promise<ArrayBuffer> {
  // Client-side file size check before processing
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(TOO_LARGE_MESSAGE);
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: 'base64',
  });

  return decode(base64);
}

async function prepareWeb(localUri: string): Promise<ArrayBuffer | Blob> {
  // The picker returns a data: or blob: URL on web; fetch it to check the size.
  const original = await fetch(localUri);
  const originalBlob = await original.blob();
  if (originalBlob.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(TOO_LARGE_MESSAGE);
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (manipulated.base64) {
    return decode(manipulated.base64);
  }

  const processed = await fetch(manipulated.uri);
  return processed.blob();
}

export async function uploadImage(
  localUri: string,
  subfolder: 'people' | 'groups' = 'people'
): Promise<string> {
  const body = Platform.OS === 'web' ? await prepareWeb(localUri) : await prepareNative(localUri);

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `${subfolder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, body, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Photo upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Each upload gets a unique fileName (timestamp + random), so the URL is
  // already unique — no cache-busting query param needed. This lets expo-image
  // disk cache work correctly for all viewers.
  return urlData.publicUrl;
}
