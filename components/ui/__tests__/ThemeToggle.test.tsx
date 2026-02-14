import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeToggle } from '../ThemeToggle';

// Get reference to the mocked toggleTheme
const mockToggleTheme = jest.fn();
jest.mock('../../../hooks/useTheme', () => ({
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
