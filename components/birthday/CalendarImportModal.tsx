import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  useCalendarImport,
  CalendarBirthdayItem,
  CalendarGroup,
} from '../../hooks/useCalendarImport';

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type ListRow =
  | { type: 'header'; group: CalendarGroup; expanded: boolean }
  | { type: 'event'; item: CalendarBirthdayItem };

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
    calendarGroups,
    error,
    fetchCalendarBirthdays,
    importSelected,
    reset,
  } = useCalendarImport();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedCalendars, setExpandedCalendars] = useState<Set<string>>(new Set());

  // Flat list of all items across groups
  const allItems = useMemo(
    () => calendarGroups.flatMap((g) => g.items),
    [calendarGroups]
  );

  // Fetch when modal opens
  useEffect(() => {
    if (visible) {
      fetchCalendarBirthdays();
    } else {
      reset();
      setSelectedIds(new Set());
      setExpandedCalendars(new Set());
    }
  }, [visible]);

  // Pre-select non-duplicates + auto-expand first calendar with items
  useEffect(() => {
    const nonDuplicateIds = new Set(
      allItems.filter((item) => !item.isDuplicate).map((item) => item.uid)
    );
    setSelectedIds(nonDuplicateIds);

    // Auto-expand the first group (usually Birthdays)
    if (calendarGroups.length > 0) {
      setExpandedCalendars(new Set([calendarGroups[0].calendarId]));
    }
  }, [calendarGroups, allItems]);

  const duplicateCount = useMemo(
    () => allItems.filter((item) => item.isDuplicate).length,
    [allItems]
  );

  const allSelected = useMemo(
    () => allItems.length > 0 && selectedIds.size === allItems.length,
    [selectedIds.size, allItems.length]
  );

  const toggleItem = useCallback((uid: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === allItems.length && allItems.length > 0) {
        return new Set<string>();
      }
      return new Set(allItems.map((item) => item.uid));
    });
  }, [allItems]);

  const toggleCalendarExpanded = useCallback((calendarId: string) => {
    setExpandedCalendars((prev) => {
      const next = new Set(prev);
      if (next.has(calendarId)) {
        next.delete(calendarId);
      } else {
        next.add(calendarId);
      }
      return next;
    });
  }, []);

  const toggleGroup = useCallback((group: CalendarGroup) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const groupUids = group.items.map((i) => i.uid);
      const allInGroupSelected = groupUids.every((uid) => next.has(uid));
      if (allInGroupSelected) {
        groupUids.forEach((uid) => next.delete(uid));
      } else {
        groupUids.forEach((uid) => next.add(uid));
      }
      return next;
    });
  }, []);

  const handleImport = async () => {
    const selected = allItems.filter((item) => selectedIds.has(item.uid));
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

  // Build flat list data with headers and (conditionally) items
  const listData = useMemo((): ListRow[] => {
    const rows: ListRow[] = [];
    for (const group of calendarGroups) {
      const expanded = expandedCalendars.has(group.calendarId);
      rows.push({ type: 'header', group, expanded });
      if (expanded) {
        for (const item of group.items) {
          rows.push({ type: 'event', item });
        }
      }
    }
    return rows;
  }, [calendarGroups, expandedCalendars]);

  const renderRow = ({ item: row }: { item: ListRow }) => {
    if (row.type === 'header') {
      const { group, expanded } = row;
      const selectedInGroup = group.items.filter((i) => selectedIds.has(i.uid)).length;
      const allInGroupSelected = group.items.length > 0 && group.items.every((i) => selectedIds.has(i.uid));
      return (
        <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => toggleCalendarExpanded(group.calendarId)}
            style={styles.sectionHeaderMain}
          >
            <Ionicons
              name={expanded ? 'chevron-down' : 'chevron-forward'}
              size={18}
              color={colors.textSecondary}
            />
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {group.calendarName}
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                {group.items.length} event{group.items.length !== 1 ? 's' : ''}
                {selectedInGroup > 0 ? ` · ${selectedInGroup} selected` : ''}
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => toggleGroup(group)} hitSlop={8}>
            <Text style={[styles.groupSelectAll, { color: colors.primary }]}>
              {allInGroupSelected ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>
        </View>
      );
    }

    const { item } = row;
    const isSelected = selectedIds.has(item.uid);
    const dateStr = `${MONTH_NAMES[item.birthday_month]} ${item.birthday_day}${item.birthday_year ? `, ${item.birthday_year}` : ''}`;

    return (
      <Pressable
        onPress={() => toggleItem(item.uid)}
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
                Reading calendars...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {error}
              </Text>
            </View>
          ) : allItems.length === 0 ? (
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No events found in your calendars.
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Add birthdays to your contacts or calendar, and they will appear here.
              </Text>
            </View>
          ) : (
            <>
              {/* Summary + Select All */}
              <View style={[styles.summaryRow, { borderBottomColor: colors.bottomBarBorder }]}>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {allItems.length} event{allItems.length !== 1 ? 's' : ''} in {calendarGroups.length} calendar{calendarGroups.length !== 1 ? 's' : ''}
                  {duplicateCount > 0 ? ` · ${duplicateCount} already added` : ''}
                </Text>
                <Pressable onPress={toggleAll}>
                  <Text style={[styles.selectAllText, { color: colors.primary }]}>
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Text>
                </Pressable>
              </View>

              {/* List */}
              <FlatList
                data={listData}
                keyExtractor={(row, index) =>
                  row.type === 'header'
                    ? `header-${row.group.calendarId}`
                    : `event-${row.item.uid}-${index}`
                }
                renderItem={renderRow}
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
    flex: 1,
    marginRight: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  list: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sectionHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  sectionInfo: {
    flex: 1,
  },
  groupSelectAll: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingLeft: 48,
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
