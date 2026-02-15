import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../lib/dateHelpers';

interface SharedPerson {
  name: string;
  birthday_month: number;
  birthday_day: number;
  photo_url: string | null;
}

interface SharedGroup {
  id: string;
  name: string;
  color: string | null;
  members: SharedPerson[];
}

export default function SharedGroupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();

  const [group, setGroup] = useState<SharedGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadSharedGroup();
  }, [code]);

  const loadSharedGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(
          'id, name, color, person_groups(people(name, birthday_month, birthday_day, photo_url))'
        )
        .eq('share_code', code)
        .single();

      if (error) throw error;

      const members: SharedPerson[] = [];
      if (data.person_groups) {
        for (const pg of data.person_groups as unknown as Array<{ people: SharedPerson }>) {
          if (pg.people) {
            members.push(pg.people);
          }
        }
      }

      setGroup({
        id: data.id,
        name: data.name,
        color: data.color,
        members,
      });
    } catch {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      router.push('/(auth)/signup');
      return;
    }

    if (!group) return;

    setImporting(true);
    try {
      // Create a group copy
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          user_id: user.id,
          name: group.name,
          color: group.color,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Copy members
      for (const member of group.members) {
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            user_id: user.id,
            name: member.name,
            birthday_month: member.birthday_month,
            birthday_day: member.birthday_day,
            photo_url: member.photo_url,
          })
          .select()
          .single();

        if (!personError && person && newGroup) {
          await supabase.from('person_groups').insert({
            person_id: person.id,
            group_id: newGroup.id,
          });
        }
      }

      Alert.alert('Imported!', 'The group has been added to your calendar.');
      router.replace('/(tabs)/groups');
    } catch {
      Alert.alert('Error', 'Failed to import group.');
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

  if (!group) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
          Shared group not found.
        </Text>
        <Button
          title="Go Home"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <View style={[styles.banner, { backgroundColor: colors.surface }]}>
        <Ionicons name="people" size={28} color={colors.primary} />
        <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
          Someone shared their{' '}
          <Text style={{ color: colors.primary }}>{group.name}</Text>{' '}
          birthdays with you
        </Text>
      </View>

      <View style={styles.section}>
        {group.members.map((member, index) => {
          const daysUntil = getDaysUntilBirthday(
            member.birthday_month,
            member.birthday_day
          );
          const dateStr = formatBirthdayDate(
            member.birthday_month,
            member.birthday_day
          );

          return (
            <View
              key={index}
              style={[
                styles.memberCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Avatar uri={member.photo_url} size={44} />
              <View style={styles.memberInfo}>
                <Text
                  style={[
                    styles.memberName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {member.name}
                </Text>
                <Text
                  style={[
                    styles.memberDate,
                    { color: colors.textSecondary },
                  ]}
                >
                  {dateStr}
                </Text>
              </View>
              <Text style={[styles.daysBadgeText, { color: colors.primary }]}>
                {daysUntil === 0 ? 'Today!' : `${daysUntil}d`}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.importSection}>
        <Button
          title="Import to my Birthminder"
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
  section: {
    marginTop: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  memberDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  daysBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  importSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  importButton: {
    marginBottom: 8,
  },
});
