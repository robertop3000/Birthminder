import { Alert, Platform } from 'react-native';
import { showAlert, registerWebAlertHandler } from '../alert';

const platform = Platform as { OS: string };

describe('showAlert', () => {
  const originalOS = platform.OS;

  afterEach(() => {
    platform.OS = originalOS;
    registerWebAlertHandler(null);
    jest.clearAllMocks();
  });

  it('delegates to Alert.alert on native with the original arguments', () => {
    platform.OS = 'ios';
    const buttons = [{ text: 'Cancel', style: 'cancel' as const }, { text: 'Delete' }];
    showAlert('Delete', 'Sure?', buttons);
    expect(Alert.alert).toHaveBeenCalledWith('Delete', 'Sure?', buttons);
  });

  it('routes to the registered host on web', () => {
    platform.OS = 'web';
    const handler = jest.fn();
    registerWebAlertHandler(handler);
    showAlert('Saved', 'Done');
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith({
      title: 'Saved',
      message: 'Done',
      buttons: [{ text: 'OK' }],
    });
  });

  it('falls back to window.confirm on web and runs the confirming button', () => {
    platform.OS = 'web';
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const onCancel = jest.fn();
    const onDelete = jest.fn();
    showAlert('Delete', 'Sure?', [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
    expect(confirmSpy).toHaveBeenCalledWith('Delete\n\nSure?');
    expect(onDelete).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('falls back to window.confirm on web and runs the cancel button when dismissed', () => {
    platform.OS = 'web';
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const onCancel = jest.fn();
    const onDelete = jest.fn();
    showAlert('Delete', undefined, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', onPress: onDelete },
    ]);
    expect(onCancel).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('uses window.alert for single-button alerts on web', () => {
    platform.OS = 'web';
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    const onOk = jest.fn();
    showAlert('Imported!', 'All good', [{ text: 'OK', onPress: onOk }]);
    expect(alertSpy).toHaveBeenCalledWith('Imported!\n\nAll good');
    expect(onOk).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
