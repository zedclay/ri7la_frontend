export type DemoRole = "passenger" | "driver" | "admin";

export type DemoSession = {
  role: DemoRole;
  phone?: string;
  identifier?: string;
};

export type DemoUser = {
  id: string;
  phone: string;
  role: DemoRole;
  verified: boolean;
  profileCompleted: boolean;
  driverOnboardingCompleted: boolean;
  fullName?: string;
  email?: string;
  carMake?: string;
  carModel?: string;
  carColor?: string;
  plateNumber?: string;
  carImageUrl?: string;
  /** Multiple vehicle photos (data URLs or https URLs). */
  carImageUrls?: string[];
};

const KEY_SESSION = "ri7la_demo_session_v1";
const KEY_USERS = "ri7la_demo_users_v1";

function notify() {
  try {
    window.dispatchEvent(new Event("ri7la_demo_session"));
  } catch {
    return;
  }
}

function normalizePhone(input: string) {
  return input.replace(/\s+/g, "").trim();
}

function readUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem(KEY_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((u): u is DemoUser => {
      if (!u || typeof u !== "object") return false;
      const o = u as Partial<DemoUser>;
      return (
        typeof o.id === "string" &&
        typeof o.phone === "string" &&
        (o.role === "passenger" || o.role === "driver" || o.role === "admin") &&
        typeof o.verified === "boolean" &&
        typeof o.profileCompleted === "boolean" &&
        typeof o.driverOnboardingCompleted === "boolean"
      );
    });
  } catch {
    return [];
  }
}

function writeUsers(users: DemoUser[]) {
  try {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  } catch {
    return;
  }
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function setDemoSession(session: DemoSession) {
  try {
    const payload: DemoSession = {
      role: session.role,
      phone: session.phone ? normalizePhone(session.phone) : undefined,
      identifier: session.identifier,
    };
    localStorage.setItem(KEY_SESSION, JSON.stringify(payload));
    notify();
  } catch {
    return;
  }
}

export function getDemoSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const role = (parsed as { role?: unknown }).role;
    if (role !== "passenger" && role !== "driver" && role !== "admin") {
      return null;
    }
    const identifier = (parsed as { identifier?: unknown }).identifier;
    const phone = (parsed as { phone?: unknown }).phone;
    return {
      role,
      identifier: typeof identifier === "string" ? identifier : undefined,
      phone: typeof phone === "string" ? normalizePhone(phone) : undefined,
    };
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(KEY_SESSION);
    notify();
  } catch {
    return;
  }
}

export function findDemoUserByPhone(phone: string): DemoUser | null {
  const normalized = normalizePhone(phone);
  const users = readUsers();
  return users.find((u) => u.phone === normalized) ?? null;
}

export function getCurrentDemoUser(): DemoUser | null {
  const session = getDemoSession();
  const phone = session?.phone ?? session?.identifier;
  if (!phone) return null;
  return findDemoUserByPhone(phone);
}

export function upsertDemoUser(input: { phone: string; role: DemoRole; verified?: boolean }) {
  const phone = normalizePhone(input.phone);
  const users = readUsers();
  const existing = users.find((u) => u.phone === phone);
  if (existing) {
    existing.role = input.role;
    if (typeof input.verified === "boolean") existing.verified = input.verified;
    writeUsers(users);
    return existing;
  }
  const created: DemoUser = {
    id: newId(),
    phone,
    role: input.role,
    verified: input.verified ?? false,
    profileCompleted: false,
    driverOnboardingCompleted: false,
  };
  writeUsers([created, ...users]);
  return created;
}

export function updateCurrentDemoUser(patch: Partial<Omit<DemoUser, "id" | "phone">>) {
  const session = getDemoSession();
  const phone = session?.phone ?? session?.identifier;
  if (!phone) return null;
  const normalized = normalizePhone(phone);
  const users = readUsers();
  const existing = users.find((u) => u.phone === normalized);
  if (!existing) return null;
  Object.assign(existing, patch);
  writeUsers(users);
  notify();
  return existing;
}

export function startDemoSessionForPhone(phone: string) {
  const user = findDemoUserByPhone(phone);
  if (!user) return null;
  setDemoSession({ role: user.role, phone: user.phone, identifier: user.phone });
  return user;
}
