export function apiBaseUrl() {
  const internal = process.env.API_INTERNAL_BASE_URL?.trim();
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (typeof window === "undefined") {
    if (internal) return internal.replace(/\/+$/, "");
    if (configured) return configured.replace(/\/+$/, "");
    return "http://127.0.0.1:4000";
  }
  if (configured) return configured.replace(/\/+$/, "");
  return "";
}

/** Parses Nest `HttpExceptionFilter` JSON: `{ success: false, error: { message } }` */
function messageFromErrorBody(body: string): string | null {
  try {
    const j = JSON.parse(body) as {
      success?: boolean;
      error?: { message?: string | string[] };
    };
    if (j?.success !== false || !j.error?.message) return null;
    const m = j.error.message;
    return Array.isArray(m) ? m.join(", ") : String(m);
  } catch {
    return null;
  }
}

function throwHttpError(status: number, statusText: string, body: string): never {
  const fromApi = messageFromErrorBody(body);
  throw new Error(fromApi ?? `Request failed (${status} ${statusText})`);
}

type ApiSuccessEnvelope<T> = { success: true; data: T };

function unwrapData<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === "object" &&
    "success" in raw &&
    (raw as { success: unknown }).success === true &&
    "data" in raw
  ) {
    return (raw as ApiSuccessEnvelope<T>).data;
  }
  throw new Error("Unexpected API response (expected { success: true, data })");
}

/** POST and return the nested `data` payload (Nest `ResponseTransformInterceptor`). */
export async function apiPostJsonData<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const raw = await apiPostJson<unknown>(path, body, init);
  return unwrapData<T>(raw);
}

export async function apiPatchJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  const initHeaders = normalizeHeaders(init);
  const res = await fetch(url, {
    ...init,
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...initHeaders,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throwHttpError(res.status, res.statusText, text);
  }
  return (await res.json()) as T;
}

export async function apiPatchJsonData<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const raw = await apiPatchJson<unknown>(path, body, init);
  return unwrapData<T>(raw);
}

/** GET and return the nested `data` payload. */
export async function apiGetJsonData<T>(path: string, init?: RequestInit): Promise<T> {
  const raw = await apiGetJson<unknown>(path, init);
  return unwrapData<T>(raw);
}

function normalizeHeaders(init?: RequestInit): Record<string, string> {
  if (!init?.headers) return {};
  const h = new Headers(init.headers);
  return Object.fromEntries(h.entries());
}

export async function apiGetJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  const initHeaders = normalizeHeaders(init);
  const res = await fetch(url, {
    ...init,
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...initHeaders,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throwHttpError(res.status, res.statusText, text);
  }
  return (await res.json()) as T;
}

export async function apiPostJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
  const initHeaders = normalizeHeaders(init);
  const res = await fetch(url, {
    ...init,
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...initHeaders,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throwHttpError(res.status, res.statusText, text);
  }
  return (await res.json()) as T;
}
