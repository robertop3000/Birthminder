import { Linking, Platform } from 'react-native';
import { showAlert } from './alert';

const GREETING = 'Hey! Happy Birthday! 🎂';

/**
 * Strips all characters except digits and a leading '+' for E.164 compatibility.
 */
export function cleanPhoneNumber(phone: string): string {
  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/[^\d]/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Builds the WhatsApp deep link for a phone number.
 * Native uses the `whatsapp://` scheme; web uses the universal `wa.me` link,
 * which works in every browser and opens the app where installed.
 */
export function buildWhatsAppUrl(phone: string): string {
  const clean = cleanPhoneNumber(phone);
  const text = encodeURIComponent(GREETING);
  if (Platform.OS === 'web') {
    return `https://wa.me/${clean.replace(/^\+/, '')}?text=${text}`;
  }
  return `whatsapp://send?phone=${clean}&text=${text}`;
}

export function buildSmsUrl(phone: string): string {
  const clean = cleanPhoneNumber(phone);
  const body = encodeURIComponent(GREETING);
  return `sms:${clean}?body=${body}`;
}

export async function openWhatsApp(phone: string): Promise<void> {
  try {
    await Linking.openURL(buildWhatsAppUrl(phone));
  } catch {
    showAlert('App Not Found', 'Please install WhatsApp to use this shortcut.');
  }
}

export async function openIMessage(phone: string): Promise<void> {
  try {
    await Linking.openURL(buildSmsUrl(phone));
  } catch {
    showAlert('App Not Found', 'Please install the app to use this shortcut.');
  }
}
