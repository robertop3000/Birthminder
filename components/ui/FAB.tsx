import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

interface FABProps {
  visible?: boolean;
}

export function FAB({ visible = true }: FABProps) {
  const { colors } = useTheme();
  const router = useRouter();

  if (!visible) return null;

  return (
    <Pressable
      onPress={() => router.push('/modal')}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 100,
  },
});
