import { Alert, Platform } from 'react-native';

// Alert.alert with multiple buttons renders nothing on web (react-native-web
// doesn't implement a multi-button native dialog) — confirmations silently
// no-op there. Route web through window.confirm instead; native keeps the
// real Alert with separate Cancel/Confirm labels.
export function confirmDestructive(
  title: string,
  message: string,
  confirmText: string,
  cancelText = 'Cancel'
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
