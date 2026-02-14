import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BirthdayCard } from '../birthday/BirthdayCard';
import { Person } from '../../hooks/useBirthdays';

interface MemberListProps {
  members: Person[];
}

export function MemberList({ members }: MemberListProps) {
  const { colors } = useTheme();

  if (members.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No members in this group yet.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {members.map((person) => (
        <BirthdayCard key={person.id} person={person} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
  },
});
