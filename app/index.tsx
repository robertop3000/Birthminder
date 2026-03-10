import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
    useFonts,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
    const router = useRouter();
    const { colors } = useTheme();
    const [error, setError] = useState<string | null>(null);

    const [fontsLoaded, fontsError] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
    });

    useEffect(() => {
        // Wait for fonts to load before attempting navigation
        if (fontsLoaded) {
            try {
                // Use a small delay to ensure everything is ready
                const timer = setTimeout(() => {
                    router.replace('/(auth)');
                }, 100);

                return () => clearTimeout(timer);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Navigation failed');
            }
        } else if (fontsError) {
            setError('Failed to load fonts');
        }
    }, [fontsLoaded, fontsError]);

    // Show error state if something went wrong
    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorTitle, { color: colors.primary }]}>App Error</Text>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
            </View>
        );
    }

    // Show loading state while fonts load
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Birthminder</Text>
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'DMSans_700Bold',
        marginBottom: 16,
    },
    loader: {
        marginTop: 8,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'DMSans_700Bold',
        marginBottom: 12,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
