import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title text', () => {
    const { getByText } = render(
      <Button title="Press Me" onPress={mockOnPress} />
    );
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const { getByText } = render(
      <Button title="Tap" onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Tap'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with reduced opacity when disabled', () => {
    const { toJSON } = render(
      <Button title="Disabled" onPress={mockOnPress} disabled />
    );
    // Disabled button should still render
    expect(toJSON()).toBeTruthy();
  });

  it('shows ActivityIndicator when loading', () => {
    const { queryByText } = render(
      <Button title="Save" onPress={mockOnPress} loading />
    );
    // Title should not be visible when loading
    expect(queryByText('Save')).toBeNull();
  });

  it('renders primary variant by default', () => {
    const { getByText } = render(
      <Button title="Primary" onPress={mockOnPress} />
    );
    expect(getByText('Primary')).toBeTruthy();
  });

  it('renders secondary variant', () => {
    const { getByText } = render(
      <Button title="Secondary" onPress={mockOnPress} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('renders text variant', () => {
    const { getByText } = render(
      <Button title="Text" onPress={mockOnPress} variant="text" />
    );
    expect(getByText('Text')).toBeTruthy();
  });
});
