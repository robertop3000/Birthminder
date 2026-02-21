import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useBirthdays } from '../hooks/useBirthdays';
import { useGroups } from '../hooks/useGroups';
import { uploadImage } from '../lib/uploadImage';
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

      if (photoUrl && !photoUrl.startsWith('http')) {
        photoUrl = await uploadImage(photoUrl, 'people');
      } else if (!photoUrl) {
        photoUrl = null;
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
