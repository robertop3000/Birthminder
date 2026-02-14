import React from 'react';
import { Image, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
}

export function Avatar({ uri, size = 36, onPress }: AvatarProps) {
  const { colors } = useTheme();

  const content = uri ? (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  ) : (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Ionicons
        name="person"
        size={size * 0.55}
        color={colors.textSecondary}
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.container}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
