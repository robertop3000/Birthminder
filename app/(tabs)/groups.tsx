import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { TopBar } from '../../components/ui/TopBar';
import { GroupCard } from '../../components/group/GroupCard';
import { Button } from '../../components/ui/Button';

const GROUP_COLORS = [
  '#E07A5F',
  '#F2C94C',
  '#81B29A',
  '#3D405B',
  '#F4845F',
  '#7EC8E3',
  '#C77DFF',
  '#FF6B6B',
];

export default function GroupsScreen() {
  const { colors } = useTheme();
  const { groups, loading, addGroup, generateShareCode } = useGroups();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await addGroup({ name: newName.trim(), color: selectedColor });
      setShowModal(false);
      setNewName('');
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
      Alert.alert('Share Code', `Share this code: ${code}`);
    } catch (err: unknown) {
      Alert.alert('Error', 'Failed to generate share code');
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

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  borderColor: colors.bottomBarBorder,
                },
              ]}
              placeholder="Group name"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />

            <Text
              style={[styles.colorLabel, { color: colors.textSecondary }]}
            >
              Color
            </Text>
            <View style={styles.colorRow}>
              {GROUP_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c,
                      borderWidth: selectedColor === c ? 3 : 0,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="text"
                onPress={() => {
                  setShowModal(false);
                  setNewName('');
                }}
              />
              <Button
                title="Create"
                onPress={handleCreate}
                loading={creating}
              />
            </View>
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
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
