import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mascotGif = require('../../assets/mascot-jumping.gif');

interface CelebrationBannerProps {
  name: string;
  photoUrl?: string | null;
  onSendWish?: () => void;
}

export function CelebrationBanner({
  name,
  photoUrl,
  onSendWish,
}: CelebrationBannerProps) {
  const { colors } = useTheme();
  // Changing key forces Image remount → GIF replays from frame 1
  const [animKey, setAnimKey] = useState(0);

  // Replay animation every time tab gains focus
  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, [])
  );

  // Tap mascot → replay animation
  const handleMascotPress = () => {
    setAnimKey((k) => k + 1);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
      ]}
    >
      {/* Left: animated mascot — tap to replay */}
      <Pressable onPress={handleMascotPress} style={styles.mascotContainer}>
        <ExpoImage
          key={animKey}
          source={mascotGif}
          style={styles.mascot}
          contentFit="contain"
          autoplay
        />
      </Pressable>

      {/* Right: person info */}
      <View style={styles.infoContainer}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.partyEmojiLeft}>🎉</Text>
          <Avatar uri={photoUrl} size={52} />
          <Text style={styles.partyEmojiRight}>🎉</Text>
        </View>
        <Text
          style={[styles.name, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          Happy Birthday, {name}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Today is their special day
        </Text>
        {onSendWish && (
          <Button
            title="Send Wish"
            onPress={onSendWish}
            variant="primary"
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 2,
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotContainer: {
    width: 172,
    height: 172,
    marginRight: 10,
  },
  mascot: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partyEmojiLeft: {
    fontSize: 20,
  },
  partyEmojiRight: {
    fontSize: 20,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 3,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
});
