import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddEditBirthdayModal from '../modal';

// Mock the hooks used by modal.tsx
const mockAddBirthday = jest.fn().mockResolvedValue({ id: 'new-person-id' });
const mockUpdateBirthday = jest.fn().mockResolvedValue(undefined);
const mockRouterBack = jest.fn();

jest.mock('../../hooks/useBirthdays', () => ({
    useBirthdays: () => ({
        birthdays: [],
        loading: false,
        error: null,
        addBirthday: mockAddBirthday,
        updateBirthday: mockUpdateBirthday,
        deleteBirthday: jest.fn(),
        refetch: jest.fn(),
    }),
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: mockRouterBack,
    }),
    useLocalSearchParams: () => ({}),
}));

jest.mock('../../hooks/useGroups', () => ({
    useGroups: () => ({
        groups: [],
        loading: false,
        error: null,
        addGroup: jest.fn(),
        updateGroup: jest.fn(),
        deleteGroup: jest.fn(),
        generateShareCode: jest.fn(),
        refetch: jest.fn(),
    }),
}));

// Mock useAuth to provide a signed-in user
jest.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { user: { id: 'test-user-id' } },
        loading: false,
        signUp: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        resetPassword: jest.fn(),
    }),
}));

// Mock Avatar component to avoid image-related issues
jest.mock('../../components/ui/Avatar', () => ({
    Avatar: () => 'Avatar',
}));

describe('AddEditBirthdayModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the BirthdayForm', () => {
        const { getByPlaceholderText, getByText } = render(
            <AddEditBirthdayModal />
        );

        // BirthdayForm should render with its fields
        expect(getByPlaceholderText("Person's name")).toBeTruthy();
        expect(getByPlaceholderText('DD')).toBeTruthy();
        expect(getByText('Save')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
    });

    it('calls router.back() when Cancel is pressed', () => {
        const { getByText } = render(<AddEditBirthdayModal />);

        fireEvent.press(getByText('Cancel'));
        expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    it('calls addBirthday and navigates back on valid submission', async () => {
        const { getByPlaceholderText, getByText } = render(
            <AddEditBirthdayModal />
        );

        // Fill the form
        fireEvent.changeText(getByPlaceholderText("Person's name"), 'John Doe');
        fireEvent.changeText(getByPlaceholderText('DD'), '15');

        // Submit
        fireEvent.press(getByText('Save'));

        await waitFor(() => {
            expect(mockAddBirthday).toHaveBeenCalledTimes(1);
        });

        expect(mockAddBirthday).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'John Doe',
                birthday_day: 15,
                birthday_month: 1, // Default January
            })
        );

        await waitFor(() => {
            expect(mockRouterBack).toHaveBeenCalled();
        });
    });

    it('shows Alert on save error', async () => {
        const { Alert } = require('react-native');
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => { });

        mockAddBirthday.mockRejectedValueOnce(new Error('Database connection failed'));

        const { getByPlaceholderText, getByText } = render(
            <AddEditBirthdayModal />
        );

        fireEvent.changeText(getByPlaceholderText("Person's name"), 'Jane');
        fireEvent.changeText(getByPlaceholderText('DD'), '10');
        fireEvent.press(getByText('Save'));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Error', 'Database connection failed');
        });

        alertSpy.mockRestore();
    });

    it('does not submit when name is empty', () => {
        const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => { });
        const { getByPlaceholderText, getByText } = render(
            <AddEditBirthdayModal />
        );

        fireEvent.changeText(getByPlaceholderText('DD'), '5');
        fireEvent.press(getByText('Save'));

        // addBirthday should NOT be called (form validation catches it)
        expect(mockAddBirthday).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });
});
