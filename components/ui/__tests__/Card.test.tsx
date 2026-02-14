import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card><Text>Card Content</Text></Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders as View when no onPress', () => {
    const { toJSON } = render(
      <Card><Text>Static</Text></Card>
    );
    const tree = toJSON();
    expect(tree).toBeTruthy();
    if (tree && typeof tree === 'object' && 'type' in tree) {
      expect(tree.type).toBe('View');
    }
  });

  it('renders as Pressable when onPress is provided', () => {
    const onPress = jest.fn();
    const { toJSON } = render(
      <Card onPress={onPress}><Text>Tappable</Text></Card>
    );
    const tree = toJSON();
    if (tree && typeof tree === 'object' && 'type' in tree) {
      expect(tree.type).toBe('Pressable');
    }
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Card onPress={onPress}><Text>Tap Me</Text></Card>
    );
    fireEvent.press(getByText('Tap Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
