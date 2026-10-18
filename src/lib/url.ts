/** Kullanıcının yazdığı site adresini güvenli bir kök adrese çevirir; geçersizse null. Yalnızca https. */
export function normalizeServer(input: string): string | null {
  let value = input.trim();
  if (!value) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname.includes('.') || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

/** Panel yolu yalnızca site içi mutlak bir yol olabilir (açık yönlendirme engeli). */
export const safePath = (path: string): string => (/^\/(?!\/)[\w\-./]*$/.test(path) ? path : '/');
