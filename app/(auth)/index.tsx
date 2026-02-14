import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, ONBOARDING_COMPLETE_KEY } from '../../lib/constants';

export default function SplashScreen() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const redirect = async () => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (onboardingDone === 'true') {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }
    };

    const timer = setTimeout(redirect, 800);
    return () => clearTimeout(timer);
  }, [loading, session]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>{APP_NAME}</Text>
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  loader: {
    marginTop: 24,
  },
});
