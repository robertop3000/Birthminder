import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

// Access the global mock supabase
const mockSupabase = (global as any).__mockSupabase;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: no session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it('starts with loading true', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('sets loading to false after session check', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('user is null when no session', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('signIn calls supabase.auth.signInWithPassword', async () => {
    const mockSession = { user: { id: 'test-id', email: 'test@test.com' } };
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('test@test.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('signIn throws on error', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid credentials'),
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      result.current.signIn('bad@email.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });

  it('signUp calls supabase.auth.signUp and creates profile', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user-id' } },
      error: null,
    });
    // Mock the profile insert chain
    const mockInsertChain = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockReturnValue(mockInsertChain);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signUp('new@test.com', 'pass123', 'New User');
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'pass123',
    });
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('signOut calls supabase.auth.signOut', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('resetPassword calls supabase.auth.resetPasswordForEmail', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.resetPassword('reset@test.com');
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'reset@test.com'
    );
  });

  it('returns all expected properties', async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('session');
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('signUp');
    expect(result.current).toHaveProperty('signIn');
    expect(result.current).toHaveProperty('signOut');
    expect(result.current).toHaveProperty('resetPassword');
  });
});
