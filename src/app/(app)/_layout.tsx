import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { EventsProvider } from '../../lib/events';
import { useSession } from '../../lib/session';
import { useTheme } from '../../lib/theme';

export default function AppLayout() {
  const { ready, session } = useSession();
  const t = useTheme(session?.site?.theme_color);
  if (!ready) return null;
  if (!session) return <Redirect href="/login" />;

  const isCourier = session.user.role === 'courier';
  const site = session.site;
  return (
    <EventsProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: t.accent, tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border } }}>
        <Tabs.Screen name="index" options={{ title: 'Özet', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color as string} size={size} /> }} />
        <Tabs.Screen name="panel" options={{ title: 'Panel', href: isCourier ? null : undefined, tabBarIcon: ({ color, size }) => <Ionicons name="desktop-outline" color={color as string} size={size} /> }} />
        <Tabs.Screen name="courier" options={{ title: site?.courier?.label || 'Teslimat', href: site?.courier ? undefined : null, tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" color={color as string} size={size} /> }} />
        <Tabs.Screen name="board" options={{ title: site?.board?.label || 'Ekran', href: site?.board && !isCourier ? undefined : null, tabBarIcon: ({ color, size }) => <Ionicons name="tv-outline" color={color as string} size={size} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Ayarlar', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color as string} size={size} /> }} />
      </Tabs>
    </EventsProvider>
  );
}
