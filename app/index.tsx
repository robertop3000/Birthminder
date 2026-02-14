import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
    useFonts,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

export default function Index() {
    const router = useRouter();
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
            <View style={styles.container}>
                <Text style={styles.errorTitle}>⚠️ App Error</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    // Show loading state while fonts load
    return (
        <View style={styles.container}>
            <Text style={styles.title}>BirthdayCalendar</Text>
            <ActivityIndicator size="small" color="#E07A5F" style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF8F5',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E07A5F',
        marginBottom: 16,
    },
    loader: {
        marginTop: 8,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E07A5F',
        marginBottom: 12,
    },
    errorText: {
        fontSize: 14,
        color: '#2D2D2D',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
