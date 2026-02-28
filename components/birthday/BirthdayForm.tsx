import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { useGroups } from '../../hooks/useGroups';
import { Avatar } from '../ui/Avatar';
import { ContactLinkButton } from './ContactLinkButton';

export interface BirthdayFormData {
  name: string;
  birthday_month: number;
  birthday_day: number;
  birthday_year: number | null;
  photo_uri: string | null;
  notes: string;
  group_ids: string[];
  contact_id: string | null;
}

interface BirthdayFormProps {
  initialValues?: Partial<BirthdayFormData>;
  preselectedGroupId?: string;
  onSubmit: (data: BirthdayFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function BirthdayForm({
  initialValues,
  preselectedGroupId,
  onSubmit,
  onCancel,
  loading = false,
}: BirthdayFormProps) {
  const { colors } = useTheme();
  const { groups, addGroup } = useGroups();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [month, setMonth] = useState(initialValues?.birthday_month ?? 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [dayStr, setDayStr] = useState(
    initialValues?.birthday_day ? String(initialValues.birthday_day) : ''
  );
  const [yearStr, setYearStr] = useState(
    initialValues?.birthday_year ? String(initialValues.birthday_year) : ''
  );
  const [photoUri, setPhotoUri] = useState(initialValues?.photo_uri ?? null);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    preselectedGroupId ? [preselectedGroupId] : (initialValues?.group_ids ?? [])
  );
  const [contactId, setContactId] = useState<string | null>(
    initialValues?.contact_id ?? null
  );
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#E07A5F');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const GROUP_COLORS = [
    '#E07A5F', '#3D405B', '#81B29A', '#F2CC8F',
    '#6A8EAE', '#D4A5A5', '#9B72CF', '#4ECDC4',
  ];

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    setCreatingGroup(true);
    try {
      const newGroup = await addGroup({
        name: newGroupName.trim(),
        color: newGroupColor,
      });
      if (newGroup) {
        setSelectedGroups((prev) => [...prev, newGroup.id]);
      }
      setNewGroupName('');
      setNewGroupColor('#E07A5F');
      setShowNewGroup(false);
    } catch {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    const day = dayStr ? parseInt(dayStr, 10) : null;
    if (!day || day < 1 || day > 31) {
      alert('Please enter a valid day (1-31)');
      return;
    }

    onSubmit({
      name: name.trim(),
      birthday_month: month,
      birthday_day: day,
      birthday_year: yearStr ? parseInt(yearStr, 10) : null,
      photo_uri: photoUri,
      notes: notes.trim(),
      group_ids: selectedGroups,
      contact_id: contactId,
    });
  };

  const maxDays = new Date(2000, month, 0).getDate();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.photoSection}>
          <Pressable onPress={pickPhoto}>
            <Avatar uri={photoUri} size={100} />
          </Pressable>
          <View style={styles.photoActions}>
            <Pressable onPress={pickPhoto}>
              <Text style={[styles.photoLabel, { color: colors.primary }]}>
                {photoUri ? 'Change Photo' : 'Add Photo'}
              </Text>
            </Pressable>
            {photoUri && (
              <Pressable onPress={() => setPhotoUri(null)} style={styles.removePhotoButton}>
                <Text style={[styles.photoLabel, { color: '#E07A5F' }]}>
                  Remove
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Name *
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
            value={name}
            onChangeText={setName}
            placeholder="Person's name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Birthday
          </Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                Month
              </Text>
              <Pressable
                onPress={() => setShowMonthPicker(true)}
                style={[
                  styles.input,
                  styles.dropdownButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.bottomBarBorder,
                  },
                ]}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                  {MONTHS[month - 1]}
                </Text>
                <Text style={{ color: colors.textSecondary }}>▼</Text>
              </Pressable>
            </View>

            <Modal
              visible={showMonthPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowMonthPicker(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowMonthPicker(false)}
              >
                <View
                  style={[
                    styles.monthPickerModal,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Select Month
                  </Text>
                  <ScrollView style={styles.monthList}>
                    {MONTHS.map((m, i) => (
                      <Pressable
                        key={m}
                        onPress={() => {
                          setMonth(i + 1);
                          setShowMonthPicker(false);
                        }}
                        style={[
                          styles.monthOption,
                          {
                            backgroundColor:
                              month === i + 1
                                ? colors.primary + '20'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthOptionText,
                            {
                              color:
                                month === i + 1
                                  ? colors.primary
                                  : colors.textPrimary,
                              fontWeight: month === i + 1 ? '600' : '400',
                            },
                          ]}
                        >
                          {m}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </Modal>

            <View style={styles.smallFields}>
              <View style={styles.smallField}>
                <Text
                  style={[styles.dateLabel, { color: colors.textSecondary }]}
                >
                  Day
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.smallInput,
                    {
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                      borderColor: colors.bottomBarBorder,
                    },
                  ]}
                  value={dayStr}
                  onChangeText={setDayStr}
                  placeholder="DD"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.smallField}>
                <Text
                  style={[styles.dateLabel, { color: colors.textSecondary }]}
                >
                  Year (opt)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.smallInput,
                    {
                      backgroundColor: colors.surface,
                      color: colors.textPrimary,
                      borderColor: colors.bottomBarBorder,
                    },
                  ]}
                  value={yearStr}
                  onChangeText={setYearStr}
                  placeholder="YYYY"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Groups
          </Text>
          <View style={styles.groupChips}>
            {groups.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => toggleGroup(g.id)}
                style={[
                  styles.groupChip,
                  {
                    backgroundColor: selectedGroups.includes(g.id)
                      ? (g.color || colors.primary) + '30'
                      : colors.surface,
                    borderColor: selectedGroups.includes(g.id)
                      ? g.color || colors.primary
                      : colors.bottomBarBorder,
                  },
                ]}
              >
                <View style={styles.chipContent}>
                  <View
                    style={[
                      styles.colorDotSmall,
                      { backgroundColor: g.color || colors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.groupChipText,
                      {
                        color: selectedGroups.includes(g.id)
                          ? g.color || colors.primary
                          : colors.textPrimary,
                      },
                    ]}
                  >
                    {g.name}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowNewGroup(true)}
              style={[
                styles.groupChip,
                styles.newGroupChip,
                { borderColor: colors.primary, borderStyle: 'dashed' },
              ]}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[styles.groupChipText, { color: colors.primary }]}>
                New Group
              </Text>
            </Pressable>
          </View>

          {/* Inline Create Group Modal */}
          <Modal
            visible={showNewGroup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNewGroup(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowNewGroup(false)}
            >
              <Pressable
                style={[styles.newGroupModal, { backgroundColor: colors.surface }]}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Create New Group
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor: colors.bottomBarBorder,
                      marginBottom: 14,
                    },
                  ]}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="Group name (e.g. Church, Work)"
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
                <Text style={[styles.dateLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Color
                </Text>
                <View style={styles.colorRow}>
                  {GROUP_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setNewGroupColor(c)}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor: c,
                          borderWidth: newGroupColor === c ? 3 : 0,
                          borderColor: colors.textPrimary,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.newGroupActions}>
                  <Pressable onPress={() => setShowNewGroup(false)}>
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateGroup}
                    disabled={creatingGroup || !newGroupName.trim()}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: colors.primary,
                        opacity: creatingGroup || !newGroupName.trim() ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text style={styles.saveText}>
                      {creatingGroup ? 'Creating...' : 'Create'}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Linked Contact
          </Text>
          <ContactLinkButton
            contactId={contactId}
            onContactLinked={(id) => setContactId(id)}
            onContactUnlinked={() => setContactId(null)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Notes
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.bottomBarBorder,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Gift ideas, memories..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onCancel}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={loading || !name.trim()}
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: loading || !name.trim() ? 0.5 : 1,
              },
            ]}
          >
            <Text style={styles.saveText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  photoLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  removePhotoButton: {
    // Optional: add border/background if needed, but text link is fine
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
  },
  dateRow: {
    gap: 12,
  },
  dateField: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 6,
  },
  monthScroll: {
    flexGrow: 0,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerModal: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  monthList: {
    maxHeight: 400,
  },
  monthOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  monthOptionText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 6,
  },
  monthChipText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },

  smallFields: {
    flexDirection: 'row',
    gap: 12,
  },
  smallField: {
    flex: 1,
  },
  smallInput: {
    textAlign: 'center',
  },
  groupChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  groupChipText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  newGroupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  newGroupModal: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  newGroupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  saveButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
});
