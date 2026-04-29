import { apiGetJsonData } from "@/lib/api";

/**
 * Cached GET /api/users/me for client components (header, guards).
 * Reduces duplicate network work when layouts remount on navigation.
 */
export type UserMeClientPayload = {
  id: string;
  roles: string[];
  fullName: string;
  phoneE164: string | null;
  driverVerification?: {
    fullyVerified: boolean;
    slots: { identity: string; license: string; vehiclePhotos: string; otherDocs: string };
    adminComment: string | null;
  };
  passengerVerification?: {
    identityVerified: boolean;
    identity: string;
    adminComment: string | null;
  };
};

const TTL_MS = 45_000;

let cache: { sig: string; at: number; data: UserMeClientPayload } | null = null;
let inflight: Promise<UserMeClientPayload | null> | null = null;

export function invalidateUserMeClientCache(): void {
  cache = null;
  inflight = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("saafir_auth", () => invalidateUserMeClientCache());
}

export async function fetchUserMeClientCached(): Promise<UserMeClientPayload | null> {
  const sig = "cookie";

  const now = Date.now();
  if (cache && cache.sig === sig && now - cache.at < TTL_MS) {
    return cache.data;
  }

  if (inflight) {
    return inflight;
  }

  inflight = apiGetJsonData<UserMeClientPayload>("/api/users/me")
    .then((data) => {
      cache = { sig, at: Date.now(), data };
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
