import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Group } from '../../hooks/useGroups';

interface GroupCardProps {
  group: Group;
  onShare?: () => void;
}

export function GroupCard({ group, onShare }: GroupCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/group/${group.id}`)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.colorBar,
          { backgroundColor: group.color || colors.primary },
        ]}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {group.name}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {group.member_count ?? 0} member
          {(group.member_count ?? 0) !== 1 ? 's' : ''}
        </Text>
      </View>
      {onShare && (
        <Pressable onPress={onShare} hitSlop={8}>
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
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
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
  count: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
});
