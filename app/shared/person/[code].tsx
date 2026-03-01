import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { useBirthdays } from '../../../hooks/useBirthdays';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../../lib/dateHelpers';

interface SharedPerson {
  id: string;
  name: string;
  birthday_month: number;
  birthday_day: number;
  birthday_year: number | null;
  photo_url: string | null;
  notes: string | null;
}

export default function SharedPersonScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const { refetch: refetchBirthdays } = useBirthdays();

  const [person, setPerson] = useState<SharedPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadSharedPerson();
  }, [code]);

  const loadSharedPerson = async () => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('id, name, birthday_month, birthday_day, birthday_year, photo_url, notes')
        .eq('share_code', code)
        .single();

      if (error) throw error;
      setPerson(data);
    } catch {
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      router.push('/(auth)/signup');
      return;
    }

    if (!person) return;

    setImporting(true);
    try {
      // Check if already imported (same name + same birthday)
      const { data: existing } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', person.name)
        .eq('birthday_month', person.birthday_month)
        .eq('birthday_day', person.birthday_day)
        .maybeSingle();

      if (existing) {
        Alert.alert(
          'Already Saved',
          `${person.name} is already in your Birthminder!`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
        return;
      }

      const { error: insertError } = await supabase.from('people').insert({
        user_id: user.id,
        name: person.name,
        birthday_month: person.birthday_month,
        birthday_day: person.birthday_day,
        birthday_year: person.birthday_year,
        photo_url: person.photo_url,
        notes: person.notes,
      });

      if (insertError) throw insertError;

      await refetchBirthdays();

      Alert.alert('Saved!', `${person.name}'s birthday has been added to your Birthminder.`);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Failed to save birthday.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!person) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
          Shared birthday not found.
        </Text>
        <Button
          title="Go Home"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const daysUntil = getDaysUntilBirthday(person.birthday_month, person.birthday_day);
  const dateStr = formatBirthdayDate(
    person.birthday_month,
    person.birthday_day,
    person.birthday_year
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <View style={[styles.banner, { backgroundColor: colors.surface }]}>
        <Avatar uri={person.photo_url} size={72} />
        <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
          Someone shared{' '}
          <Text style={{ color: colors.primary }}>{person.name}</Text>'s
          birthday with you
        </Text>
      </View>

      <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textPrimary }]}>
            {dateStr}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.primary }]}>
            {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} away`}
          </Text>
        </View>

        {person.notes ? (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {person.notes}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.importSection}>
        <Button
          title="Save to my Birthminder"
          onPress={handleImport}
          loading={importing}
          style={styles.importButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'DMSans_500Medium',
  },
  banner: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 14,
  },
  bannerText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    flex: 1,
  },
  importSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  importButton: {
    marginBottom: 8,
  },
});
