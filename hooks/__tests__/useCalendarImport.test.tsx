import { renderHook, act } from '@testing-library/react-native';
import { useCalendarImport } from '../useCalendarImport';
import * as Calendar from 'expo-calendar';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';

// Mock useAuth
jest.mock('../useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

// Mock useBirthdays
const mockRefetch = jest.fn().mockResolvedValue(undefined);
jest.mock('../useBirthdays', () => ({
  useBirthdays: () => ({
    birthdays: [
      {
        id: 'existing-1',
        name: 'Alice',
        birthday_month: 3,
        birthday_day: 15,
        user_id: 'user-123',
        person_groups: [],
      },
    ],
    refetch: mockRefetch,
  }),
}));

// Override supabase.from for importSelected to return a resolved insert
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = supabase.from as jest.Mock;

describe('useCalendarImport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure supabase.from('people').insert() resolves
    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  it('returns the expected API shape', () => {
    const { result } = renderHook(() => useCalendarImport());

    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('importing');
    expect(result.current).toHaveProperty('calendarBirthdays');
    expect(result.current).toHaveProperty('error');
    expect(typeof result.current.fetchCalendarBirthdays).toBe('function');
    expect(typeof result.current.importSelected).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('returns false when permission is denied', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const { result } = renderHook(() => useCalendarImport());

    let success = false;
    await act(async () => {
      success = await result.current.fetchCalendarBirthdays();
    });

    expect(success).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Calendar Access Required',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('returns false when no birthday calendar is found', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'cal-1', title: 'Work', type: 'local', allowsModifications: true },
    ]);

    const { result } = renderHook(() => useCalendarImport());

    let success = false;
    await act(async () => {
      success = await result.current.fetchCalendarBirthdays();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('No Birthdays calendar found on this device.');
  });

  it('parses calendar events correctly and detects duplicates', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'bday-cal', title: 'Birthdays', type: 'birthdays', allowsModifications: false },
    ]);
    // Use noon UTC to avoid timezone day-shift issues
    (Calendar.getEventsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'evt-1', title: 'Alice', startDate: '1990-03-15T12:00:00Z' },
      { id: 'evt-2', title: 'Bob', startDate: '1604-07-20T12:00:00Z' },
    ]);

    const { result } = renderHook(() => useCalendarImport());

    let success = false;
    await act(async () => {
      success = await result.current.fetchCalendarBirthdays();
    });

    expect(success).toBe(true);
    expect(result.current.calendarBirthdays).toHaveLength(2);

    // Alice should be a duplicate (matches existing birthday)
    const alice = result.current.calendarBirthdays.find((b) => b.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice!.birthday_month).toBe(3);
    expect(alice!.birthday_day).toBe(15);
    expect(alice!.birthday_year).toBe(1990);
    expect(alice!.isDuplicate).toBe(true);

    // Bob has year 1604 (sentinel) — should be null
    const bob = result.current.calendarBirthdays.find((b) => b.name === 'Bob');
    expect(bob).toBeDefined();
    expect(bob!.birthday_month).toBe(7);
    expect(bob!.birthday_day).toBe(20);
    expect(bob!.birthday_year).toBeNull();
    expect(bob!.isDuplicate).toBe(false);
  });

  it('importSelected calls supabase insert and refetch', async () => {
    const { result } = renderHook(() => useCalendarImport());

    const items = [
      {
        eventId: 'evt-2',
        name: 'Bob',
        birthday_month: 7,
        birthday_day: 20,
        birthday_year: null,
        isDuplicate: false,
      },
    ];

    await act(async () => {
      await result.current.importSelected(items);
    });

    expect(mockFrom).toHaveBeenCalledWith('people');
    expect(mockInsert).toHaveBeenCalledWith([
      {
        user_id: 'user-123',
        name: 'Bob',
        birthday_day: 20,
        birthday_month: 7,
        birthday_year: null,
      },
    ]);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('reset clears state', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'bday-cal', title: 'Birthdays', type: 'birthdays', allowsModifications: false },
    ]);
    (Calendar.getEventsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'evt-1', title: 'Charlie', startDate: '1995-06-10T12:00:00Z' },
    ]);

    const { result } = renderHook(() => useCalendarImport());

    await act(async () => {
      await result.current.fetchCalendarBirthdays();
    });

    expect(result.current.calendarBirthdays.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.calendarBirthdays).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
