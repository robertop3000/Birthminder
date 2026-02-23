import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useNotifications } from '../../hooks/useNotifications';
import { TopBar } from '../../components/ui/TopBar';
import { Avatar } from '../../components/ui/Avatar';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
  getNextBirthday,
} from '../../lib/dateHelpers';
import { NOTIFICATION_DAYS_OPTIONS } from '../../lib/constants';
import { Person } from '../../hooks/useBirthdays';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getDaysLabel = (d: number) =>
  d === 0 ? 'Just the day of' : `${d} day${d > 1 ? 's' : ''} before`;

interface BirthdayWithDays extends Person {
  daysUntil: number;
  nextBirthday: Date;
}

interface MonthSection {
  title: string;
  data: BirthdayWithDays[];
  monthIndex: number;
  year: number;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { birthdays } = useBirthdays();
  const {
    daysBefore,
    updatePreference,
    scheduleAllNotifications,
    permissionStatus,
  } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isEnabled = permissionStatus === 'granted';

  const handleDaysChange = async (days: number) => {
    await updatePreference(days);
    if (isEnabled) {
      scheduleAllNotifications(birthdays);
    }
  };

  const sections = useMemo(() => {
    // 1. Calculate next birthday for everyone
    const withNext = birthdays.map((p) => ({
      ...p,
      daysUntil: getDaysUntilBirthday(p.birthday_month, p.birthday_day),
      nextBirthday: getNextBirthday(p.birthday_month, p.birthday_day),
    }));

    // 2. Sort by next birthday (absolute time)
    withNext.sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

    // 3. Group by Month (and Year to handle wrap-around of same month)
    const result: MonthSection[] = [];

    for (const item of withNext) {
      const mIndex = item.nextBirthday.getMonth();
      const year = item.nextBirthday.getFullYear();
      const monthName = MONTH_NAMES[mIndex];

      // Check if we need a new section
      const lastSection = result[result.length - 1];

      if (
        !lastSection ||
        lastSection.monthIndex !== mIndex ||
        lastSection.year !== year
      ) {
        result.push({
          title: monthName,
          data: [item],
          monthIndex: mIndex,
          year: year,
        });
      } else {
        lastSection.data.push(item);
      }
    }

    return result;
  }, [birthdays]);

  const renderHeader = () => (
    <View>
      <View
        style={[
          styles.infoRow,
          { backgroundColor: colors.surface },
        ]}
      >
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {isEnabled
            ? 'Notifications are enabled.'
            : 'To receive birthday reminders, enable notifications for Birthminder in your iOS Settings.'}
        </Text>
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
          Remind me
        </Text>
        <Pressable
          onPress={() => setDropdownOpen(!dropdownOpen)}
          style={[
            styles.dropdownHeader,
            {
              backgroundColor: colors.background,
              borderColor: dropdownOpen
                ? colors.primary
                : colors.bottomBarBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.dropdownHeaderText,
              { color: colors.textPrimary },
            ]}
          >
            {getDaysLabel(daysBefore)}
          </Text>
          <Text
            style={[
              styles.dropdownArrow,
              { color: colors.textSecondary },
            ]}
          >
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </Pressable>
        {dropdownOpen && (
          <View
            style={[
              styles.dropdownList,
              {
                backgroundColor: colors.background,
                borderColor: colors.bottomBarBorder,
              },
            ]}
          >
            {NOTIFICATION_DAYS_OPTIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  handleDaysChange(d);
                  setDropdownOpen(false);
                }}
                style={[
                  styles.dropdownOption,
                  daysBefore === d && {
                    backgroundColor: colors.primary + '15',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    {
                      color:
                        daysBefore === d
                          ? colors.primary
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {getDaysLabel(d)}
                </Text>
                {daysBefore === d && (
                  <Text style={{ color: colors.primary, fontSize: 16 }}>
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Notifications" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderSectionHeader={({ section }) => (
          <Text
            style={[styles.monthHeader, { color: colors.textSecondary }]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/person/${item.id}`)}
            style={({ pressed }) => [
              styles.notifRow,
              { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
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
          </Pressable>
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
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoRow: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 20,
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
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownOptionText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  monthHeader: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
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
