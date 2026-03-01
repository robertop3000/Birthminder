import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useBirthdays } from '../useBirthdays';
import { BirthdaysProvider } from '../../contexts/BirthdaysContext';

// Stable reference so useCallback([user]) doesn't loop
const mockUser = { id: 'test-user-id' };
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    loading: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  }),
}));

const mockSupabase = (global as any).__mockSupabase;

function createChainableMock(resolveData: any = { data: [], error: null }) {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  // useBirthdays calls .order().order() (two chained order calls)
  // The second order is the terminal call that resolves
  chain.order = jest.fn(() => ({
    order: jest.fn(() => Promise.resolve(resolveData)),
  }));
  chain.insert = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.single = jest.fn(() => Promise.resolve({ data: { id: 'p1' }, error: null }));
  return chain;
}

// Wrapper to provide BirthdaysContext
function wrapper({ children }: { children: React.ReactNode }) {
  return <BirthdaysProvider>{ children } </BirthdaysProvider>;
}

describe('useBirthdays', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(createChainableMock());
  });

  it('returns birthdays array', async () => {
    const { result } = renderHook(() => useBirthdays(), { wrapper });
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(Array.isArray(result.current.birthdays)).toBe(true);
  });

  it('returns expected hook API', async () => {
    const { result } = renderHook(() => useBirthdays(), { wrapper });
    await act(async () => {});
    expect(result.current.loading).toBe(false);

    expect(result.current).toHaveProperty('birthdays');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('addBirthday');
    expect(result.current).toHaveProperty('updateBirthday');
    expect(result.current).toHaveProperty('deleteBirthday');
    expect(result.current).toHaveProperty('refetch');
  });

  it('addBirthday is a function', async () => {
    const { result } = renderHook(() => useBirthdays(), { wrapper });
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.addBirthday).toBe('function');
  });

  it('updateBirthday is a function', async () => {
    const { result } = renderHook(() => useBirthdays(), { wrapper });
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.updateBirthday).toBe('function');
  });

  it('deleteBirthday is a function', async () => {
    const { result } = renderHook(() => useBirthdays(), { wrapper });
    await act(async () => {});
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.deleteBirthday).toBe('function');
  });
});
