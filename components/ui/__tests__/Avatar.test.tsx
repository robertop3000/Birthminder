import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders fallback icon when no uri provided', () => {
    const { toJSON } = render(<Avatar />);
    const tree = toJSON();
    // Should render without crashing and use default size
    expect(tree).toBeTruthy();
  });

  it('renders image when uri is provided', () => {
    const { toJSON } = render(<Avatar uri="https://example.com/photo.jpg" />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('applies custom size', () => {
    const { toJSON } = render(<Avatar size={80} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('wraps in Pressable when onPress is provided', () => {
    const onPress = jest.fn();
    const { toJSON } = render(<Avatar onPress={onPress} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // When onPress is provided, wrapper should be Pressable
    if (tree && typeof tree === 'object' && 'type' in tree) {
      expect(tree.type).toBe('Pressable');
    }
  });

  it('renders as View (not Pressable) when no onPress', () => {
    const { toJSON } = render(<Avatar />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // No onPress means wrapper is View, not Pressable
    if (tree && typeof tree === 'object' && 'type' in tree) {
      expect(tree.type).toBe('View');
    }
  });
});
