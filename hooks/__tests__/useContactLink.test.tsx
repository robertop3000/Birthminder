import { renderHook, act } from '@testing-library/react-native';
import { useContactLink } from '../useContactLink';
import * as Contacts from 'expo-contacts';

describe('useContactLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the expected API shape', () => {
    const { result } = renderHook(() => useContactLink());

    expect(result.current).toHaveProperty('linking');
    expect(typeof result.current.pickContact).toBe('function');
    expect(typeof result.current.getContactInfo).toBe('function');
  });

  it('pickContact returns null when user cancels', async () => {
    (Contacts.presentContactPickerAsync as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useContactLink());

    let contact: unknown = undefined;
    await act(async () => {
      contact = await result.current.pickContact();
    });

    expect(contact).toBeNull();
    expect(result.current.linking).toBe(false);
  });

  it('pickContact returns LinkedContact on selection', async () => {
    (Contacts.presentContactPickerAsync as jest.Mock).mockResolvedValueOnce({
      id: 'contact-abc',
      firstName: 'Jane',
      lastName: 'Doe',
      image: { uri: 'file:///photo.jpg' },
    });

    const { result } = renderHook(() => useContactLink());

    let contact: unknown = undefined;
    await act(async () => {
      contact = await result.current.pickContact();
    });

    expect(contact).toEqual({
      id: 'contact-abc',
      name: 'Jane Doe',
      imageUri: 'file:///photo.jpg',
      phone: null,
    });
    expect(result.current.linking).toBe(false);
  });

  it('pickContact extracts phone when contact has phone numbers', async () => {
    (Contacts.presentContactPickerAsync as jest.Mock).mockResolvedValueOnce({
      id: 'contact-def',
      firstName: 'Bob',
      lastName: 'Smith',
      image: null,
      phoneNumbers: [{ number: '+1 555-0100' }, { number: '+1 555-0101' }],
    });
    // Image refetch: permission denied → no image
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const { result } = renderHook(() => useContactLink());

    let contact: unknown = undefined;
    await act(async () => {
      contact = await result.current.pickContact();
    });

    expect(contact).toEqual({
      id: 'contact-def',
      name: 'Bob Smith',
      imageUri: null,
      phone: '+1 555-0100',
    });
  });

  it('pickContact refetches image when picker does not return it', async () => {
    (Contacts.presentContactPickerAsync as jest.Mock).mockResolvedValueOnce({
      id: 'contact-img',
      firstName: 'Alice',
      lastName: 'Wonder',
      image: null,
      phoneNumbers: [{ number: '+1 555-0200' }],
    });
    // Image refetch: permission granted, contact has image
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Contacts.getContactsAsync as jest.Mock).mockResolvedValueOnce({
      data: [{ image: { uri: 'file:///alice-photo.jpg' } }],
    });

    const { result } = renderHook(() => useContactLink());

    let contact: unknown = undefined;
    await act(async () => {
      contact = await result.current.pickContact();
    });

    expect(contact).toEqual({
      id: 'contact-img',
      name: 'Alice Wonder',
      imageUri: 'file:///alice-photo.jpg',
      phone: '+1 555-0200',
    });
  });

  it('getContactInfo returns null when permission is denied', async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const { result } = renderHook(() => useContactLink());

    let info: unknown = undefined;
    await act(async () => {
      info = await result.current.getContactInfo('some-id');
    });

    expect(info).toBeNull();
  });

  it('getContactInfo returns contact info when found', async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Contacts.getContactsAsync as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'contact-xyz',
          firstName: 'John',
          lastName: 'Smith',
          image: { uri: 'file:///john.jpg' },
        },
      ],
    });

    const { result } = renderHook(() => useContactLink());

    let info: unknown = undefined;
    await act(async () => {
      info = await result.current.getContactInfo('contact-xyz');
    });

    expect(info).toEqual({
      id: 'contact-xyz',
      name: 'John Smith',
      imageUri: 'file:///john.jpg',
      phone: null,
    });
  });

  it('getContactInfo returns null when contact not found', async () => {
    (Contacts.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Contacts.getContactsAsync as jest.Mock).mockResolvedValueOnce({
      data: [],
    });

    const { result } = renderHook(() => useContactLink());

    let info: unknown = undefined;
    await act(async () => {
      info = await result.current.getContactInfo('nonexistent');
    });

    expect(info).toBeNull();
  });
});
