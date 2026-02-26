const ADMIN_TOKEN_KEY = "ozone_admin_token";

/** Base URL бэкенда (из .env VITE_API_URL). Пусто = тот же домен. */
export function getApiBase(): string {
  const u = import.meta.env.VITE_API_URL;
  if (typeof u !== "string" || !u.trim()) return "";
  return String(u).replace(/\/$/, "");
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getAdminToken();
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) (h as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  return h;
}
