import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { FAB } from '../../components/ui/FAB';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ITEMS: {
  name: string;
  icon: TabIconName;
  iconFocused: TabIconName;
  showFAB: boolean;
}[] = [
  { name: 'index', icon: 'home-outline', iconFocused: 'home', showFAB: true },
  { name: 'search', icon: 'search-outline', iconFocused: 'search', showFAB: true },
  { name: 'groups', icon: 'people-outline', iconFocused: 'people', showFAB: true },
  { name: 'notifications', icon: 'notifications-outline', iconFocused: 'notifications', showFAB: false },
  { name: 'profile', icon: 'person-outline', iconFocused: 'person', showFAB: false },
];

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bottomBarBackground,
            borderTopWidth: 0.5,
            borderTopColor: colors.bottomBarBorder,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        {TAB_ITEMS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={styles.tabIconContainer}>
                  <Ionicons
                    name={focused ? tab.iconFocused : tab.icon}
                    size={26}
                    color={color}
                  />
                  {focused && (
                    <View
                      style={[
                        styles.dotIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              ),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
