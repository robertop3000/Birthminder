import React from 'react';
import { render } from '@testing-library/react-native';
import { FAB } from '../FAB';

describe('FAB', () => {
  it('renders when visible is true', () => {
    const { toJSON } = render(<FAB visible={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders by default (visible defaults to true)', () => {
    const { toJSON } = render(<FAB />);
    expect(toJSON()).toBeTruthy();
  });

  it('returns null when visible is false', () => {
    const { toJSON } = render(<FAB visible={false} />);
    expect(toJSON()).toBeNull();
  });
});
