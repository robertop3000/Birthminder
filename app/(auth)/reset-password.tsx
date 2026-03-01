import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { updatePassword } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { source } = useLocalSearchParams<{ source?: string }>();

  const isRecovery = source === 'recovery';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePassword(newPassword);
      setSuccess(true);
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
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Change Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isRecovery
            ? 'Your identity has been verified. Enter a new password.'
            : 'Enter your new password.'}
        </Text>

        {success ? (
          <View
            style={[styles.successBox, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.successText, { color: colors.textPrimary }]}>
              Password updated successfully!
            </Text>
          </View>
        ) : (
          <>
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
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
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
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Button
              title="Update Password"
              onPress={handleChangePassword}
              loading={loading}
              style={styles.button}
            />
          </>
        )}

        <Pressable
          onPress={() => {
            if (isRecovery) {
              router.replace('/(auth)/login');
            } else {
              router.back();
            }
          }}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            {isRecovery ? 'Back to Login' : 'Back to Settings'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    color: '#DC3545',
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
  },
  successBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  successText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  button: {
    marginBottom: 20,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
  },
});
