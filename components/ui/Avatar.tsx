import React, { useState, useEffect } from 'react';
import { Image, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
}

// TODO: Optimize image loading performance. Currently using standard Image component which can be slow.
// Consider expo-image or better caching strategy in future updates.
export function Avatar({ uri, size = 36, onPress }: AvatarProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  // Reset failed state when URI changes
  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const showImage = !!uri && !failed;

  const content = showImage ? (
    <Image
      source={{ uri: uri! }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
      }}
      resizeMode="cover"
      onError={() => setFailed(true)}
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
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
