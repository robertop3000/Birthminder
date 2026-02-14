import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Ionicons
        name="sunny"
        size={22}
        color={mode === 'light' ? colors.accent : colors.textSecondary}
      />
      <Pressable
        onPress={toggleTheme}
        style={[
          styles.track,
          {
            backgroundColor:
              mode === 'dark' ? colors.primary : colors.bottomBarBorder,
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: mode === 'dark' ? 22 : 0 }],
            },
          ]}
        />
      </Pressable>
      <Ionicons
        name="moon"
        size={20}
        color={mode === 'dark' ? colors.accent : colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: 'center',
  },
  track: {
    width: 48,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
});
