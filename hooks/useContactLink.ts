import { useState, useCallback } from 'react';
import * as Contacts from 'expo-contacts';

export interface LinkedContact {
  id: string;
  name: string;
  imageUri: string | null;
  phone: string | null;
}

export function useContactLink() {
  const [linking, setLinking] = useState(false);

  const pickContact = useCallback(async (): Promise<LinkedContact | null> => {
    setLinking(true);
    try {
      // presentContactPickerAsync does NOT require permissions on iOS
      const contact = await Contacts.presentContactPickerAsync();

      if (!contact) {
        setLinking(false);
        return null;
      }

      const phone =
        contact.phoneNumbers && contact.phoneNumbers.length > 0
          ? contact.phoneNumbers[0].number ?? null
          : null;

      let imageUri: string | null = contact.image?.uri ?? null;

      // iOS picker often doesn't include image data in the response.
      // Refetch the contact with the Image field if we didn't get it.
      if (!imageUri) {
        try {
          const { status } = await Contacts.requestPermissionsAsync();
          if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
              id: contact.id,
              fields: [Contacts.Fields.Image],
            });
            if (data.length > 0) {
              imageUri = data[0].image?.uri ?? null;
            }
          }
        } catch {
          // Permission denied or fetch failed — continue without image
        }
      }

      const result: LinkedContact = {
        id: contact.id,
        name: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || contact.name || 'Unknown',
        imageUri,
        phone,
      };

      setLinking(false);
      return result;
    } catch {
      setLinking(false);
      return null;
    }
  }, []);

  const getContactInfo = useCallback(async (contactId: string): Promise<LinkedContact | null> => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const { data } = await Contacts.getContactsAsync({
        id: contactId,
        fields: [
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.Image,
        ],
      });

      if (data.length === 0) return null;

      const contact = data[0];
      return {
        id: contact.id,
        name: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || contact.name || 'Unknown',
        imageUri: contact.image?.uri ?? null,
        phone: null,
      };
    } catch {
      return null;
    }
  }, []);

  const getContactPhone = useCallback(async (contactId: string): Promise<string | null> => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const { data } = await Contacts.getContactsAsync({
        id: contactId,
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length === 0) return null;

      const phones = data[0].phoneNumbers;
      if (!phones || phones.length === 0) return null;

      return phones[0].number ?? null;
    } catch {
      return null;
    }
  }, []);

  return {
    linking,
    pickContact,
    getContactInfo,
    getContactPhone,
  };
}
