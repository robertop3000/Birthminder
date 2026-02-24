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
            },
        ];

        await act(async () => {
            await result.current.scheduleAllNotifications(birthdays as any);
        });

        // Only 1 notification per birthday (day-of, no advance reminder)
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'bday-1',
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
});
