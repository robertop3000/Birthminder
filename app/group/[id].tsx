import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { useBirthdays } from '../../hooks/useBirthdays';
import { Avatar } from '../../components/ui/Avatar';
import {
  getDaysUntilBirthday,
  formatBirthdayDate,
} from '../../lib/dateHelpers';

export default function GroupDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups, deleteGroup, generateShareCode, addPersonToGroup, removePersonFromGroup } = useGroups();
  const { birthdays, refetch: refetchBirthdays } = useBirthdays();
  const [showAddModal, setShowAddModal] = useState(false);

  const group = groups.find((g) => g.id === id);

  const members = useMemo(() => {
    if (!id) return [];
    return birthdays.filter((p) =>
      p.person_groups?.some((pg) => pg.group_id === id)
    );
  }, [birthdays, id]);

  // People NOT in this group (available to add)
  const availablePeople = useMemo(() => {
    if (!id) return [];
    const memberIds = new Set(members.map((m) => m.id));
    return birthdays.filter((p) => !memberIds.has(p.id));
  }, [birthdays, members, id]);

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
      const shareUrl = `birthminder://shared/${code}`;
      await Share.share({
        message: `Check out my "${group.name}" birthdays on Birthminder! ${shareUrl}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share group');
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

  const handleAddPerson = async (personId: string) => {
    try {
      await addPersonToGroup(personId, group.id);
      await refetchBirthdays(); // Refresh birthdays so person_groups updates
    } catch {
      Alert.alert('Error', 'Failed to add person to group');
    }
  };

  const handleRemovePerson = (personId: string, personName: string) => {
    Alert.alert(
      'Remove from Group',
      `Remove ${personName} from "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePersonFromGroup(personId, group.id);
              await refetchBirthdays();
            } catch {
              Alert.alert('Error', 'Failed to remove person');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
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
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Members
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyMembers}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No members yet. Tap "Add" to add people.
              </Text>
            </View>
          ) : (
            members.map((person) => {
              const daysUntil = getDaysUntilBirthday(
                person.birthday_month,
                person.birthday_day
              );
              return (
                <View
                  key={person.id}
                  style={[
                    styles.memberRow,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Pressable
                    style={styles.memberInfo}
                    onPress={() => router.push(`/person/${person.id}`)}
                  >
                    <Avatar uri={person.photo_url} size={40} />
                    <View style={styles.memberText}>
                      <Text
                        style={[
                          styles.memberName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {person.name}
                      </Text>
                      <Text
                        style={[
                          styles.memberDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatBirthdayDate(
                          person.birthday_month,
                          person.birthday_day
                        )}
                      </Text>
                    </View>
                    <Text style={[styles.daysBadge, { color: colors.primary }]}>
                      {daysUntil === 0 ? 'Today!' : `${daysUntil}d`}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemovePerson(person.id, person.name)}
                    hitSlop={8}
                    style={styles.removeButton}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add People Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Add People to {group.name}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {availablePeople.length === 0 ? (
              <View style={styles.emptyModal}>
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  {birthdays.length === 0
                    ? 'No saved birthdays yet. Add some birthdays first!'
                    : 'Everyone is already in this group!'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={availablePeople}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleAddPerson(item.id)}
                    style={({ pressed }) => [
                      styles.personRow,
                      {
                        backgroundColor: colors.surface,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Avatar uri={item.photo_url} size={40} />
                    <View style={styles.personInfo}>
                      <Text
                        style={[
                          styles.personName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.personDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatBirthdayDate(
                          item.birthday_month,
                          item.birthday_day
                        )}
                      </Text>
                    </View>
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={colors.primary}
                    />
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.personList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  emptyMembers: {
    paddingVertical: 32,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberText: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  memberDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  daysBadge: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  removeButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  emptyModal: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  personList: {
    maxHeight: 400,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 4,
    borderRadius: 14,
    gap: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
  personDate: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
});
