import { Alert, Linking } from 'react-native';

/**
 * Strips all characters except digits and a leading '+' for E.164 compatibility.
 */
export function cleanPhoneNumber(phone: string): string {
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/[^\d]/g, '');
  return hasPlus ? `+${digits}` : digits;
}

export async function openWhatsApp(phone: string): Promise<void> {
  const clean = cleanPhoneNumber(phone);
  const text = encodeURIComponent('Hey! Happy Birthday! 🎂');
  const url = `whatsapp://send?phone=${clean}&text=${text}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('App Not Found', 'Please install WhatsApp to use this shortcut.');
  }
}

export async function openIMessage(phone: string): Promise<void> {
  const clean = cleanPhoneNumber(phone);
  const body = encodeURIComponent('Hey! Happy Birthday! 🎂');
  const url = `sms:${clean}?body=${body}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('App Not Found', 'Please install the app to use this shortcut.');
  }
}
