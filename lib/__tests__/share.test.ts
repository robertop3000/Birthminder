import { Platform, Share } from 'react-native';
import { shareText } from '../share';

const platform = Platform as { OS: string };

describe('shareText', () => {
  const originalOS = platform.OS;
  const originalShare = (navigator as { share?: unknown }).share;
  const originalClipboard = (navigator as { clipboard?: unknown }).clipboard;

  afterEach(() => {
    platform.OS = originalOS;
    Object.defineProperty(navigator, 'share', { value: originalShare, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    jest.clearAllMocks();
  });

  it('uses the native share sheet on iOS', async () => {
    platform.OS = 'ios';
    const outcome = await shareText('hello');
    expect(Share.share).toHaveBeenCalledWith({ message: 'hello' });
    expect(outcome).toBe('shared');
  });

  it('uses navigator.share on web when available', async () => {
    platform.OS = 'web';
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    const outcome = await shareText('hello');
    expect(share).toHaveBeenCalledWith({ text: 'hello' });
    expect(outcome).toBe('shared');
    expect(Share.share).not.toHaveBeenCalled();
  });

  it('reports dismissed when the user cancels the web share sheet', async () => {
    platform.OS = 'web';
    const abort = new Error('cancelled');
    abort.name = 'AbortError';
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockRejectedValue(abort),
      configurable: true,
    });
    expect(await shareText('hello')).toBe('dismissed');
  });

  it('copies to the clipboard on web when navigator.share is missing', async () => {
    platform.OS = 'web';
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const outcome = await shareText('hello https://example.com');
    expect(writeText).toHaveBeenCalledWith('hello https://example.com');
    expect(outcome).toBe('copied');
  });

  it('reports failed when neither API exists', async () => {
    platform.OS = 'web';
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    expect(await shareText('hello')).toBe('failed');
  });
});
