import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBirthdays, Person } from '../../hooks/useBirthdays';
import { useNotifications } from '../../hooks/useNotifications';
import { TopBar } from '../../components/ui/TopBar';
import { FAB } from '../../components/ui/FAB';
import { Avatar } from '../../components/ui/Avatar';
import { CalendarImportModal } from '../../components/birthday/CalendarImportModal';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
  getNextBirthday,
} from '../../lib/dateHelpers';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { birthdays } = useBirthdays();
  const { permissionStatus } = useNotifications();
  const [query, setQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const isEnabled = permissionStatus === 'granted';

  const sections = useMemo(() => {
    const filtered = query.trim()
      ? birthdays.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      : birthdays;

    const withNext = filtered.map((p) => ({
      ...p,
      daysUntil: getDaysUntilBirthday(p.birthday_month, p.birthday_day),
      nextBirthday: getNextBirthday(p.birthday_month, p.birthday_day),
    }));

    withNext.sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

    const result: MonthSection[] = [];

    for (const item of withNext) {
      const mIndex = item.nextBirthday.getMonth();
      const year = item.nextBirthday.getFullYear();
      const monthName = MONTH_NAMES[mIndex];

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
          year,
        });
      } else {
        lastSection.data.push(item);
      }
    }

    return result;
  }, [birthdays, query]);

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

      <Pressable
        onPress={() => setShowImportModal(true)}
        style={[styles.importButton, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.importButtonText, { color: colors.primary }]}>
          Import from Calendar
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Search" />

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search birthdays..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

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
              styles.row,
              { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Avatar uri={item.photo_url} size={40} />
            <View style={styles.rowInfo}>
              <Text
                style={[styles.rowName, { color: colors.textPrimary }]}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.rowDate, { color: colors.textSecondary }]}
              >
                {formatBirthdayDate(item.birthday_month, item.birthday_day)}
              </Text>
            </View>
            <Text style={[styles.rowBadge, { color: colors.primary }]}>
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
              {query.trim()
                ? 'No one found. Add them with the + button!'
                : 'Add birthdays to see upcoming reminders.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      <FAB />

      <CalendarImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => setShowImportModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    paddingVertical: 0,
  },
  infoRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 20,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  importButtonText: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    gap: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  rowDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  rowBadge: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  list: {
    paddingBottom: 120,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
});
