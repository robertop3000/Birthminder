import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from './Avatar';

interface TopBarProps {
  title?: string;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  rightAction?: React.ReactNode;
}

export function TopBar({
  title,
  showAvatar = true,
  avatarUrl,
  rightAction,
}: TopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.bottomBarBorder,
        },
      ]}
    >
      <View style={styles.left}>
        {showAvatar && (
          <Avatar
            uri={avatarUrl}
            size={32}
            onPress={() => router.push('/(tabs)/profile')}
          />
        )}
      </View>

      <View style={styles.center}>
        {title && (
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
      </View>

      <View style={styles.right}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
});
