import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Appearance, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { BirthdaysProvider } from '../contexts/BirthdaysContext';
import { GroupsProvider } from '../contexts/GroupsContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AlertHost } from '../components/ui/AlertHost';
import { useTheme } from '../hooks/useTheme';
import { useBirthdays } from '../hooks/useBirthdays';
import { useGroups } from '../hooks/useGroups';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';

const IS_WEB = Platform.OS === 'web';

/** Width of the app column on large web viewports (phones and PWAs stay full-width). */
const WEB_MAX_WIDTH = 600;

SplashScreen.preventAutoHideAsync().catch(() => { });

if (!IS_WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontsError) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontsError]);

  useEffect(() => {
    if (IS_WEB) return; // Web asks for push permission explicitly from Settings.

    async function setupNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'undetermined') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          if (__DEV__) console.warn('[Notifications] Permission denied during bootstrap');
        }
      } else if (status === 'denied') {
        if (__DEV__) console.warn('[Notifications] Permission is denied. Notifications will not be received.');
      }
    }
    setupNotifications();
  }, []);

  if (!fontsLoaded && !fontsError) {
    const isDark = Appearance.getColorScheme() === 'dark';
    return (
      <View style={[styles.loading, { backgroundColor: isDark ? '#0E0620' : '#FFF8FE' }]}>
        <ActivityIndicator size="large" color="#7145B5" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BirthdaysProvider>
          <GroupsProvider>
            <NotificationMigration />
            <RootNavigator />
            <AlertHost />
          </GroupsProvider>
        </BirthdaysProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const MIGRATION_KEY = 'v1.8_group_reminders_migrated';

function NotificationMigration() {
  const { birthdays } = useBirthdays();
  const { groups } = useGroups();
  const { scheduleAllNotifications, permissionStatus } = useNotifications();
  const migrated = useRef(false);

  useEffect(() => {
    if (IS_WEB) return; // No local scheduling on web.
    if (migrated.current) return;
    if (permissionStatus === null || birthdays.length === 0) return;

    (async () => {
      const already = await AsyncStorage.getItem(MIGRATION_KEY);
      if (already) {
        migrated.current = true;
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleAllNotifications(birthdays, groups);
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      migrated.current = true;
    })();
  }, [permissionStatus, birthdays, groups, scheduleAllNotifications]);

  return null;
}

function RecoveryDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    async function handleRecoveryUrl(url: string) {
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return;

      const hash = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      const isRecovery = type === 'recovery';
      const isConfirmation =
        type === 'signup' || type === 'magiclink' || type === 'email_change' || type === 'invite';

      if ((isRecovery || isConfirmation) && accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          const destination = isRecovery ? '/reset-password?source=recovery' : '/';
          if (IS_WEB) {
            // Drop the tokens from the address bar / browser history.
            const hist = (globalThis as { history?: { replaceState: (a: unknown, b: string, c: string) => void } }).history;
            hist?.replaceState(null, '', destination);
          }
          router.replace(isRecovery ? '/(auth)/reset-password?source=recovery' : '/(tabs)');
        } catch (err) {
          if (__DEV__) console.warn('Auth deep link error:', err);
        }
      }
    }

    // Handle URL when app is opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleRecoveryUrl(url);
    });

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleRecoveryUrl(url);
    });

    return () => subscription.remove();
  }, [router]);

  return null;
}

function RootNavigator() {
  const { mode, colors } = useTheme();

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="person/[id]" />
      <Stack.Screen name="group/[id]" />
      <Stack.Screen name="shared/[code]" />
      <Stack.Screen name="shared/person/[code]" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="settings" />
    </Stack>
  );

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RecoveryDeepLinkHandler />
      {IS_WEB ? (
        <View style={[styles.webFrame, { backgroundColor: colors.surface }]}>
          <View style={[styles.webColumn, { backgroundColor: colors.background }]}>
            {stack}
          </View>
        </View>
      ) : (
        stack
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFrame: {
    flex: 1,
    alignItems: 'center',
  },
  webColumn: {
    flex: 1,
    width: '100%',
    maxWidth: WEB_MAX_WIDTH,
  },
});
