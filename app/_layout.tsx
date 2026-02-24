import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { BirthdaysProvider } from '../contexts/BirthdaysContext';
import { GroupsProvider } from '../contexts/GroupsContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useTheme } from '../hooks/useTheme';
import { useBirthdays } from '../hooks/useBirthdays';
import { useNotifications } from '../hooks/useNotifications';

SplashScreen.preventAutoHideAsync().catch(() => { });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    async function setupNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'undetermined') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.warn('[Notifications] Permission denied during bootstrap');
        }
      } else if (status === 'denied') {
        console.warn('[Notifications] Permission is denied. Notifications will not be received.');
      }
    }
    setupNotifications();
  }, []);

  if (!fontsLoaded && !fontsError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#E07A5F" />
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
          </GroupsProvider>
        </BirthdaysProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const MIGRATION_KEY = 'v1.4.1_migrated';

function NotificationMigration() {
  const { birthdays } = useBirthdays();
  const { scheduleAllNotifications, permissionStatus } = useNotifications();
  const migrated = useRef(false);

  useEffect(() => {
    if (migrated.current) return;
    if (permissionStatus === null || birthdays.length === 0) return;

    (async () => {
      const already = await AsyncStorage.getItem(MIGRATION_KEY);
      if (already) {
        migrated.current = true;
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleAllNotifications(birthdays);
      await AsyncStorage.setItem(MIGRATION_KEY, 'true');
      migrated.current = true;
    })();
  }, [permissionStatus, birthdays, scheduleAllNotifications]);

  return null;
}

function RootNavigator() {
  const { mode } = useTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="person/[id]" />
        <Stack.Screen name="group/[id]" />
        <Stack.Screen name="shared/[code]" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF8F5',
  },
});
