import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as Notifications from 'expo-notifications';
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
  const { user } = useAuth();
  const { birthdays, loading, refetch } = useBirthdays();
  const { scheduleAllNotifications, requestPermission, permissionStatus } = useNotifications();
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
    if (birthdays.length > 0) {
      scheduleAllNotifications(birthdays);
    }
  }, [birthdays]);

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

  const handleTestNotification = async () => {
    try {
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Please enable notifications in settings to test.');
          return;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Happy Birthday! 🎂',
          body: 'This is a test from BirthdayCalendar',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60,
          repeats: false,
        },
      });

      Alert.alert('Scheduled', 'Notification will fire in 60 seconds. Please minimize the app!');
    } catch (error: any) {
      console.error('Test notification error:', error);
      Alert.alert('Error', `Failed to schedule: ${error.message || error}`);
    }
  };

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
          <TouchableOpacity
            onPress={handleTestNotification}
            style={[styles.testButton, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test Notification (60s)
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={upcomingBirthdays}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BirthdayCard person={item} />}
          ListHeaderComponent={
            <>
              {todayBirthdays.map((p) => (
                <CelebrationBanner
                  key={p.id}
                  name={p.name}
                  photoUrl={p.photo_url}
                />
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
          ListFooterComponent={
            <View style={styles.testButtonContainer}>
              <TouchableOpacity
                onPress={handleTestNotification}
                style={[styles.testButton, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.bottomBarBorder }]}
              >
                <Text style={[styles.testButtonText, { color: colors.primary }]}>
                  Test Notification (60s)
                </Text>
              </TouchableOpacity>
              <View style={{ height: 80 }} />
            </View>
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
  testButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
  },
  testButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  testButtonContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
