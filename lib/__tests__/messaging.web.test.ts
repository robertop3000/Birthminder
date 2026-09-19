import { Platform } from 'react-native';
import { buildWhatsAppUrl, buildSmsUrl, cleanPhoneNumber } from '../messaging';

const platform = Platform as { OS: string };

describe('messaging links', () => {
  const originalOS = platform.OS;

  afterEach(() => {
    platform.OS = originalOS;
  });

  it('cleans phone numbers to digits with an optional leading plus', () => {
    expect(cleanPhoneNumber('+1 (555) 010-2020')).toBe('+15550102020');
    expect(cleanPhoneNumber('555 010 2020')).toBe('5550102020');
  });

  it('uses the whatsapp:// scheme on iOS', () => {
    platform.OS = 'ios';
    expect(buildWhatsAppUrl('+1 555-010-2020')).toBe(
      'whatsapp://send?phone=+15550102020&text=Hey!%20Happy%20Birthday!%20%F0%9F%8E%82'
    );
  });

  it('uses a wa.me link without the plus on web', () => {
    platform.OS = 'web';
    expect(buildWhatsAppUrl('+1 555-010-2020')).toBe(
      'https://wa.me/15550102020?text=Hey!%20Happy%20Birthday!%20%F0%9F%8E%82'
    );
  });

  it('builds an sms: link with a prefilled body', () => {
    expect(buildSmsUrl('+1 555-010-2020')).toBe(
      'sms:+15550102020?body=Hey!%20Happy%20Birthday!%20%F0%9F%8E%82'
    );
  });
});
