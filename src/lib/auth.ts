export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string | null;
  phoneE164: string | null;
  status: string;
  roles: Array<"PASSENGER" | "DRIVER" | "ADMIN">;
};

const KEY = "ri7la_auth_tokens_v1";

function notify() {
  try {
    window.dispatchEvent(new Event("ri7la_auth"));
  } catch {
    return;
  }
}

export function getAuthTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const accessToken = (parsed as { accessToken?: unknown }).accessToken;
    const refreshToken = (parsed as { refreshToken?: unknown }).refreshToken;
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") return null;
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

export function setAuthTokens(tokens: AuthTokens) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens));
    notify();
  } catch {
    return;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(KEY);
    notify();
  } catch {
    return;
  }
}

export function getAccessToken() {
  return getAuthTokens()?.accessToken ?? null;
}

