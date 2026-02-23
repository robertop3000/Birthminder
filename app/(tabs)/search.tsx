import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBirthdays } from '../../hooks/useBirthdays';
import { TopBar } from '../../components/ui/TopBar';
import { FAB } from '../../components/ui/FAB';
import { BirthdayCard } from '../../components/birthday/BirthdayCard';
import { CalendarImportModal } from '../../components/birthday/CalendarImportModal';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { birthdays, loading } = useBirthdays();
  const [query, setQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const results = useMemo(() => {
    const sorted = [...birthdays].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (!query.trim()) return sorted;
    return sorted.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [birthdays, query]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Search" />

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search birthdays..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
        />
      </View>

      <Pressable
        onPress={() => setShowImportModal(true)}
        style={[styles.importButton, { backgroundColor: colors.surface }]}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.importButtonText, { color: colors.primary }]}>
          Import from Calendar
        </Text>
      </Pressable>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BirthdayCard person={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {query.trim()
                ? 'No one found. Add them with the + button!'
                : 'No birthdays added yet.'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <FAB />

      <CalendarImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => setShowImportModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    paddingVertical: 0,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  importButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
  list: {
    paddingBottom: 120,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
});
