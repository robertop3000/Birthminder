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
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useGroups } from '../../hooks/useGroups';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../lib/dateHelpers';

interface SharedPerson {
  id: string;
  name: string;
  birthday_month: number;
  birthday_day: number;
  birthday_year: number | null;
  photo_url: string | null;
  notes: string | null;
}

interface SharedGroup {
  id: string;
  name: string;
  color: string | null;
  photo_url: string | null;
  members: SharedPerson[];
}

export default function SharedGroupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const { refetch: refetchBirthdays } = useBirthdays();
  const { refetch: refetchGroups } = useGroups();

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
          'id, name, color, photo_url, person_groups(people(id, name, birthday_month, birthday_day, birthday_year, photo_url, notes))'
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
        photo_url: data.photo_url ?? null,
        members,
      });
    } catch {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const performFreshImport = async () => {
    if (!user || !group) return;

    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert({
        user_id: user.id,
        name: group.name,
        color: group.color,
        photo_url: group.photo_url,
        source_share_code: code,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    for (const member of group.members) {
      // Check if this person already exists in user's data
      const { data: existingPerson } = await supabase
        .from('people')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', member.name)
        .eq('birthday_month', member.birthday_month)
        .eq('birthday_day', member.birthday_day)
        .maybeSingle();

      if (existingPerson) {
        // Person already exists — just link to the new group
        await supabase.from('person_groups').insert({
          person_id: existingPerson.id,
          group_id: newGroup.id,
          user_id: user.id,
        });
      } else {
        // Create new person
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            user_id: user.id,
            name: member.name,
            birthday_month: member.birthday_month,
            birthday_day: member.birthday_day,
            birthday_year: member.birthday_year,
            photo_url: member.photo_url,
            notes: member.notes,
          })
          .select()
          .single();

        if (!personError && person) {
          await supabase.from('person_groups').insert({
            person_id: person.id,
            group_id: newGroup.id,
            user_id: user.id,
          });
        }
      }
    }

    // Force context refetch to update UI across all tabs immediately
    await Promise.all([refetchBirthdays(), refetchGroups()]);

    Alert.alert('Imported!', `Group "${group.name}" has been added to your calendar.`);
    router.replace('/(tabs)/groups');
  };

  const handleReimport = async (existingGroupId: string) => {
    if (!user || !group) return;

    try {
      // Update group metadata
      await supabase
        .from('groups')
        .update({
          name: group.name,
          color: group.color,
          photo_url: group.photo_url,
        })
        .eq('id', existingGroupId);

      for (const member of group.members) {
        const { data: existingPerson } = await supabase
          .from('people')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', member.name)
          .eq('birthday_month', member.birthday_month)
          .eq('birthday_day', member.birthday_day)
          .maybeSingle();

        if (!existingPerson) {
          // New member — create and link
          const { data: person } = await supabase
            .from('people')
            .insert({
              user_id: user.id,
              name: member.name,
              birthday_month: member.birthday_month,
              birthday_day: member.birthday_day,
              birthday_year: member.birthday_year,
              photo_url: member.photo_url,
              notes: member.notes,
            })
            .select()
            .single();

          if (person) {
            await supabase.from('person_groups').insert({
              person_id: person.id,
              group_id: existingGroupId,
              user_id: user.id,
            });
          }
        } else {
          // Existing person — ensure linked to group
          await supabase
            .from('person_groups')
            .upsert(
              { person_id: existingPerson.id, group_id: existingGroupId, user_id: user.id },
              { onConflict: 'person_id,group_id' }
            );
        }
      }

      // Force context refetch to update UI across all tabs immediately
      await Promise.all([refetchBirthdays(), refetchGroups()]);

      Alert.alert('Updated!', `Group "${group.name}" has been refreshed.`);
      router.replace('/(tabs)/groups');
    } catch {
      Alert.alert('Error', 'Failed to update group.');
    } finally {
      setImporting(false);
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
      // Check if already imported
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('user_id', user.id)
        .eq('source_share_code', code)
        .maybeSingle();

      if (existingGroup) {
        setImporting(false);
        Alert.alert(
          'Already Imported',
          'You have already imported this group. Would you like to update it with the latest data?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update',
              onPress: async () => {
                setImporting(true);
                await handleReimport(existingGroup.id);
              },
            },
          ]
        );
        return;
      }

      await performFreshImport();
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
        {group.photo_url ? (
          <Avatar uri={group.photo_url} size={48} />
        ) : (
          <Ionicons name="people" size={28} color={colors.primary} />
        )}
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
              key={member.id || index}
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
