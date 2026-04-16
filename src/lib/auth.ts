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

const KEY = "saafir_auth_tokens_v1";
const LEGACY_KEY = "saafir_auth_tokens_v1";

function notify() {
  try {
    window.dispatchEvent(new Event("saafir_auth"));
    window.dispatchEvent(new Event("saafir_auth"));
  } catch {
    return;
  }
}

export function getAuthTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const accessToken = (parsed as { accessToken?: unknown }).accessToken;
    const refreshToken = (parsed as { refreshToken?: unknown }).refreshToken;
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") return null;
    const tokens = { accessToken, refreshToken };
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && !localStorage.getItem(KEY)) {
        localStorage.setItem(KEY, JSON.stringify(tokens));
        localStorage.removeItem(LEGACY_KEY);
      }
    } catch {
      return tokens;
    }
    return tokens;
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
