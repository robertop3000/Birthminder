import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AddEditBirthdayModal from '../modal';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

// Mock hooks
const mockAddBirthday = jest.fn().mockResolvedValue({ id: 'new-person-id' });
const mockUpdateBirthday = jest.fn().mockResolvedValue(undefined);
const mockRouterBack = jest.fn();
const mockRefetchGroups = jest.fn();

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
        refetch: mockRefetchGroups,
    }),
}));

// Mock Supabase with proper structure for named export
jest.mock('../../lib/supabase', () => {
    const uploadMock = jest.fn().mockResolvedValue({ data: { path: 'path/to/image.jpg' }, error: null });
    const getPublicUrlMock = jest.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.co/storage/v1/object/public/avatars/path/to/image.jpg' } });

    return {
        supabase: {
            storage: {
                from: jest.fn().mockReturnValue({
                    upload: uploadMock,
                    getPublicUrl: getPublicUrlMock,
                }),
            },
        },
    };
});

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
}));

describe('AddEditBirthdayModal Photo Upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset fetch
        global.fetch = jest.fn().mockResolvedValue({
            blob: jest.fn().mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
            }),
        } as any);
    });

    it('uploads photo to Supabase before saving birthday', async () => {
        // Mock ImagePicker result
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file:///local/path/image.jpg' }],
        });

        const { getByText, getByPlaceholderText } = render(<AddEditBirthdayModal />);

        // 1. Pick a photo -> triggers pickPhoto in BirthdayForm
        await act(async () => {
            fireEvent.press(getByText('Add Photo'));
        });

        // 2. Fill required fields
        fireEvent.changeText(getByPlaceholderText("Person's name"), 'Photo User');
        fireEvent.changeText(getByPlaceholderText('DD'), '20');

        // 3. Save
        await act(async () => {
            fireEvent.press(getByText('Save'));
        });

        // Verify upload flow
        // Retrieve the mock functions from the imported module to check calls
        const storageFrom = supabase.storage.from as jest.Mock;
        expect(storageFrom).toHaveBeenCalledWith('avatars');

        const bucket = storageFrom.mock.results[0].value;
        await waitFor(() => {
            expect(bucket.upload).toHaveBeenCalled();
        });

        const uploadCall = bucket.upload.mock.calls[0];
        // Check if path starts with people/ and ends with .jpg
        expect(uploadCall[0]).toMatch(/^people\/.*\.jpg$/);

        // Verify public URL was used in addBirthday
        await waitFor(() => {
            expect(mockAddBirthday).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Photo User',
                    photo_url: 'https://supabase.co/storage/v1/object/public/avatars/path/to/image.jpg',
                })
            );
        });

        expect(mockRouterBack).toHaveBeenCalled();
    });
});
