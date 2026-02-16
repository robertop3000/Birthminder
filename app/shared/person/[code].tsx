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
import { useBirthdays } from '../../../hooks/useBirthdays';
import { supabase } from '../../../lib/supabase';
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
  const { addBirthday } = useBirthdays();

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
      await addBirthday({
        name: person.name,
        birthday_month: person.birthday_month,
        birthday_day: person.birthday_day,
        birthday_year: person.birthday_year,
        photo_url: person.photo_url,
        notes: person.notes,
      });

      Alert.alert('Imported!', `${person.name}'s birthday has been added to your calendar.`);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Failed to import birthday.');
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
        <Ionicons name="gift" size={28} color={colors.primary} />
        <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
          Someone shared{' '}
          <Text style={{ color: colors.primary }}>{person.name}</Text>'s
          birthday with you
        </Text>
      </View>

      <View style={styles.profileSection}>
        <Avatar uri={person.photo_url} size={120} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {person.name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {dateStr}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {daysUntil === 0 ? 'Today!' : `${daysUntil}`}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {daysUntil === 0 ? '' : 'days left'}
          </Text>
        </View>
      </View>

      {person.notes && (
        <View style={styles.notesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Notes
          </Text>
          <Text style={[styles.notesText, { color: colors.textPrimary }]}>
            {person.notes}
          </Text>
        </View>
      )}

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
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  bannerText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 16,
  },
  date: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 100,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  notesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 22,
  },
  importSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  importButton: {
    marginBottom: 8,
  },
});
