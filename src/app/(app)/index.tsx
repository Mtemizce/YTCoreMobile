import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, type Tile } from '../../lib/api';
import { useEvents } from '../../lib/events';
import { useSession } from '../../lib/session';
import { useTheme } from '../../lib/theme';

export default function Home() {
  const { session } = useSession();
  const events = useEvents();
  const t = useTheme(session?.site?.theme_color);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    try { setTiles((await api.dashboard(session.server, session.token)).data.items); } catch { /* sessiz */ } finally { setBusy(false); }
  }, [session]);
  useEffect(() => { void load(); const i = setInterval(load, 60_000); return () => clearInterval(i); }, [load]);

  const tone = (x?: string) => (x === 'danger' ? t.danger : x === 'warn' ? '#d97706' : x === 'ok' ? '#16a34a' : t.text);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 8 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
        data={events}
        keyExtractor={e => String(e.id)}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 8 }}>
            <Text style={[s.hello, { color: t.text }]}>Merhaba, {session?.user.name}</Text>
            <View style={s.grid}>
              {tiles.map(x => (
                <View key={x.key} style={[s.tile, { backgroundColor: t.card, borderColor: t.border }]}>
                  <Text style={{ color: t.muted, fontSize: 13 }}>{x.label}</Text>
                  <Text style={{ color: tone(x.tone), fontSize: 26, fontWeight: '700' }}>{x.value}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.section, { color: t.muted }]}>Son bildirimler</Text>
          </View>
        }
        ListEmptyComponent={<Text style={{ color: t.muted }}>Henüz yeni bildirim yok.</Text>}
        renderItem={({ item }) => (
          <View style={[s.event, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.text, fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ color: t.muted }}>{item.body}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hello: { fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexGrow: 1, flexBasis: 150, borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  section: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 8 },
  event: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
});
