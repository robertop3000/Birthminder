import { Platform, Share } from 'react-native';

export type ShareOutcome = 'shared' | 'copied' | 'dismissed' | 'failed';

/**
 * Shares a text message on any platform.
 *
 * - Native: the system share sheet.
 * - Web with the Web Share API (most mobile browsers): the browser share sheet.
 * - Web without it (most desktop browsers): copies the message to the
 *   clipboard and reports `'copied'` so the caller can tell the user.
 */
export async function shareText(message: string): Promise<ShareOutcome> {
  if (Platform.OS !== 'web') {
    await Share.share({ message });
    return 'shared';
  }

  const nav = typeof navigator !== 'undefined' ? navigator : undefined;

  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ text: message });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'dismissed';
      // Fall through to the clipboard.
    }
  }

  if (nav?.clipboard && typeof nav.clipboard.writeText === 'function') {
    try {
      await nav.clipboard.writeText(message);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
