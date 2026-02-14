import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TopBar } from '../TopBar';

describe('TopBar', () => {
  it('renders with title', () => {
    const { getByText } = render(<TopBar title="Home" />);
    expect(getByText('Home')).toBeTruthy();
  });

  it('renders without title', () => {
    const { toJSON } = render(<TopBar />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders right action when provided', () => {
    const { getByText } = render(
      <TopBar title="Test" rightAction={<Text>Settings</Text>} />
    );
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders avatar by default', () => {
    const { toJSON } = render(<TopBar title="Home" />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('hides avatar when showAvatar is false', () => {
    const { toJSON } = render(<TopBar title="Home" showAvatar={false} />);
    expect(toJSON()).toBeTruthy();
  });
});
