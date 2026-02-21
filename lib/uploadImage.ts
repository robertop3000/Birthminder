import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * Upload a local image URI to Supabase Storage.
 * Resizes to 600px width, compresses to JPEG 0.7, uploads to 'avatars' bucket.
 *
 * @param localUri - local file URI from image picker
 * @param subfolder - subfolder within 'avatars' bucket (e.g., 'people', 'groups')
 * @returns public URL string with cache-busting timestamp
 */
export async function uploadImage(
  localUri: string,
  subfolder: 'people' | 'groups' = 'people'
): Promise<string> {
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

  return `${urlData.publicUrl}?t=${Date.now()}`;
}
