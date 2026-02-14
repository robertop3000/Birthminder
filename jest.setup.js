const React = require('react');

// Helper to create mock React Native components
function mockComponent(name) {
  const component = ({ children, ...props }) => {
    return React.createElement(name, props, children);
  };
  component.displayName = name;
  return component;
}

// Mock React Native fully (no requireActual — RN 0.81.5 ESM breaks Jest)
jest.mock('react-native', () => {
  const React = require('react');

  const View = mockComponent('View');
  const Text = mockComponent('Text');
  const Image = mockComponent('Image');
  const ScrollView = mockComponent('ScrollView');
  const FlatList = ({ data, renderItem, keyExtractor, ListHeaderComponent, ListEmptyComponent, ...props }) => {
    const header = ListHeaderComponent
      ? (typeof ListHeaderComponent === 'function' ? React.createElement(ListHeaderComponent) : ListHeaderComponent)
      : null;
    const items = (data || []).map((item, index) =>
      React.createElement(React.Fragment, { key: keyExtractor ? keyExtractor(item, index) : index },
        renderItem({ item, index, separators: {} })
      )
    );
    const empty = (!data || data.length === 0) && ListEmptyComponent
      ? (typeof ListEmptyComponent === 'function' ? React.createElement(ListEmptyComponent) : ListEmptyComponent)
      : null;
    return React.createElement('FlatList', props, header, ...items, empty);
  };
  FlatList.displayName = 'FlatList';

  const TextInput = React.forwardRef(({ onChangeText, value, placeholder, placeholderTextColor, testID, ...props }, ref) => {
    return React.createElement('TextInput', {
      ...props,
      ref,
      value,
      placeholder,
      testID,
      onChange: (e) => {
        if (onChangeText) onChangeText(e?.nativeEvent?.text || e?.target?.value || '');
      },
      onChangeText,
    });
  });
  TextInput.displayName = 'TextInput';

  const Pressable = ({ children, onPress, disabled, testID, ...props }) => {
    return React.createElement('Pressable', { ...props, onPress: disabled ? undefined : onPress, disabled, testID, accessibilityRole: 'button' },
      typeof children === 'function' ? children({ pressed: false }) : children
    );
  };
  Pressable.displayName = 'Pressable';

  const TouchableOpacity = ({ children, onPress, disabled, testID, ...props }) => {
    return React.createElement('TouchableOpacity', { ...props, onPress: disabled ? undefined : onPress, disabled, testID, accessibilityRole: 'button' }, children);
  };
  TouchableOpacity.displayName = 'TouchableOpacity';

  const Modal = ({ children, visible, transparent, animationType, onRequestClose, ...props }) => {
    if (!visible) return null;
    return React.createElement('Modal', { ...props, visible, transparent, animationType, onRequestClose }, children);
  };
  Modal.displayName = 'Modal';

  const KeyboardAvoidingView = mockComponent('KeyboardAvoidingView');
  const ActivityIndicator = mockComponent('ActivityIndicator');
  const SafeAreaView = mockComponent('SafeAreaView');
  const StatusBar = mockComponent('StatusBar');

  const StyleSheet = {
    create: (styles) => styles,
    flatten: (style) => {
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.filter(Boolean));
      }
      return style || {};
    },
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  };

  const Platform = {
    OS: 'ios',
    select: (obj) => obj.ios !== undefined ? obj.ios : obj.default,
    Version: 17,
  };

  const Alert = {
    alert: jest.fn(),
  };

  // Make alert global since BirthdayForm uses bare `alert()`
  global.alert = jest.fn();

  const Dimensions = {
    get: jest.fn().mockReturnValue({ width: 375, height: 812, scale: 3, fontScale: 1 }),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    removeEventListener: jest.fn(),
  };

  const Animated = {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    FlatList: mockComponent('Animated.FlatList'),
    Value: jest.fn().mockImplementation((val) => ({
      setValue: jest.fn(),
      interpolate: jest.fn().mockReturnValue(val),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn((cb) => cb && cb(val)),
      _value: val,
    })),
    timing: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    spring: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    decay: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    parallel: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    sequence: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    stagger: jest.fn().mockReturnValue({ start: jest.fn((cb) => cb && cb({ finished: true })), stop: jest.fn() }),
    loop: jest.fn().mockReturnValue({ start: jest.fn(), stop: jest.fn() }),
    event: jest.fn().mockReturnValue(jest.fn()),
    createAnimatedComponent: (comp) => comp,
  };

  const Linking = {
    openURL: jest.fn().mockResolvedValue(undefined),
    canOpenURL: jest.fn().mockResolvedValue(true),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    getInitialURL: jest.fn().mockResolvedValue(null),
  };

  const Appearance = {
    getColorScheme: jest.fn().mockReturnValue('light'),
    addChangeListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  };

  const useColorScheme = jest.fn().mockReturnValue('light');
  const useWindowDimensions = jest.fn().mockReturnValue({ width: 375, height: 812, scale: 3, fontScale: 1 });

  return {
    View,
    Text,
    TextInput,
    Image,
    ScrollView,
    FlatList,
    Pressable,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Platform,
    Alert,
    Dimensions,
    Animated,
    Linking,
    Appearance,
    useColorScheme,
    useWindowDimensions,
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaTypeOptions: { Images: 'images' },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { CALENDAR: 'calendar' },
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn().mockReturnValue([true, null]),
  isLoaded: jest.fn().mockReturnValue(true),
}));

// Mock @expo-google-fonts/dm-sans
jest.mock('@expo-google-fonts/dm-sans', () => ({
  useFonts: jest.fn().mockReturnValue([true, null]),
  DMSans_400Regular: 'DMSans_400Regular',
  DMSans_500Medium: 'DMSans_500Medium',
  DMSans_700Bold: 'DMSans_700Bold',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock useTheme
jest.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    mode: 'light',
    colors: {
      background: '#FAF8F5',
      surface: '#F0EDE8',
      primary: '#E07A5F',
      textPrimary: '#2D2D2D',
      textSecondary: '#9E9E9E',
      accent: '#F2C94C',
      bottomBarBackground: '#FFFFFF',
      bottomBarBorder: '#E8E3DE',
    },
    toggleTheme: jest.fn(),
  }),
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    then: jest.fn(),
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/photo.jpg' },
      }),
    }),
  },
};

jest.mock('./lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Make mockSupabase available globally for test assertions
global.__mockSupabase = mockSupabase;
