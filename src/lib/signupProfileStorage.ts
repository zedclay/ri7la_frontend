const KEY = "saafirSignupProfile";

export type SignupProfilePayload = {
  fullName: string;
  email: string;
};

export function writeSignupProfile(p: SignupProfilePayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    KEY,
    JSON.stringify({ fullName: p.fullName.trim(), email: p.email.trim().toLowerCase() })
  );
}

export function readSignupProfile(): SignupProfilePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { fullName?: string; email?: string };
    if (typeof j.fullName !== "string" || typeof j.email !== "string") return null;
    return { fullName: j.fullName, email: j.email };
  } catch {
    return null;
  }
}

export function clearSignupProfile() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
