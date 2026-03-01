import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImage(
  localUri: string,
  subfolder: 'people' | 'groups' = 'people'
): Promise<string> {
  // Client-side file size check before processing
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image is too large. Please choose an image under 5 MB.');
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: 'base64',
  });

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `${subfolder}/${fileName}`;

  const arrayBuffer = decode(base64);
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
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
