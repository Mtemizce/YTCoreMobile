import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../lib/location'; // arka plan görevi uygulama açılışında tanımlanmalı
import { SessionProvider } from '../lib/session';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SessionProvider>
  );
}
