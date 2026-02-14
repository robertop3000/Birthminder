import { renderHook, waitFor } from '@testing-library/react-native';
import { useGroups } from '../useGroups';

// useGroups depends on useAuth — mock with NO user to avoid fetchGroups async path
// This tests the "no user" branch where loading is set false synchronously
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  }),
}));

describe('useGroups', () => {
  it('returns empty groups when no user', async () => {
    const { result } = renderHook(() => useGroups());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.groups).toEqual([]);
  });

  it('returns expected hook API', async () => {
    const { result } = renderHook(() => useGroups());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('groups');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('addGroup');
    expect(result.current).toHaveProperty('updateGroup');
    expect(result.current).toHaveProperty('deleteGroup');
    expect(result.current).toHaveProperty('generateShareCode');
    expect(result.current).toHaveProperty('refetch');
  });

  it('addGroup is a function', async () => {
    const { result } = renderHook(() => useGroups());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(typeof result.current.addGroup).toBe('function');
  });

  it('deleteGroup is a function', async () => {
    const { result } = renderHook(() => useGroups());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(typeof result.current.deleteGroup).toBe('function');
  });

  it('generateShareCode is a function', async () => {
    const { result } = renderHook(() => useGroups());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(typeof result.current.generateShareCode).toBe('function');
  });
});
