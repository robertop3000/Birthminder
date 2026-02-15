import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { APP_VERSION } from '../../lib/constants';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.display_name ?? '');
            setAvatarUrl(data.avatar_url ?? null);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 },
      ]}
    >
      {/* Gear icon */}
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

      <View style={styles.header}>
        <Avatar uri={avatarUrl} size={120} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {displayName || 'User'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email ?? ''}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <ThemeToggle />
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gearButton: {
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginTop: 16,
  },
  email: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
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
    marginTop: 20,
  },
});

