import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useKeepAwake } from 'expo-keep-awake';
import { api } from '../lib/api';
import { useSession } from '../lib/session';
import { useTheme } from '../lib/theme';
import { safePath } from '../lib/url';

/** Siteyi tek kullanımlık bilet ile açar; yalnızca sitenin kendi adresinde gezinmeye izin verir. */
export function WebScreen({ path, awake = false }: { path: string; awake?: boolean }) {
  const { session } = useSession();
  const t = useTheme(session?.site?.theme_color);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  if (awake) useKeepAwake();

  const load = useCallback(async () => {
    if (!session) return;
    setUrl(null); setError(null);
    try { setUrl((await api.webSession(session.server, session.token, safePath(path))).url); }
    catch (e) { setError(e instanceof Error ? e.message : 'Sayfa açılamadı.'); }
  }, [session, path]);

  useEffect(() => { void load(); }, [load, nonce]);

  if (error) return (
    <View style={[s.center, { backgroundColor: t.bg }]}>
      <Text style={{ color: t.danger, marginBottom: 12, textAlign: 'center' }}>{error}</Text>
      <Pressable style={[s.btn, { backgroundColor: t.accent }]} onPress={() => setNonce(n => n + 1)}><Text style={s.btnText}>Yeniden dene</Text></Pressable>
    </View>
  );
  if (!url || !session) return <View style={[s.center, { backgroundColor: t.bg }]}><ActivityIndicator color={t.accent} /></View>;

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1, backgroundColor: t.bg }}
      originWhitelist={[session.server]}
      onShouldStartLoadWithRequest={req => req.url.startsWith(session.server) || req.url === 'about:blank'}
      sharedCookiesEnabled
      pullToRefreshEnabled
      setSupportMultipleWindows={false}
      onHttpError={e => { if (e.nativeEvent.statusCode === 401 || e.nativeEvent.statusCode === 403) setNonce(n => n + 1); }}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});
