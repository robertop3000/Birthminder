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
import { supabase } from '../lib/supabase';
import { APP_VERSION } from '../lib/constants';

export default function SettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user) return;
        setDeleting(true);
        try {
            // 1. Delete all person_groups for user's people
            const { data: people } = await supabase
                .from('people')
                .select('id')
                .eq('user_id', user.id);

            if (people && people.length > 0) {
                const personIds = people.map((p) => p.id);
                await supabase
                    .from('person_groups')
                    .delete()
                    .in('person_id', personIds);
            }

            // 2. Delete all people
            await supabase.from('people').delete().eq('user_id', user.id);

            // 3. Delete all groups
            await supabase.from('groups').delete().eq('user_id', user.id);

            // 4. Delete profile
            await supabase.from('profiles').delete().eq('id', user.id);

            // 5. Sign out (auth user deletion requires server-side admin key)
            await signOut();

            setShowDeleteConfirm(false);
            router.replace('/(auth)/login');

            // Show final message after navigation
            setTimeout(() => {
                Alert.alert(
                    'Account Deleted',
                    'Your account and all data have been permanently deleted.'
                );
            }, 500);
        } catch (err) {
            console.error('Delete account error:', err);
            Alert.alert('Error', 'Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
        }
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
                <View style={{ width: 32 }} />
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
                    style={[styles.settingsRow, styles.dangerRow]}
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
    dangerRow: {
        backgroundColor: '#DC354510',
        borderWidth: 1,
        borderColor: '#DC354530',
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
