import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
}

export function Avatar({ uri, size = 36, onPress }: AvatarProps) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const hasImage = !!uri && !failed;

  const content = (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="person" size={size * 0.55} color={colors.textSecondary} />
      </View>
      {hasImage && (
        <Image
          source={uri}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
