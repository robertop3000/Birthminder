import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type Tab = 'privacy' | 'terms';

const PRIVACY_POLICY = `Last updated: February 2025

Birthminder ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.

**Information We Collect**
• Account information: your display name, email address, and optional profile photo.
• Birthday entries: names, birthdays (month, day, and optionally year), photos, and notes you add for the people you track.
• Group information: group names, colors, and membership.

**How We Use Your Information**
• To provide and improve the Birthminder service.
• To send you push notifications about upcoming birthdays (only when you enable them).
• We do not sell, rent, or share your personal data with third parties for marketing purposes.

**Data Storage**
Your data is stored securely using Supabase, a cloud database platform with enterprise-grade security, encryption at rest, and SSL/TLS in transit. Data is hosted in compliance with applicable data protection regulations.

**Data Retention & Deletion**
You may delete your account and all associated data at any time from the Profile tab. For data deletion requests or questions, contact us at:

📧 deverobertt@gmail.com

**Children's Privacy**
Birthminder is not directed at children under 13. We do not knowingly collect information from children under 13.

**Changes to This Policy**
We may update this Privacy Policy from time to time. We will notify you of any material changes through the app.`;

const TERMS_OF_SERVICE = `Last updated: February 2025

By using Birthminder ("the App"), you agree to these Terms of Service.

**Your Account**
• You are responsible for maintaining the security of your account credentials.
• You must provide accurate information when creating your account.

**Acceptable Use**
• You agree not to upload offensive, harmful, or illegal content, including inappropriate photos.
• You agree not to use the App for any purpose that violates applicable laws.
• We reserve the right to remove content or suspend accounts that violate these terms.

**User-Generated Content**
• You retain ownership of the content you create (birthday entries, photos, notes).
• By uploading content, you grant us a limited license to store and display it within the App for your use.
• You are solely responsible for the content you upload, including photos.

**Disclaimer**
THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE.

**Limitation of Liability**
TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.

**Apple Standard EULA**
If you downloaded the App from the Apple App Store, Apple's Standard End User License Agreement (EULA) also applies. You can review it at:
https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

**Contact**
For questions about these Terms, contact us at:

📧 deverobertt@gmail.com`;

export default function LegalScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<Tab>('privacy');

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, paddingTop: insets.top },
            ]}
        >
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Legal
                </Text>
                <View style={{ width: 32 }} />
            </View>

            <View style={styles.tabs}>
                <Pressable
                    onPress={() => setActiveTab('privacy')}
                    style={[
                        styles.tab,
                        {
                            backgroundColor:
                                activeTab === 'privacy' ? colors.primary : colors.surface,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'privacy' ? '#FFFFFF' : colors.textPrimary,
                            },
                        ]}
                    >
                        Privacy Policy
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('terms')}
                    style={[
                        styles.tab,
                        {
                            backgroundColor:
                                activeTab === 'terms' ? colors.primary : colors.surface,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            {
                                color: activeTab === 'terms' ? '#FFFFFF' : colors.textPrimary,
                            },
                        ]}
                    >
                        Terms of Service
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 20 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.body, { color: colors.textPrimary }]}>
                    {activeTab === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE}
                </Text>
            </ScrollView>
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
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'DMSans_500Medium',
    },
    content: {
        paddingHorizontal: 20,
    },
    body: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        lineHeight: 24,
    },
});
