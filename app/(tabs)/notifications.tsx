import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useNotifications } from '../../hooks/useNotifications';
import { TopBar } from '../../components/ui/TopBar';
import { Avatar } from '../../components/ui/Avatar';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../lib/dateHelpers';
import { NOTIFICATION_DAYS_OPTIONS } from '../../lib/constants';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { birthdays } = useBirthdays();
  const {
    permissionStatus,
    daysBefore,
    requestPermission,
    updatePreference,
    scheduleAllNotifications,
  } = useNotifications();

  const isEnabled = permissionStatus === 'granted';

  const handleToggle = async () => {
    if (!isEnabled) {
      const granted = await requestPermission();
      if (granted) {
        scheduleAllNotifications(birthdays);
      }
    } else {
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, go to your device settings.'
      );
    }
  };

  const handleDaysChange = async (days: number) => {
    await updatePreference(days);
    if (isEnabled) {
      scheduleAllNotifications(birthdays);
    }
  };

  const upcomingNotifs = useMemo(() => {
    return birthdays
      .map((p) => ({
        ...p,
        daysUntil: getDaysUntilBirthday(p.birthday_month, p.birthday_day),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 20);
  }, [birthdays]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Notifications" />

      <FlatList
        data={upcomingNotifs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.toggleRow,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>
                Enable Notifications
              </Text>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{
                  false: colors.bottomBarBorder,
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.prefSection,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[styles.prefLabel, { color: colors.textSecondary }]}
              >
                Remind me before
              </Text>
              <View style={styles.prefOptions}>
                {NOTIFICATION_DAYS_OPTIONS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => handleDaysChange(d)}
                    style={[
                      styles.prefChip,
                      {
                        backgroundColor:
                          daysBefore === d
                            ? colors.primary
                            : colors.background,
                        borderColor:
                          daysBefore === d
                            ? colors.primary
                            : colors.bottomBarBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.prefChipText,
                        {
                          color:
                            daysBefore === d ? '#FFFFFF' : colors.textPrimary,
                        },
                      ]}
                    >
                      {d} day{d > 1 ? 's' : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Upcoming Reminders
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.notifRow,
              { backgroundColor: colors.surface },
            ]}
          >
            <Avatar uri={item.photo_url} size={40} />
            <View style={styles.notifInfo}>
              <Text
                style={[styles.notifName, { color: colors.textPrimary }]}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.notifDate, { color: colors.textSecondary }]}
              >
                {formatBirthdayDate(item.birthday_month, item.birthday_day)}
              </Text>
            </View>
            <Text style={[styles.notifBadge, { color: colors.primary }]}>
              {item.daysUntil === 0
                ? 'Today!'
                : `In ${item.daysUntil}d`}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text
              style={[styles.emptyText, { color: colors.textSecondary }]}
            >
              Add birthdays to see upcoming reminders.
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  prefSection: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
  },
  prefLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 10,
  },
  prefOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  prefChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  prefChipText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    gap: 12,
  },
  notifInfo: {
    flex: 1,
  },
  notifName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  notifDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  notifBadge: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  list: {
    paddingBottom: 40,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
  },
});
