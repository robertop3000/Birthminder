import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCalendarImport, CalendarBirthdayItem } from '../../hooks/useCalendarImport';

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface CalendarImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export function CalendarImportModal({
  visible,
  onClose,
  onImportComplete,
}: CalendarImportModalProps) {
  const { colors } = useTheme();
  const {
    loading,
    importing,
    calendarBirthdays,
    error,
    fetchCalendarBirthdays,
    importSelected,
    reset,
  } = useCalendarImport();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch calendar birthdays when modal opens
  useEffect(() => {
    if (visible) {
      fetchCalendarBirthdays();
    } else {
      reset();
      setSelectedIds(new Set());
    }
  }, [visible]);

  // Pre-select non-duplicate items when list loads
  useEffect(() => {
    const nonDuplicateIds = new Set(
      calendarBirthdays
        .filter((item) => !item.isDuplicate)
        .map((item) => item.eventId)
    );
    setSelectedIds(nonDuplicateIds);
  }, [calendarBirthdays]);

  const duplicateCount = useMemo(
    () => calendarBirthdays.filter((item) => item.isDuplicate).length,
    [calendarBirthdays]
  );

  const toggleItem = (eventId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === calendarBirthdays.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(calendarBirthdays.map((item) => item.eventId)));
    }
  };

  const handleImport = async () => {
    const selected = calendarBirthdays.filter((item) =>
      selectedIds.has(item.eventId)
    );
    if (selected.length === 0) return;

    try {
      const count = await importSelected(selected);
      Alert.alert(
        'Import Complete',
        `${count} birthday${count > 1 ? 's' : ''} imported successfully.`,
        [{ text: 'OK', onPress: () => onImportComplete(count) }]
      );
    } catch {
      Alert.alert('Import Failed', 'Something went wrong. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: CalendarBirthdayItem }) => {
    const isSelected = selectedIds.has(item.eventId);
    const dateStr = `${MONTH_NAMES[item.birthday_month]} ${item.birthday_day}${item.birthday_year ? `, ${item.birthday_year}` : ''}`;

    return (
      <Pressable
        onPress={() => toggleItem(item.eventId)}
        style={[
          styles.row,
          { backgroundColor: isSelected ? colors.primary + '10' : 'transparent' },
        ]}
      >
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={22}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, { color: colors.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[styles.rowDate, { color: colors.textSecondary }]}>
            {dateStr}
          </Text>
        </View>
        {item.isDuplicate && (
          <Text style={[styles.duplicateBadge, { color: colors.textSecondary }]}>
            Already added
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.bottomBarBorder }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Import from Calendar
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Reading calendar...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {error}
              </Text>
            </View>
          ) : calendarBirthdays.length === 0 ? (
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No birthdays found in your calendar.
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Add birthdays to your contacts in the Contacts app, and they will appear here.
              </Text>
            </View>
          ) : (
            <>
              {/* Summary + Select All */}
              <View style={[styles.summaryRow, { borderBottomColor: colors.bottomBarBorder }]}>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  Found {calendarBirthdays.length} birthday{calendarBirthdays.length > 1 ? 's' : ''}
                  {duplicateCount > 0
                    ? ` (${duplicateCount} already added)`
                    : ''}
                </Text>
                <Pressable onPress={toggleAll}>
                  <Text style={[styles.selectAllText, { color: colors.primary }]}>
                    {selectedIds.size === calendarBirthdays.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Text>
                </Pressable>
              </View>

              {/* List */}
              <FlatList
                data={calendarBirthdays}
                keyExtractor={(item) => item.eventId}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />

              {/* Import Button */}
              <View style={[styles.footer, { borderTopColor: colors.bottomBarBorder }]}>
                <Pressable
                  onPress={handleImport}
                  disabled={selectedIds.size === 0 || importing}
                  style={[
                    styles.importButton,
                    {
                      backgroundColor:
                        selectedIds.size === 0 || importing
                          ? colors.textSecondary
                          : colors.primary,
                    },
                  ]}
                >
                  {importing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.importButtonText}>
                      Import Selected ({selectedIds.size})
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  closeButton: {
    padding: 4,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  list: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  duplicateBadge: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  importButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
});
