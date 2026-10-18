import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type Site, type User } from './api';

type Stored = { server: string; token: string; user: User; site: Site | null };
type Ctx = {
  ready: boolean; session: Stored | null;
  signIn: (s: Stored) => Promise<void>; signOut: () => Promise<void>;
};
const KEY = 'ytcore.session';
const SessionContext = createContext<Ctx | null>(null);

export const loadSession = async (): Promise<Stored | null> => {
  try { const raw = await SecureStore.getItemAsync(KEY); return raw ? (JSON.parse(raw) as Stored) : null; } catch { return null; }
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Stored | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await loadSession();
      if (stored) {
        try { // jeton hâlâ geçerli mi (panelden kesilmiş olabilir)
          const me = await api.me(stored.server, stored.token);
          setSession({ ...stored, user: me.data });
        } catch (e) { if (!(e instanceof ApiError) || e.status !== 401) setSession(stored); else await SecureStore.deleteItemAsync(KEY); }
      }
      setReady(true);
    })();
  }, []);

  const signIn = useCallback(async (s: Stored) => { await SecureStore.setItemAsync(KEY, JSON.stringify(s)); setSession(s); }, []);
  const signOut = useCallback(async () => {
    const current = session;
    setSession(null);
    await SecureStore.deleteItemAsync(KEY).catch(() => {});
    if (current) await api.logout(current.server, current.token).catch(() => {});
  }, [session]);

  const value = useMemo(() => ({ ready, session, signIn, signOut }), [ready, session, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('SessionProvider eksik');
  return ctx;
}
