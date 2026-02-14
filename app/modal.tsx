import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useBirthdays } from '../hooks/useBirthdays';
import { supabase } from '../lib/supabase';
import {
  BirthdayForm,
  BirthdayFormData,
} from '../components/birthday/BirthdayForm';

export default function AddEditBirthdayModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addBirthday, updateBirthday } = useBirthdays();
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

  const handleSubmit = async (data: BirthdayFormData) => {
    setLoading(true);
    try {
      // Save birthday data first (fast)
      if (isEdit && params.id) {
        await updateBirthday(params.id, {
          name: data.name,
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          birthday_year: data.birthday_year,
          photo_url: data.photo_uri, // Use existing or new URI temporarily
          notes: data.notes || null,
          group_ids: data.group_ids,
        });
      } else {
        await addBirthday({
          name: data.name,
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          birthday_year: data.birthday_year,
          photo_url: data.photo_uri,
          notes: data.notes || null,
          group_ids: data.group_ids,
        });
      }

      // Close modal immediately - user gets instant feedback
      router.back();

      // Upload photo in background (non-blocking)
      if (data.photo_uri && !data.photo_uri.startsWith('http')) {
        const photoUriToUpload = data.photo_uri; // Capture in closure
        setTimeout(async () => {
          try {
            const response = await fetch(photoUriToUpload);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const ext = photoUriToUpload.split('.').pop() || 'jpg';
            const filePath = `people/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, arrayBuffer, {
                contentType: `image/${ext}`,
                upsert: true,
              });

            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
              const photoUrl = urlData.publicUrl;

              // Update the photo URL after upload completes
              const personId = isEdit ? params.id : null;
              if (personId) {
                await updateBirthday(personId, { photo_url: photoUrl });
              }
            }
          } catch (photoErr) {
            console.warn('Background photo upload failed:', photoErr);
          }
        }, 100);
      }
    } catch (err: unknown) {
      console.error('Save error details:', err);
      console.error('Error type:', typeof err);
      console.error('Error stringified:', JSON.stringify(err, null, 2));

      let errorMessage = 'Failed to save';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Supabase errors might not be Error instances
        const supabaseError = err as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error) {
          errorMessage = supabaseError.error;
        }
      }

      // Show simpler error now that database is set up
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
