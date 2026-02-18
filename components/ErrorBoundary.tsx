import React, { Component, ErrorInfo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Appearance,
} from 'react-native';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (__DEV__) console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRestart = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const isDark = Appearance.getColorScheme() === 'dark';
            const bg = isDark ? '#1A1A2E' : '#FAF8F5';
            const textColor = isDark ? '#F4F1DE' : '#3D405B';
            const subColor = isDark ? '#A8A8B3' : '#6B6B7B';
            const primary = '#E07A5F';

            return (
                <View style={[styles.container, { backgroundColor: bg }]}>
                    <Text style={styles.emoji}>😔</Text>
                    <Text style={[styles.title, { color: textColor }]}>
                        Something went wrong
                    </Text>
                    <Text style={[styles.subtitle, { color: subColor }]}>
                        We are working to make it right
                    </Text>
                    <Pressable
                        onPress={this.handleRestart}
                        style={[styles.button, { backgroundColor: primary }]}
                    >
                        <Text style={styles.buttonText}>Restart App</Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
