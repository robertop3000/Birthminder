import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert dialogs.
 *
 * `react-native-web` ships `Alert` as a no-op, so every confirmation and
 * error dialog in the app would silently do nothing on web. `showAlert`
 * keeps the native `Alert.alert` signature and, on web, hands the request
 * to the `AlertHost` component (a themed modal). If no host is mounted it
 * falls back to the browser's `confirm`/`alert` dialogs.
 */

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
}

export interface AlertRequest {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export type WebAlertHandler = (request: AlertRequest) => void;

let webHandler: WebAlertHandler | null = null;

/** Registered by `AlertHost` on web. Pass `null` to unregister. */
export function registerWebAlertHandler(handler: WebAlertHandler | null): void {
  webHandler = handler;
}

function browserFallback(request: AlertRequest): void {
  const text = request.message ? `${request.title}\n\n${request.message}` : request.title;

  if (request.buttons.length <= 1) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(text);
    }
    request.buttons[0]?.onPress?.();
    return;
  }

  const cancel = request.buttons.find((b) => b.style === 'cancel') ?? request.buttons[0];
  const confirm =
    [...request.buttons].reverse().find((b) => b !== cancel) ??
    request.buttons[request.buttons.length - 1];

  const accepted =
    typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm(text)
      : false;

  (accepted ? confirm : cancel).onPress?.();
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    // Forward exactly the arguments given (tests assert on the native call shape).
    if (buttons) Alert.alert(title, message, buttons);
    else Alert.alert(title, message);
    return;
  }

  const request: AlertRequest = {
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
  };

  if (webHandler) {
    webHandler(request);
    return;
  }

  browserFallback(request);
}
