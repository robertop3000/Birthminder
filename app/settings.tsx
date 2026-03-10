import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { APP_VERSION } from '../lib/constants';

export default function SettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSendTestNotification = async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Birthminder Test 🧪',
                    body: 'This is a test notification! It will appear in 5 seconds.',
                    sound: 'default',
                    data: { type: 'test' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 5,
                },
            });
            Alert.alert('Test Scheduled', 'A test notification will appear in 5 seconds.');
        } catch (err) {
            Alert.alert('Error', 'Failed to schedule test notification');
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            // 1. Cancel all scheduled notifications
            await Notifications.cancelAllScheduledNotificationsAsync();

            // 2. Clean up storage photos (best-effort, don't block deletion)
            try {
                const storagePaths: string[] = [];

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();
                if (profile?.avatar_url) {
                    const avatarPath = extractStoragePath(profile.avatar_url);
                    if (avatarPath) storagePaths.push(avatarPath);
                }

                const { data: people } = await supabase
                    .from('people')
                    .select('photo_url')
                    .eq('user_id', user.id);
                if (people) {
                    for (const p of people) {
                        const path = extractStoragePath(p.photo_url);
                        if (path) storagePaths.push(path);
                    }
                }

                const { data: groups } = await supabase
                    .from('groups')
                    .select('photo_url')
                    .eq('user_id', user.id);
                if (groups) {
                    for (const g of groups) {
                        const path = extractStoragePath(g.photo_url);
                        if (path) storagePaths.push(path);
                    }
                }

                if (storagePaths.length > 0) {
                    await supabase.storage.from('avatars').remove(storagePaths);
                }
            } catch {
                // Storage cleanup failure should not block account deletion
            }

            // 3. Get session + access token
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;
            if (!accessToken) {
                throw new Error('No active session. Please sign in and try again.');
            }

            // 4. Call Edge Function to delete auth user (CASCADE deletes all data)
            const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
            const response = await fetch(
                `${supabaseUrl}/functions/v1/delete-user`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.error || 'Failed to delete auth account');
            }

            // 5. Sign out (wrapped separately — auth user is already deleted server-side)
            try {
                await signOut();
            } catch {
                // Sign out may fail since auth user is already deleted; that's fine
            }

            // 6. Navigate to login and show success alert
            setShowDeleteConfirm(false);
            router.replace('/(auth)/login');

            setTimeout(() => {
                Alert.alert(
                    'Account Deleted',
                    'Your account and all data have been permanently deleted.'
                );
            }, 500);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setDeleting(false);
        }
    };

    /** Extract the storage path from a Supabase public URL (the part after /avatars/) */
    const extractStoragePath = (url: string | null | undefined): string | null => {
        if (!url) return null;
        const marker = '/avatars/';
        const idx = url.indexOf(marker);
        if (idx === -1) return null;
        const path = url.substring(idx + marker.length);
        return path || null;
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, paddingTop: insets.top },
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Settings
                </Text>
                <Pressable
                    onPress={handleSendTestNotification}
                    hitSlop={12}
                    style={styles.bellButton}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={20}
                        color={colors.background} // Invisible/Hidden by matching background
                    />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 40 },
                ]}
            >
                {/* Legal Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    Legal
                </Text>
                <Pressable
                    onPress={() => router.push('/legal')}
                    style={[styles.settingsRow, { backgroundColor: colors.surface }]}
                >
                    <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={colors.textSecondary}
                    />
                    <Text style={[styles.settingsRowText, { color: colors.textPrimary }]}>
                        Privacy Policy & Terms of Service
                    </Text>
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                    />
                </Pressable>

                {/* Account Section */}
                <Text
                    style={[
                        styles.sectionLabel,
                        { color: colors.textSecondary, marginTop: 32 },
                    ]}
                >
                    Account
                </Text>
                <Pressable
                    onPress={() => router.push('/(auth)/reset-password')}
                    style={[
                        styles.settingsRow,
                        {
                            backgroundColor: colors.primary + '10',
                            borderWidth: 1,
                            borderColor: colors.primary + '30',
                        },
                    ]}
                >
                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                    <Text style={[styles.settingsRowText, { color: colors.primary }]}>
                        Change Password
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </Pressable>

                {/* Danger Zone */}
                <Text
                    style={[
                        styles.sectionLabel,
                        { color: colors.textSecondary, marginTop: 32 },
                    ]}
                >
                    Danger Zone
                </Text>
                <Pressable
                    onPress={() => setShowDeleteConfirm(true)}
                    style={[
                        styles.settingsRow,
                        {
                            backgroundColor: '#DC354510',
                            borderWidth: 1,
                            borderColor: '#DC354530',
                        },
                    ]}
                >
                    <Ionicons name="trash-outline" size={20} color="#DC3545" />
                    <Text style={[styles.settingsRowText, { color: '#DC3545' }]}>
                        Delete Account
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#DC3545" />
                </Pressable>
                <Text style={[styles.dangerHint, { color: colors.textSecondary }]}>
                    This will permanently delete your account and all associated data.
                </Text>

                {/* Version */}
                <Text style={[styles.version, { color: colors.textSecondary }]}>
                    v{APP_VERSION}
                </Text>
            </ScrollView>

            {/* Delete Account Confirmation Modal */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => !deleting && setShowDeleteConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[styles.modalContent, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons
                            name="warning"
                            size={48}
                            color="#DC3545"
                            style={styles.warningIcon}
                        />
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            Delete Account?
                        </Text>
                        <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
                            This action cannot be undone. All your data will be permanently
                            deleted, including:
                        </Text>
                        <View style={styles.deleteList}>
                            <Text style={[styles.deleteItem, { color: colors.textSecondary }]}>
                                • All saved birthdays and photos
                            </Text>
                            <Text style={[styles.deleteItem, { color: colors.textSecondary }]}>
                                • All groups and memberships
                            </Text>
                            <Text style={[styles.deleteItem, { color: colors.textSecondary }]}>
                                • Your profile information
                            </Text>
                            <Text style={[styles.deleteItem, { color: colors.textSecondary }]}>
                                • Notification settings
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <Pressable
                                onPress={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                style={[
                                    styles.modalButton,
                                    { backgroundColor: colors.background },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.modalButtonText,
                                        { color: colors.textPrimary },
                                    ]}
                                >
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDeleteAccount}
                                disabled={deleting}
                                style={[
                                    styles.modalButton,
                                    styles.deleteButton,
                                    { opacity: deleting ? 0.6 : 1 },
                                ]}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                                        Delete Forever
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'DMSans_700Bold',
    },
    bellButton: {
        padding: 6,
        width: 32,
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 20,
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 8,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 12,
        marginBottom: 4,
    },
    settingsRowText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
    },
    dangerHint: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        marginTop: 8,
        paddingHorizontal: 4,
        lineHeight: 18,
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        marginTop: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    warningIcon: {
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'DMSans_700Bold',
        marginBottom: 8,
    },
    modalBody: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
    },
    deleteList: {
        alignSelf: 'stretch',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    deleteItem: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        lineHeight: 22,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        alignSelf: 'stretch',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#DC3545',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'DMSans_700Bold',
    },
});
