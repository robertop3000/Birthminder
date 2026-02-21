import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { Avatar } from '../ui/Avatar';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../lib/dateHelpers';
import { Person } from '../../hooks/useBirthdays';

interface BirthdayCardProps {
  person: Person;
}

export function BirthdayCard({ person }: BirthdayCardProps) {
  const { colors } = useTheme();
  const { groups } = useGroups();
  const router = useRouter();

  const daysUntil = getDaysUntilBirthday(
    person.birthday_month,
    person.birthday_day
  );
  const dateStr = formatBirthdayDate(
    person.birthday_month,
    person.birthday_day,
    person.birthday_year
  );

  const daysLabel = daysUntil === 0 ? 'Today!' : `${daysUntil}d`;

  return (
    <Pressable
      onPress={() => router.push(`/person/${person.id}`)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Avatar uri={person.photo_url} size={48} />

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {person.name}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {dateStr}
        </Text>
        {person.person_groups && person.person_groups.length > 0 && (
          <View style={styles.groupPills}>
            {person.person_groups.map((pg) => (
              <View
                key={pg.group_id}
                style={[
                  styles.pill,
                  {
                    backgroundColor: (groups.find(g => g.id === pg.group_id)?.color || pg.groups?.color || colors.primary) + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: groups.find(g => g.id === pg.group_id)?.color || pg.groups?.color || colors.primary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {groups.find(g => g.id === pg.group_id)?.name || pg.groups?.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        style={[
          styles.daysBadge,
          {
            backgroundColor:
              daysUntil === 0 ? colors.accent : colors.primary,
          },
        ]}
      >
        <Text style={styles.daysText}>{daysLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 14,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
  date: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  groupPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  daysBadge: {
    minWidth: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  daysText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
});
