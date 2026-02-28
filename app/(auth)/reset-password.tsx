import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { updatePassword, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const isRecovery = source === 'recovery';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid =
    password.trim().length >= 6 && password === confirmPassword;

  const handleSubmit = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePassword(password);
      if (isRecovery) {
        await signOut();
      }
      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (isRecovery) {
                router.replace('/(auth)/login');
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          New Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your new password below.
        </Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            New Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.bottomBarBorder,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                borderColor: colors.bottomBarBorder,
              },
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
        </View>

        <Button
          title="Update Password"
          onPress={handleSubmit}
          loading={loading}
          disabled={!isValid}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    borderWidth: 1,
  },
  errorText: {
    color: '#E07A5F',
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
  },
  button: {
    marginTop: 8,
    marginBottom: 20,
  },
});
