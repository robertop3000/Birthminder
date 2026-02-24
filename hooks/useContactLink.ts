import { useState, useCallback } from 'react';
import * as Contacts from 'expo-contacts';

export interface LinkedContact {
  id: string;
  name: string;
  imageUri: string | null;
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

      const result: LinkedContact = {
        id: contact.id,
        name: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || contact.name || 'Unknown',
        imageUri: contact.image?.uri ?? null,
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
