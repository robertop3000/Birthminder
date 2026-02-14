import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

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

interface GroupFormProps {
  initialName?: string;
  initialColor?: string | null;
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function GroupForm({
  initialName = '',
  initialColor,
  onSubmit,
  onCancel,
  loading = false,
}: GroupFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || GROUP_COLORS[0]);

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Group Name
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
          placeholder="Group name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Color
      </Text>
      <View style={styles.colorRow}>
        {GROUP_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorCircle,
              {
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: colors.textPrimary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onCancel}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={() => name.trim() && onSubmit(name.trim(), color)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
