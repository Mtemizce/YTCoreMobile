import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { api, ApiError, type AppEvent } from './api';
import { showLocal } from './notify';
import { useSession } from './session';

const POLL_MS = 15_000;
const Ctx = createContext<AppEvent[]>([]);
export const useEvents = () => useContext(Ctx);

/** Uygulama açıkken bildirimleri yoklar, yenileri yerel bildirim olarak gösterir. (Kapalıyken push: sonraki adım.) */
export function EventsProvider({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!session) return;
    let stop = false;
    last.current = null;
    const tick = async () => {
      if (AppState.currentState !== 'active') return;
      try {
        if (last.current === null) { last.current = (await api.notifications(session.server, session.token)).last_id; return; }
        const res = await api.notifications(session.server, session.token, last.current);
        if (stop || !res.data.length) return;
        last.current = res.last_id;
        res.data.forEach(e => void showLocal(e.title, e.body));
        setEvents(prev => [...res.data.slice().reverse(), ...prev].slice(0, 50));
      } catch (e) { if (e instanceof ApiError && e.status === 401) void signOut(); }
    };
    void tick();
    const timer = setInterval(tick, POLL_MS);
    return () => { stop = true; clearInterval(timer); };
  }, [session, signOut]);

  return <Ctx.Provider value={events}>{children}</Ctx.Provider>;
}
