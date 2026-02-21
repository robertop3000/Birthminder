import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { TopBar } from '../../components/ui/TopBar';
import { GroupCard } from '../../components/group/GroupCard';
import { GroupForm } from '../../components/group/GroupForm';
import { uploadImage } from '../../lib/uploadImage';
import { SHARE_BASE_URL } from '../../lib/constants';

export default function GroupsScreen() {
  const { colors } = useTheme();
  const { groups, loading, addGroup, generateShareCode } = useGroups();
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (name: string, color: string, photoUri: string | null) => {
    setCreating(true);
    try {
      let photoUrl: string | null = null;
      if (photoUri && !photoUri.startsWith('http')) {
        photoUrl = await uploadImage(photoUri, 'groups');
      }
      await addGroup({ name, color, photo_url: photoUrl });
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create group';
      Alert.alert('Error', msg);
    } finally {
      setCreating(false);
    }
  };

  const handleShare = async (groupId: string) => {
    try {
      const code = await generateShareCode(groupId);
      const shareUrl = `${SHARE_BASE_URL}?code=${code}`;
      await Share.share({
        message: `Check out my group birthdays on Birthminder! ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Error', 'Failed to share group');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Groups"
        rightAction={
          <Pressable onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </Pressable>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No groups yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create your first group!
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard group={item} onShare={() => handleShare(item.id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              New Group
            </Text>
            <GroupForm
              onSubmit={handleCreate}
              onCancel={() => setShowModal(false)}
              loading={creating}
            />
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
  list: {
    paddingBottom: 120,
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
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
