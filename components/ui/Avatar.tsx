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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setRetryCount(0);
  }, [uri]);

  const hasImage = !!uri;

  const handleError = () => {
    if (retryCount < 2) {
      setTimeout(() => setRetryCount((c) => c + 1), 2000);
    }
  };

  const content = (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }]}>
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="person" size={size * 0.55} color={colors.textSecondary} />
      </View>
      {hasImage && (
        <Image
          key={`${uri}-${retryCount}`}
          source={uri}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          onError={handleError}
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
