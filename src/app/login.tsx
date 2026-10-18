import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, ApiError, type Site } from '../lib/api';
import { setupNotifications } from '../lib/notify';
import { loadSession, useSession } from '../lib/session';
import { useTheme } from '../lib/theme';
import { normalizeServer } from '../lib/url';

const LAST_SERVER = 'ytcore.server';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [server, setServer] = useState('');
  const [site, setSite] = useState<Site | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTheme(site?.theme_color);

  useEffect(() => { SecureStore.getItemAsync(LAST_SERVER).then(v => { if (v) setServer(v); }).catch(() => {}); void loadSession(); }, []);

  // Adres geçerli olunca sitenin adı ve simgesi önizlenir.
  useEffect(() => {
    const origin = normalizeServer(server);
    setSite(null);
    if (!origin) return;
    const timer = setTimeout(() => { api.site(origin).then(setSite).catch(() => {}); }, 500);
    return () => clearTimeout(timer);
  }, [server]);

  const origin = normalizeServer(server);
  const device = `${Device.manufacturer || 'Android'} ${Device.modelName || 'cihaz'}`.slice(0, 120);

  const finish = async (token: string, user: Parameters<typeof signIn>[0]['user']) => {
    if (!origin) return;
    await SecureStore.setItemAsync(LAST_SERVER, origin).catch(() => {});
    await signIn({ server: origin, token, user, site });
    void setupNotifications();
    router.replace('/(app)');
  };

  const submit = async () => {
    if (!origin) { setError('Site adresini https://… biçiminde yazın.'); return; }
    setBusy(true); setError(null);
    try {
      if (challenge) {
        const res = await api.twoFactor(origin, challenge, code.trim());
        await finish(res.token, res.user);
      } else {
        const res = await api.login(origin, login.trim(), password, device);
        if ('two_factor' in res) setChallenge(res.challenge); else await finish(res.token, res.user);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Giriş yapılamadı.');
      if (challenge && e instanceof ApiError && e.status === 400 && /süresi/.test(e.message)) { setChallenge(null); setCode(''); }
    } finally { setBusy(false); }
  };

  const input = [s.input, { backgroundColor: t.card, borderColor: t.border, color: t.text }];
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <View style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
          {site?.icons?.large ? <Image source={{ uri: site.icons.large }} style={s.logo} /> : null}
          <Text style={[s.title, { color: t.text }]}>{site?.name || 'YT Core'}</Text>
          <Text style={{ color: t.muted, marginBottom: 16 }}>{challenge ? 'Doğrulama uygulamanızdaki 6 haneli kodu girin.' : 'Yönetici ya da kurye hesabınızla giriş yapın.'}</Text>

          {!challenge && <>
            <TextInput style={input} value={server} onChangeText={setServer} placeholder="Site adresi (ör. su.firma.com)" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
            <TextInput style={input} value={login} onChangeText={setLogin} placeholder="Kullanıcı adı" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} />
            <TextInput style={input} value={password} onChangeText={setPassword} placeholder="Parola" placeholderTextColor={t.muted} secureTextEntry autoCapitalize="none" onSubmitEditing={submit} />
          </>}
          {challenge && <TextInput style={input} value={code} onChangeText={setCode} placeholder="Doğrulama kodu" placeholderTextColor={t.muted} keyboardType="number-pad" maxLength={8} autoFocus onSubmitEditing={submit} />}

          {error ? <Text style={{ color: t.danger, marginBottom: 10 }}>{error}</Text> : null}
          <Pressable disabled={busy} onPress={submit} style={[s.btn, { backgroundColor: t.accent, opacity: busy ? 0.6 : 1 }]}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{challenge ? 'Doğrula' : 'Giriş yap'}</Text>}
          </Pressable>
          {challenge ? <Pressable onPress={() => { setChallenge(null); setCode(''); setError(null); }}><Text style={{ color: t.muted, textAlign: 'center', marginTop: 14 }}>Vazgeç</Text></Pressable> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, borderWidth: 1, borderRadius: 16, padding: 24 },
  logo: { width: 64, height: 64, borderRadius: 14, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
