import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'Bildirimler', importance: Notifications.AndroidImportance.HIGH });
  }
  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) await Notifications.requestPermissionsAsync();
}

export const showLocal = (title: string, body: string) =>
  Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null }).catch(() => {});
