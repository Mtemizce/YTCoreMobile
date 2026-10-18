import { normalizeServer } from './url';

export type User = { id: number; name: string; username: string; role: string; email: string | null; phone: string | null; title: string | null };
export type Site = {
  app: string; name: string; theme_color: string | null; logo: string | null;
  icons: { small: string; large: string; favicon: string };
  board?: { path: string; label: string } | null;
  courier?: { path: string; label: string } | null;
  features?: { location?: boolean };
};
export type Tile = { key: string; label: string; value: string | number; tone?: string };
export type AppEvent = { id: number; kind: string; title: string; body: string; url: string | null; created_at: string };
export type LoginResult = { token: string; user: User } | { two_factor: true; challenge: string };

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

type Opts = { token?: string; method?: 'GET' | 'POST'; body?: unknown; signal?: AbortSignal };

async function request<T>(server: string, path: string, opts: Opts = {}): Promise<T> {
  const origin = normalizeServer(server);
  if (!origin) throw new ApiError('Site adresi geçersiz (https:// ile başlamalı).', 0);
  let res: Response;
  try {
    res = await fetch(`${origin}/api/v1${path}`, {
      method: opts.method || 'GET',
      headers: { Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch { throw new ApiError('Sunucuya ulaşılamadı. Bağlantıyı ve adresi kontrol edin.', 0); }
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.message || `İstek başarısız (${res.status}).`, res.status);
  return json as T;
}

export const api = {
  site: (server: string) => request<Site>(server, ''),
  login: (server: string, login: string, password: string, device: string) =>
    request<LoginResult>(server, '/auth/login', { method: 'POST', body: { login, password, device_name: device, platform: 'android' } }),
  twoFactor: (server: string, challenge: string, code: string) =>
    request<{ token: string; user: User }>(server, '/auth/two-factor', { method: 'POST', body: { challenge, code } }),
  logout: (server: string, token: string) => request<void>(server, '/auth/logout', { method: 'POST', token }),
  me: (server: string, token: string) => request<{ data: User }>(server, '/me', { token }),
  dashboard: (server: string, token: string) => request<{ data: { items: Tile[]; badge: number | null } }>(server, '/dashboard', { token }),
  notifications: (server: string, token: string, after?: number) =>
    request<{ data: AppEvent[]; last_id: number }>(server, after === undefined ? '/notifications' : `/notifications?after=${after}`, { token }),
  webSession: (server: string, token: string, path: string) => request<{ url: string }>(server, '/auth/web-session', { method: 'POST', token, body: { path } }),
  location: (server: string, token: string, body: { lat: number; lng: number; speed?: number | null; heading?: number | null }) =>
    request<void>(server, '/location', { method: 'POST', token, body }),
};
