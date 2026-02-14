import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { useBirthdays, Person } from '../../hooks/useBirthdays';
import { MemberList } from '../../components/group/MemberList';

export default function GroupDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups, deleteGroup, generateShareCode } = useGroups();
  const { birthdays } = useBirthdays();

  const group = groups.find((g) => g.id === id);

  const members = useMemo(() => {
    if (!id) return [];
    return birthdays.filter((p) =>
      p.person_groups?.some((pg) => pg.group_id === id)
    );
  }, [birthdays, id]);

  if (!group) {
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

  const handleShare = async () => {
    try {
      const code = group.share_code || (await generateShareCode(group.id));
      Alert.alert('Share Code', `Share this code with friends:\n\n${code}`);
    } catch {
      Alert.alert('Error', 'Failed to generate share code');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? Members will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGroup(group.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={22}
              color={colors.primary}
            />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Ionicons
              name="trash-outline"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.colorBanner}>
        <View
          style={[
            styles.colorStrip,
            { backgroundColor: group.color || colors.primary },
          ]}
        />
        <Text style={[styles.groupName, { color: colors.textPrimary }]}>
          {group.name}
        </Text>
        <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: colors.textSecondary }]}
        >
          Members
        </Text>
        <MemberList members={members} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 18,
  },
  colorBanner: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  colorStrip: {
    width: 48,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  memberCount: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginBottom: 10,
  },
});
