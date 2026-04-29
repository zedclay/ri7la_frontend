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

function notify() {
  try {
    window.dispatchEvent(new Event("saafir_auth"));
  } catch {
    return;
  }
}

export function getAuthTokens(): AuthTokens | null {
  return null;
}

export function setAuthTokens(tokens: AuthTokens) {
  void tokens;
  notify();
}

export function clearAuth() {
  notify();
}

export function getAccessToken() {
  return null;
}
