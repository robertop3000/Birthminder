import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { registerWebAlertHandler, AlertRequest, AlertButton } from '../../lib/alert';

const ERROR_RED = '#DC3545';

/**
 * Renders `showAlert()` requests as a themed dialog on web.
 * Mounted once in the root layout; renders nothing on native, where the
 * system `Alert` is used instead.
 */
export function AlertHost() {
  const { colors } = useTheme();
  const [queue, setQueue] = useState<AlertRequest[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    registerWebAlertHandler((request) => {
      setQueue((prev) => [...prev, request]);
    });
    return () => registerWebAlertHandler(null);
  }, []);

  const current = queue[0] ?? null;

  const handlePress = useCallback((button: AlertButton) => {
    setQueue((prev) => prev.slice(1));
    // Run after the dialog closes so a follow-up alert can be queued cleanly.
    setTimeout(() => {
      void button.onPress?.();
    }, 0);
  }, []);

  if (Platform.OS !== 'web' || !current) return null;

  const cancelButton = current.buttons.find((b) => b.style === 'cancel');

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (cancelButton) handlePress(cancelButton);
      }}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.dialog, { backgroundColor: colors.surface }]}
          accessibilityRole="alert"
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{current.title}</Text>
          {current.message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {current.message}
            </Text>
          ) : null}
          <View
            style={[
              styles.actions,
              current.buttons.length > 2 ? styles.actionsStacked : null,
            ]}
          >
            {current.buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              const isPrimary = !isDestructive && !isCancel;
              return (
                <Pressable
                  key={`${button.text}-${index}`}
                  onPress={() => handlePress(button)}
                  accessibilityRole="button"
                  style={[
                    styles.button,
                    current.buttons.length > 2 ? styles.buttonStacked : null,
                    isPrimary && { backgroundColor: colors.primary },
                    isDestructive && { backgroundColor: ERROR_RED },
                    isCancel && {
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.bottomBarBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: isCancel ? colors.textPrimary : '#FFFFFF' },
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    padding: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  actionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 96,
  },
  buttonStacked: {
    minWidth: undefined,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_700Bold',
  },
});
