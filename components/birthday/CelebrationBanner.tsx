import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

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
      <Text style={styles.confetti}>🎉</Text>
      <Avatar uri={photoUrl} size={56} />
      <Text style={[styles.name, { color: colors.textPrimary }]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  confetti: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  button: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
});
