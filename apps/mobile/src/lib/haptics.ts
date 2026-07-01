import * as Haptics from 'expo-haptics';

// Tactile feedback for key game moments. Fire-and-forget: a failed haptic
// (unsupported device, missing motor) must never block the flow.
export const haptics = {
  success: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  warning: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); },
  error: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); },
  tap: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); },
};
