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
    expect(result.current).toHaveProperty('calendarGroups');
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

  it('returns false when no calendars are found', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCalendarImport());

    let success = false;
    await act(async () => {
      success = await result.current.fetchCalendarBirthdays();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('No calendars found on this device.');
  });

  it('groups events by calendar and detects duplicates', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'bday-cal', title: 'Birthdays', type: 'birthdays', allowsModifications: false },
      { id: 'personal', title: 'Personal', type: 'local', allowsModifications: true },
    ]);
    // Birthday calendar events
    (Calendar.getEventsAsync as jest.Mock)
      .mockResolvedValueOnce([
        { id: 'evt-1', title: 'Alice', startDate: '1990-03-15T12:00:00Z' },
        { id: 'evt-2', title: 'Bob', startDate: '1604-07-20T12:00:00Z' },
      ])
      // Personal calendar events
      .mockResolvedValueOnce([
        { id: 'evt-3', title: "Mom's Birthday", startDate: '2026-05-10T12:00:00Z' },
      ]);

    const { result } = renderHook(() => useCalendarImport());

    let success = false;
    await act(async () => {
      success = await result.current.fetchCalendarBirthdays();
    });

    expect(success).toBe(true);
    expect(result.current.calendarGroups).toHaveLength(2);

    // Birthdays calendar group should be first
    const bdayGroup = result.current.calendarGroups[0];
    expect(bdayGroup.calendarName).toBe('Birthdays');
    expect(bdayGroup.items).toHaveLength(2);

    // Alice should be a duplicate
    const alice = bdayGroup.items.find((b) => b.name === 'Alice');
    expect(alice).toBeDefined();
    expect(alice!.birthday_month).toBe(3);
    expect(alice!.birthday_day).toBe(15);
    expect(alice!.birthday_year).toBe(1990);
    expect(alice!.isDuplicate).toBe(true);

    // Bob has year 1604 → null
    const bob = bdayGroup.items.find((b) => b.name === 'Bob');
    expect(bob).toBeDefined();
    expect(bob!.birthday_year).toBeNull();
    expect(bob!.isDuplicate).toBe(false);

    // Personal calendar group
    const personalGroup = result.current.calendarGroups[1];
    expect(personalGroup.calendarName).toBe('Personal');
    expect(personalGroup.items).toHaveLength(1);
    expect(personalGroup.items[0].name).toBe("Mom");
  });

  it('skips calendars with no events', async () => {
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValueOnce([
      { id: 'bday-cal', title: 'Birthdays', type: 'birthdays', allowsModifications: false },
      { id: 'empty-cal', title: 'Work', type: 'local', allowsModifications: true },
    ]);
    (Calendar.getEventsAsync as jest.Mock)
      .mockResolvedValueOnce([
        { id: 'evt-1', title: 'Charlie', startDate: '1995-06-10T12:00:00Z' },
      ])
      .mockResolvedValueOnce([]); // empty work calendar

    const { result } = renderHook(() => useCalendarImport());

    await act(async () => {
      await result.current.fetchCalendarBirthdays();
    });

    // Only Birthdays group should appear (Work has no events)
    expect(result.current.calendarGroups).toHaveLength(1);
    expect(result.current.calendarGroups[0].calendarName).toBe('Birthdays');
  });

  it('importSelected calls supabase insert and refetch', async () => {
    const { result } = renderHook(() => useCalendarImport());

    const items = [
      {
        uid: 'bday-cal-evt-2-0',
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

    expect(result.current.calendarGroups.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.calendarGroups).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
