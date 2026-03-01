import { renderHook, act } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';
import * as Notifications from 'expo-notifications';

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

    it('schedules one day-of notification per birthday at 8:00 AM with sound', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            // Wait for effects
        });

        const birthdays = [
            {
                id: 'bday-1',
                name: 'Alice',
                birthday_day: 15,
                birthday_month: 5,
                user_id: 'user-123',
                reminder_days: [0], // Default: same-day reminder only
            },
        ];

        await act(async () => {
            await result.current.scheduleAllNotifications(birthdays as any);
        });

        // Only 1 notification per birthday (day-of, no advance reminder)
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'bday-1-0', // Now includes day offset
                content: expect.objectContaining({
                    sound: 'default',
                }),
                trigger: expect.objectContaining({
                    hour: 8,
                    day: 15,
                    month: 5,
                }),
            })
        );
    });

    it('falls back to same-day reminder when reminder_days is null', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => { });

        const birthdays = [
            {
                id: 'bday-null',
                name: 'NullTest',
                birthday_day: 10,
                birthday_month: 3,
                user_id: 'user-123',
                reminder_days: null, // Simulates missing column
            },
        ];

        await act(async () => {
            await result.current.scheduleAllNotifications(birthdays as any);
        });

        // Should schedule exactly 1 notification (same-day fallback)
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'bday-null-0',
                content: expect.objectContaining({
                    title: expect.stringContaining('NullTest'),
                }),
                trigger: expect.objectContaining({
                    day: 10,
                    month: 3,
                    hour: 8,
                }),
            })
        );
    });

    it('schedules multiple notifications for multi-day reminders', async () => {
        const { result } = renderHook(() => useNotifications());

        await act(async () => { });

        const birthdays = [
            {
                id: 'bday-multi',
                name: 'MultiTest',
                birthday_day: 20,
                birthday_month: 6,
                user_id: 'user-123',
                reminder_days: [0, 3, 7], // Same day + 3 days + 1 week before
            },
        ];

        await act(async () => {
            await result.current.scheduleAllNotifications(birthdays as any);
        });

        // Should schedule exactly 3 notifications
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

        // Verify identifiers
        const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        const identifiers = calls.map(([arg]: any[]) => arg.identifier);
        expect(identifiers).toContain('bday-multi-0');
        expect(identifiers).toContain('bday-multi-3');
        expect(identifiers).toContain('bday-multi-7');
    });
});
