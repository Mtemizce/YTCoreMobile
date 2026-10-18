import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSharing, startSharing, stopSharing } from '../../lib/location';
import { useSession } from '../../lib/session';
import { useTheme } from '../../lib/theme';

export default function Settings() {
  const { session, signOut } = useSession();
  const t = useTheme(session?.site?.theme_color);
  const [sharing, setSharing] = useState(false);
  const canShare = !!session?.site?.features?.location && session.user.role === 'courier';

  useEffect(() => { void isSharing().then(setSharing); }, []);

  const toggle = async (on: boolean) => {
    if (!on) { await stopSharing(); setSharing(false); return; }
    const problem = await startSharing();
    if (problem) { Alert.alert('Konum paylaşımı', problem); setSharing(false); } else setSharing(true);
  };

  const logout = async () => { await stopSharing().catch(() => {}); await signOut(); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: 16, gap: 12 }} edges={['top']}>
      <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 18 }}>{session?.user.name}</Text>
        <Text style={{ color: t.muted }}>{session?.user.role} · {session?.site?.name || session?.server}</Text>
      </View>
      {canShare ? (
        <View style={[s.card, s.row, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontWeight: '600' }}>Konumumu paylaş</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>Ekran kilitliyken de çalışır; teslimat takibi ve "kurye yaklaştı" bildirimi için gerekir.</Text>
          </View>
          <Switch value={sharing} onValueChange={toggle} trackColor={{ true: t.accent }} />
        </View>
      ) : null}
      <Pressable onPress={logout} style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
        <Text style={{ color: t.danger, fontWeight: '600', textAlign: 'center' }}>Çıkış yap</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
