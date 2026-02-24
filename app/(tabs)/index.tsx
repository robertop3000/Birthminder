import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useNotifications } from '../../hooks/useNotifications';
import { TopBar } from '../../components/ui/TopBar';
import { FAB } from '../../components/ui/FAB';
import { BirthdayCard } from '../../components/birthday/BirthdayCard';
import { CelebrationBanner } from '../../components/birthday/CelebrationBanner';
import {
  isBirthdayToday,
  getDaysUntilBirthday,
} from '../../lib/dateHelpers';
import { APP_NAME } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { birthdays, loading } = useBirthdays();
  const { scheduleAllNotifications, permissionStatus } = useNotifications();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [user]);

  useEffect(() => {
    if (birthdays.length > 0 && permissionStatus === 'granted') {
      scheduleAllNotifications(birthdays);
    }
  }, [birthdays, permissionStatus, scheduleAllNotifications]);

  const todayBirthdays = useMemo(
    () =>
      birthdays.filter((p) =>
        isBirthdayToday(p.birthday_month, p.birthday_day)
      ),
    [birthdays]
  );

  const upcomingBirthdays = useMemo(
    () =>
      birthdays
        .filter((p) => {
          const days = getDaysUntilBirthday(
            p.birthday_month,
            p.birthday_day
          );
          return days > 0 && days <= 30;
        })
        .sort(
          (a, b) =>
            getDaysUntilBirthday(a.birthday_month, a.birthday_day) -
            getDaysUntilBirthday(b.birthday_month, b.birthday_day)
        ),
    [birthdays]
  );


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={APP_NAME} avatarUrl={avatarUrl} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : birthdays.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎂</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No birthdays yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap + to add your first birthday!
          </Text>
        </View>
      ) : (
        <FlatList
          data={upcomingBirthdays}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BirthdayCard person={item} />}
          ListHeaderComponent={
            <>
              {todayBirthdays.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/person/${p.id}`)}>
                  <CelebrationBanner
                    name={p.name}
                    photoUrl={p.photo_url}
                  />
                </Pressable>
              ))}


              {upcomingBirthdays.length > 0 && (
                <Text
                  style={[styles.sectionTitle, { color: colors.textSecondary }]}
                >
                  Upcoming (next 30 days)
                </Text>
              )}
            </>
          }
          ListEmptyComponent={
            todayBirthdays.length === 0 ? (
              <View style={styles.center}>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  No upcoming birthdays in the next 30 days.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 120,
  },
  diagnosticSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  diagnosticText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  testButton: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    paddingVertical: 8,
    textDecorationLine: 'underline',
  },
});
