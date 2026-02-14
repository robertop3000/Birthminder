import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { ONBOARDING_COMPLETE_KEY } from '../../lib/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🎂',
    title: 'Never forget a birthday',
    subtitle:
      'Keep track of all the birthdays that matter to you in one beautiful place.',
  },
  {
    id: '2',
    emoji: '👥',
    title: 'Organize into groups',
    subtitle:
      'Create groups like Family, Friends, or Work to keep your birthdays organized.',
  },
  {
    id: '3',
    emoji: '🔔',
    title: 'Get reminded on time',
    subtitle:
      'Set custom reminders so you never miss wishing someone a happy birthday.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    router.replace('/(auth)/signup');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={onComplete}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? colors.primary : colors.textSecondary,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={() => {
            if (isLastSlide) {
              onComplete();
            } else {
              flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
              });
            }
          }}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    marginBottom: 8,
  },
});
