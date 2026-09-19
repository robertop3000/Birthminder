import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { APP_STORE_URL } from '../../lib/constants';

interface OpenInAppBannerProps {
  /** Custom-scheme link that opens the same content in the iOS app. */
  deepLink: string;
}

/** True when the page is being viewed in a browser on an iPhone or iPad. */
export function isIosBrowser(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return /iPhone|iPad|iPod/i.test(userAgent);
}

/**
 * Shown on web only, and only on iOS devices, above shared content:
 * offers to open the content in the native app or install it.
 */
export function OpenInAppBanner({ deepLink }: OpenInAppBannerProps) {
  const { colors } = useTheme();

  if (Platform.OS !== 'web') return null;
  const nav = (globalThis as { navigator?: { userAgent?: string } }).navigator;
  if (!isIosBrowser(nav?.userAgent)) return null;

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.bottomBarBorder }]}>
      <View style={styles.row}>
        <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
        <Text style={[styles.text, { color: colors.textPrimary }]}>
          Have the Birthminder app?
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={() => Linking.openURL(deepLink)}
          style={[styles.button, { backgroundColor: colors.primary }]}
          accessibilityRole="link"
        >
          <Text style={styles.buttonText}>Open in app</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(APP_STORE_URL)} accessibilityRole="link">
          <Text style={[styles.link, { color: colors.textSecondary }]}>Get it on the App Store</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  link: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    textDecorationLine: 'underline',
  },
});
