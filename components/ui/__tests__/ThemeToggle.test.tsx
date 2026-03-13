import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeToggle } from '../ThemeToggle';

// Get reference to the mocked toggleTheme
const mockToggleTheme = jest.fn();
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    mode: 'light',
    colors: {
      background: '#FFF8FE',
      surface: '#F2E8FF',
      primary: '#7145B5',
      textPrimary: '#1E0A35',
      textSecondary: '#9480B8',
      accent: '#F5A0B0',
      bottomBarBackground: '#FFFFFF',
      bottomBarBorder: '#EDE0FF',
    },
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<ThemeToggle />);
    expect(toJSON()).toBeTruthy();
  });

  it('contains a pressable track element', () => {
    const { toJSON } = render(<ThemeToggle />);
    const tree = toJSON();
    // The component renders: View > [Ionicons, Pressable (track), Ionicons]
    expect(tree).toBeTruthy();
    if (tree && typeof tree === 'object' && 'children' in tree && Array.isArray(tree.children)) {
      const pressable = tree.children.find(
        (child: any) => child && typeof child === 'object' && child.type === 'Pressable'
      );
      expect(pressable).toBeTruthy();
    }
  });
});
