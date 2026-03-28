import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { APP_VERSION } from '../../lib/constants';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const [displayName, setDisplayName] = useState('');

  // Mascot = ~1/4 of the screen height + 10% increase, proportional width
  const mascotHeight = (screenHeight / 4) * 1.2;
  const mascotWidth = mascotHeight * (600 / 542);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.display_name ?? '');
          }
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (err: unknown) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Gear icon pinned to top */}
      <View style={styles.topBar}>
        <View style={{ width: 32 }} />
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={8}
          style={styles.gearButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Body: mascot top, sections bottom, space distributed evenly */}
      <View style={styles.body}>
        <View style={styles.header}>
          <View
            style={{
              width: mascotHeight,
              height: mascotHeight,
              borderRadius: mascotHeight / 2,
              borderWidth: 3,
              borderColor: '#512D85',
              backgroundColor: '#FAF8F5',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('../../assets/profile-mascot.png')}
              style={{ width: mascotWidth * 1.22, height: mascotHeight * 1.22 }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {displayName || 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email ?? ''}
          </Text>
        </View>

        <View style={styles.sections}>
          <View style={styles.section}>
            <Button
              title="Sign Out"
              variant="secondary"
              onPress={handleSignOut}
              textStyle={{ color: colors.primary }}
            />
          </View>

          <Text style={[styles.version, { color: colors.textSecondary }]}>
            v{APP_VERSION}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gearButton: {
    padding: 4,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 3,
  },
  sections: {
    paddingBottom: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginTop: 16,
  },
});
