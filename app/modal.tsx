import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useBirthdays } from '../hooks/useBirthdays';
import { useGroups } from '../hooks/useGroups';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import {
  BirthdayForm,
  BirthdayFormData,
} from '../components/birthday/BirthdayForm';
import { useAuth } from '../hooks/useAuth';

export default function AddEditBirthdayModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addBirthday, updateBirthday } = useBirthdays();
  const { refetch: refetchGroups } = useGroups();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    month?: string;
    day?: string;
    year?: string;
    photo?: string;
    notes?: string;
    groups?: string;
  }>();

  const [loading, setLoading] = useState(false);

  const isEdit = !!params.id;

  const initialValues = isEdit
    ? {
      name: params.name ?? '',
      birthday_month: params.month ? parseInt(params.month, 10) : 1,
      birthday_day: params.day ? parseInt(params.day, 10) : 1,
      birthday_year: params.year ? parseInt(params.year, 10) : null,
      photo_uri: params.photo ?? null,
      notes: params.notes ?? '',
      group_ids: params.groups ? params.groups.split(',') : [],
    }
    : undefined;

  const { user } = useAuth(); // Get user from auth hook

  const handleSubmit = async (data: BirthdayFormData) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('You must be signed in to save data.');
      }

      let photoUrl = data.photo_uri;

      // If we have a photo and it's a local URI (not http/s), upload it first
      if (photoUrl && !photoUrl.startsWith('http')) {
        if (__DEV__) console.log('[AddBirthday] Processing photo upload for:', photoUrl);
        try {
          // 0. Manipulate image (resize & compress)
          const manipulated = await ImageManipulator.manipulateAsync(
            photoUrl,
            [{ resize: { width: 600 } }], // Resize to max width 600
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          const processedUri = manipulated.uri;
          if (__DEV__) console.log('[AddBirthday] Processed image:', processedUri);

          // 1. Read file as base64 using expo-file-system
          const base64 = await FileSystem.readAsStringAsync(processedUri, {
            encoding: 'base64',
          });

          // 2. Prepare filename
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `people/${fileName}`;
          if (__DEV__) console.log('[AddBirthday] Uploading to path:', filePath);

          // 3. Upload to Supabase
          const arrayBuffer = decode(base64);

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, arrayBuffer, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (uploadError) {
            if (__DEV__) console.error('[AddBirthday] Upload failed:', uploadError);
            throw new Error(`Photo upload failed: ${uploadError.message}`);
          }
          if (__DEV__) console.log('[AddBirthday] Upload successful:', uploadData);

          // 4. Get Public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          if (__DEV__) console.log('[AddBirthday] Generated public URL:', urlData.publicUrl);
          // Add timestamp to force image refresh
          photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        } catch (uploadErr: any) {
          if (__DEV__) console.error('[AddBirthday] Critical upload error:', uploadErr);
          const msg = uploadErr.message || 'Unknown upload error';
          throw new Error(`Failed to upload photo: ${msg}`);
        }
      } else if (!photoUrl) {
        // Photo was removed
        if (__DEV__) console.log('[AddBirthday] Photo removed');
        photoUrl = null;
      } else {
        if (__DEV__) console.log('[AddBirthday] Photo is already remote:', photoUrl);
      }

      if (isEdit && params.id) {
        await updateBirthday(params.id, {
          name: data.name,
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          birthday_year: data.birthday_year,
          photo_url: photoUrl,
          notes: data.notes || null,
          group_ids: data.group_ids,
        });
      } else {
        await addBirthday({
          name: data.name,
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          birthday_year: data.birthday_year,
          photo_url: photoUrl,
          notes: data.notes || null,
          group_ids: data.group_ids,
        });
      }

      // Refresh groups so member counts update immediately
      refetchGroups();

      // Close modal immediately - user gets instant feedback
      router.back();

    } catch (err: unknown) {
      if (__DEV__) console.error('Save error details:', err);

      let errorMessage = 'Failed to save';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const supabaseError = err as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error) {
          errorMessage = supabaseError.error;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <BirthdayForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
