import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { api } from './api';
import { loadSession } from './session';

export const LOCATION_TASK = 'ytcore-courier-location';

// Görev, uygulama kapalı/ekran kilitliyken de çalışır; oturumu depodan okur.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
  if (error || !data?.locations?.length) return;
  const session = await loadSession();
  if (!session) return;
  const last = data.locations[data.locations.length - 1].coords;
  try {
    await api.location(session.server, session.token, {
      lat: last.latitude, lng: last.longitude,
      speed: last.speed !== null && last.speed >= 0 ? last.speed : null,
      heading: last.heading !== null && last.heading >= 0 ? last.heading : null,
    });
  } catch { /* bir sonraki konumda yeniden denenir */ }
});

export const isSharing = () => Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false);

export async function startSharing(): Promise<string | null> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return 'Konum izni verilmedi.';
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) return 'Ekran kilitliyken paylaşım için konum iznini "Her zaman izin ver" yapın.';
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10_000,
    distanceInterval: 15,
    pausesUpdatesAutomatically: false,
    foregroundService: { notificationTitle: 'Konum paylaşılıyor', notificationBody: 'Teslimat takibi için konumunuz iletiliyor.', notificationColor: '#4f46e5' },
  });
  return null;
}

export const stopSharing = async () => { if (await isSharing()) await Location.stopLocationUpdatesAsync(LOCATION_TASK); };
