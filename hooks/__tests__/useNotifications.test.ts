import { renderHook, act } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../lib/supabase';

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    SchedulableTriggerInputTypes: {
        CALENDAR: 'calendar',
        TIME_INTERVAL: 'timeInterval',
    },
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({ data: { notification_days_before: 1 }, error: null })),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
        })),
    },
}));

// Mock Auth
jest.mock('../useAuth', () => ({
    useAuth: () => ({ user: { id: 'user-123' } }),
}));

describe('useNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    });

    it('updates permission status on mount', async () => {
        const { result } = renderHook(() => useNotifications());

        // Initial state might be null, but useEffect will trigger checkPermission
        await act(async () => {
            // Wait for effects
        });

        expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
        expect(result.current.permissionStatus).toBe('granted');
    });

    it('requests permission if undetermined', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

        renderHook(() => useNotifications());

        await act(async () => {
            // Wait for effects
        });

        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('schedules notifications at 8:00 AM with unique IDs', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            // Wait for loadPreference
        });

        const birthdays = [
            {
                id: 'bday-1',
                name: 'Alice',
                birthday_day: 15,
                birthday_month: 5,
                user_id: 'user-123',
            },
        ];

        await act(async () => {
            await result.current.scheduleAllNotifications(birthdays as any);
        });

        // Should call scheduleNotificationAsync for: 
        // 1. Birthday day (Alice)
        // 2. Reminder 1 day before (since loadPreference returns 1)
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

        // Check birthday day call
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'bday-1',
                trigger: expect.objectContaining({
                    hour: 8,
                    day: 15,
                    month: 5,
                }),
            })
        );

        // Check reminder call
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'bday-1-reminder',
                trigger: expect.objectContaining({
                    hour: 8,
                }),
            })
        );
    });
});
