"use client";

import { apiGetJsonData, apiPatchJsonData, apiPostJsonData } from "@/lib/api";
import { formatAuditAction } from "@/lib/auditActionLabels";
import { fetchUserMeClientCached } from "@/lib/userMeClientCache";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  fullName: string;
  email: string | null;
  phoneE164: string | null;
  status: string;
  roles: string[];
  createdAt: string;
};

type UserDetail = UserRow & {
  preferredLanguage?: string | null;
  lastLoginAt?: string | null;
  phoneVerifiedAt?: string | null;
  stats: {
    tripCount: number;
    bookingCount: number;
    tripsByStatus: Record<string, number>;
    bookingsByStatus: Record<string, number>;
  };
  driverVerification: {
    userId: string;
    fullyVerified: boolean;
    identity: string;
    license: string;
    vehiclePhotos: string;
    otherDocs: string;
    adminComment: string | null;
    updatedAt: string | null;
  } | null;
  passengerVerification: {
    userId: string;
    identityVerified: boolean;
    identity: string;
    adminComment: string | null;
    updatedAt: string | null;
  } | null;
  recentAudit: {
    id: string;
    action: string;
    metadata: unknown;
    createdAt: string;
    actor: { id: string; fullName: string } | null;
  }[];
};

type ListResponse = { items: UserRow[]; total: number; offset: number; limit: number };

const ASSIGNABLE_ROLES = ["PASSENGER", "DRIVER", "ADMIN"] as const;

function statusClass(status: string) {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "bg-primary-fixed/40 text-on-primary-fixed-variant";
  if (s === "SUSPENDED") return "bg-tertiary-fixed/60 text-on-tertiary-fixed";
  if (s === "BANNED" || s === "DELETED") return "bg-error-container text-on-error-container";
  return "bg-surface-container-high text-on-surface";
}

function isForbiddenMessage(msg: string) {
  return /403|forbidden|not allowed/i.test(msg);
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

function slotClass(slot: string) {
  const s = slot.toLowerCase();
  if (s === "approved") return "bg-primary-fixed/35 text-on-primary-fixed-variant";
  if (s === "rejected") return "bg-error-container text-on-error-container";
  return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
}

export function AdminUsersClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [panelUser, setPanelUser] = useState<UserRow | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    void fetchUserMeClientCached()
      .then((me) => setMyUserId(me?.id ?? null))
      .catch(() => setMyUserId(null));
  }, []);

  useEffect(() => {
    if (!panelUser) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    void apiGetJsonData<UserDetail>(`/api/admin/users/${encodeURIComponent(panelUser.id)}`)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setDetailError(e instanceof Error ? e.message : "Failed to load user detail");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panelUser?.id]);

  const refreshDetail = useCallback(async (userId: string) => {
    try {
      const d = await apiGetJsonData<UserDetail>(`/api/admin/users/${encodeURIComponent(userId)}`);
      setDetail(d);
      setDetailError(null);
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Failed to refresh user detail");
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      qs.set("offset", "0");
      if (q.trim()) qs.set("q", q.trim());
      if (statusFilter) qs.set("status", statusFilter);
      const res = await apiGetJsonData<ListResponse>(`/api/admin/users?${qs.toString()}`);
      setData(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load users";
      setError(
        isForbiddenMessage(msg)
          ? `${msg} — Use an account with the ADMIN role (after seed: admin@ri7la.dz / Ri7la1234). Re-login after roles change.`
          : msg
      );
      setData(null);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 400);
    return () => window.clearTimeout(t);
  }, [load]);

  async function setStatus(userId: string, status: string) {
    setBusyId(userId);
    setError(null);
    try {
      await apiPatchJsonData(`/api/admin/users/${encodeURIComponent(userId)}/status`, { status });
      await load();
      setPanelUser((p) => {
        if (p?.id === userId) {
          void refreshDetail(userId);
          return { ...p, status };
        }
        return p;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function addRole(userId: string, role: string) {
    setBusyId(userId);
    setError(null);
    try {
      const updated = await apiPostJsonData<UserRow>(`/api/admin/users/${encodeURIComponent(userId)}/roles`, { role });
      await load();
      setPanelUser((p) => {
        if (p?.id === userId) {
          void refreshDetail(userId);
          return { ...p, roles: updated.roles };
        }
        return p;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add role");
    } finally {
      setBusyId(null);
    }
  }

  async function removeRole(userId: string, role: string) {
    if (role === "ADMIN" && !window.confirm("Remove ADMIN from this user? They will lose admin API access on next login.")) {
      return;
    }
    setBusyId(userId);
    setError(null);
    try {
      const updated = await apiPostJsonData<UserRow>(`/api/admin/users/${encodeURIComponent(userId)}/roles/remove`, {
        role,
      });
      await load();
      setPanelUser((p) => {
        if (p?.id === userId) {
          void refreshDetail(userId);
          return { ...p, roles: updated.roles };
        }
        return p;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove role");
    } finally {
      setBusyId(null);
    }
  }

  function copyId(id: string) {
    void navigator.clipboard.writeText(id).catch(() => null);
  }

  const filters: { label: string; value?: string }[] = [
    { label: "All", value: undefined },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Banned", value: "BANNED" },
    { label: "Deleted", value: "DELETED" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">User management</h1>
          <p className="mt-1 text-on-surface-variant">
            Search users, change account status, and assign or remove roles (PASSENGER, DRIVER, ADMIN). Click a row to open a
            full profile (verification, activity, audit). Actions are audited.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
            <MaterialIcon name="search" className="!text-xl text-on-surface-variant" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
              placeholder="Search name, email, phone…"
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-on-surface outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setStatusFilter(t.value)}
                className={
                  statusFilter === t.value
                    ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                    : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto overflow-hidden rounded-xl border border-outline-variant/10">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-12 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <div className="col-span-3">User</div>
              <div className="col-span-2">Roles</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            {!data ? (
              <div className="px-4 py-8 text-center text-sm text-on-surface-variant">Loading…</div>
            ) : (
              data.items.map((u) => {
                const isSelf = myUserId === u.id;
                return (
                  <div
                    key={u.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPanelUser(u)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPanelUser(u);
                      }
                    }}
                    className="grid grid-cols-12 cursor-pointer items-center border-t border-outline-variant/10 px-4 py-4 text-sm outline-none transition hover:bg-surface-container-low/50 focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="col-span-3 flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                        {u.fullName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-extrabold text-on-surface">{u.fullName}</div>
                        <div className="truncate text-[10px] font-bold text-on-surface-variant">{u.email ?? u.phoneE164 ?? "—"}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyId(u.id);
                          }}
                          className="mt-0.5 font-mono text-[9px] font-bold text-primary hover:underline"
                          title="Copy user id"
                        >
                          {u.id.slice(0, 8)}… copy
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {(u.roles.length ? u.roles : ["—"]).map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-extrabold text-on-surface"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${statusClass(u.status)}`}>
                        {u.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-[10px] font-bold text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                    <div
                      className="col-span-3 flex flex-wrap items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => setPanelUser(u)}
                        className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-extrabold text-on-surface disabled:opacity-50"
                      >
                        Details
                      </button>
                      {!isSelf && u.status === "ACTIVE" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => void setStatus(u.id, "SUSPENDED")}
                          className="rounded-full bg-tertiary-container/40 px-3 py-2 text-xs font-extrabold text-on-surface disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      ) : null}
                      {!isSelf && u.status === "SUSPENDED" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => void setStatus(u.id, "ACTIVE")}
                          className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-extrabold text-on-surface disabled:opacity-50"
                        >
                          Unsuspend
                        </button>
                      ) : null}
                      {!isSelf && u.status !== "BANNED" && u.status !== "DELETED" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => {
                            if (window.confirm("Ban this user? They will not be able to sign in until reactivated.")) {
                              void setStatus(u.id, "BANNED");
                            }
                          }}
                          className="rounded-full bg-error-container px-3 py-2 text-xs font-extrabold text-on-error-container disabled:opacity-50"
                        >
                          Ban
                        </button>
                      ) : null}
                      {!isSelf && (u.status === "BANNED" || u.status === "DELETED") ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => void setStatus(u.id, "ACTIVE")}
                          className="rounded-full bg-primary px-3 py-2 text-xs font-extrabold text-on-primary disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      ) : null}
                      {!isSelf && u.status !== "DELETED" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Mark account as DELETED? The user will be blocked from signing in. You can reactivate to ACTIVE later."
                              )
                            ) {
                              void setStatus(u.id, "DELETED");
                            }
                          }}
                          className="rounded-full border border-outline-variant px-3 py-2 text-xs font-extrabold text-on-surface-variant disabled:opacity-50"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {data ? (
          <div className="mt-4 text-center text-xs font-bold text-on-surface-variant">
            Showing {data.items.length} of {data.total}
          </div>
        ) : null}
      </div>

      {panelUser ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-user-panel-title"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="admin-user-panel-title" className="font-headline text-xl font-extrabold text-on-surface">
                  {panelUser.fullName}
                </h2>
                <p className="text-xs text-on-surface-variant">{panelUser.email ?? panelUser.phoneE164}</p>
              </div>
              <button
                type="button"
                onClick={() => setPanelUser(null)}
                className="rounded-full p-2 hover:bg-surface-container-low"
                aria-label="Close"
              >
                <MaterialIcon name="close" className="!text-xl" />
              </button>
            </div>

            {detailError ? (
              <div className="mb-4 rounded-xl border border-error-container bg-error-container/15 px-3 py-2 text-xs text-on-error-container">
                {detailError}
              </div>
            ) : null}

            {detailLoading ? (
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  aria-hidden
                />
                Loading profile…
              </div>
            ) : null}

            <div className="space-y-6 text-sm">
              {detail ? (
                <>
                  <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Account</div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Email</dt>
                        <dd className="break-all font-medium">{detail.email ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Phone</dt>
                        <dd className="font-medium">{detail.phoneE164 ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Language</dt>
                        <dd>{detail.preferredLanguage ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Phone verified at</dt>
                        <dd>{fmtDate(detail.phoneVerifiedAt ?? undefined)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Member since</dt>
                        <dd>{fmtDate(String(detail.createdAt))}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold text-on-surface-variant">Last login</dt>
                        <dd>{fmtDate(detail.lastLoginAt ?? undefined)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Activity</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-2xl font-extrabold text-on-surface">{detail.stats.tripCount}</div>
                        <div className="text-xs text-on-surface-variant">Trips (as owner)</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.keys(detail.stats.tripsByStatus).length === 0 ? (
                            <span className="text-xs text-on-surface-variant">—</span>
                          ) : (
                            Object.entries(detail.stats.tripsByStatus).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant"
                              >
                                {k}: {v}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-on-surface">{detail.stats.bookingCount}</div>
                        <div className="text-xs text-on-surface-variant">Bookings (as passenger)</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.keys(detail.stats.bookingsByStatus).length === 0 ? (
                            <span className="text-xs text-on-surface-variant">—</span>
                          ) : (
                            Object.entries(detail.stats.bookingsByStatus).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant"
                              >
                                {k}: {v}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {detail.driverVerification ? (
                    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          Driver verification
                        </div>
                        {detail.driverVerification.fullyVerified ? (
                          <span className="rounded-full bg-primary-fixed/35 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-on-primary-fixed-variant">
                            Fully verified
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-100">
                            Not fully verified
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(
                          [
                            ["Identity", detail.driverVerification.identity],
                            ["License", detail.driverVerification.license],
                            ["Vehicle photos", detail.driverVerification.vehiclePhotos],
                            ["Other docs", detail.driverVerification.otherDocs],
                          ] as const
                        ).map(([label, slot]) => (
                          <div key={label} className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-xs">
                            <span className="font-bold text-on-surface-variant">{label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${slotClass(slot)}`}>
                              {slot}
                            </span>
                          </div>
                        ))}
                      </div>
                      {detail.driverVerification.updatedAt ? (
                        <p className="mt-2 text-[10px] text-on-surface-variant">
                          Updated {fmtDate(detail.driverVerification.updatedAt)}
                        </p>
                      ) : null}
                      {detail.driverVerification.adminComment ? (
                        <p className="mt-2 rounded-lg bg-surface-container-high/80 px-3 py-2 text-xs text-on-surface">
                          <span className="font-bold">Admin note:</span> {detail.driverVerification.adminComment}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {detail.passengerVerification ? (
                    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          Passenger / identity
                        </div>
                        {detail.passengerVerification.identityVerified ? (
                          <span className="rounded-full bg-primary-fixed/35 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-on-primary-fixed-variant">
                            Identity OK
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-100">
                            Identity not cleared
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-xs">
                        <span className="font-bold text-on-surface-variant">Identity slot</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${slotClass(detail.passengerVerification.identity)}`}>
                          {detail.passengerVerification.identity}
                        </span>
                      </div>
                      {detail.passengerVerification.updatedAt ? (
                        <p className="mt-2 text-[10px] text-on-surface-variant">
                          Updated {fmtDate(detail.passengerVerification.updatedAt)}
                        </p>
                      ) : null}
                      {detail.passengerVerification.adminComment ? (
                        <p className="mt-2 rounded-lg bg-surface-container-high/80 px-3 py-2 text-xs text-on-surface">
                          <span className="font-bold">Admin note:</span> {detail.passengerVerification.adminComment}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {detail.recentAudit.length > 0 ? (
                    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Recent actions (audit)
                      </div>
                      <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                        {detail.recentAudit.map((a) => (
                          <li key={a.id} className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest px-3 py-2 text-xs">
                            <div className="font-extrabold text-on-surface" title={a.action}>
                              {formatAuditAction(a.action)}
                            </div>
                            <div className="mt-0.5 text-[10px] text-on-surface-variant">
                              {fmtDate(a.createdAt)}
                              {a.actor ? ` · ${a.actor.fullName}` : ""}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant">No audit entries recorded for this user id yet.</p>
                  )}
                </>
              ) : null}

              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">User id</div>
                <div className="flex items-center gap-2 break-all font-mono text-xs">{panelUser.id}</div>
                <button
                  type="button"
                  onClick={() => copyId(panelUser.id)}
                  className="mt-2 text-xs font-extrabold text-primary hover:underline"
                >
                  Copy id
                </button>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Roles</div>
                <div className="flex flex-wrap gap-2">
                  {ASSIGNABLE_ROLES.map((role) => {
                    const has = (detail ?? panelUser).roles.includes(role);
                    const isSelfAdmin = myUserId === panelUser.id && role === "ADMIN";
                    return (
                      <div key={role} className="flex items-center gap-1">
                        {has ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/25 px-3 py-1 text-xs font-extrabold text-primary">
                            {role}
                            <button
                              type="button"
                              disabled={busyId === panelUser.id || isSelfAdmin}
                              title={isSelfAdmin ? "Cannot remove your own ADMIN role here" : undefined}
                              onClick={() => void removeRole(panelUser.id, role)}
                              className="rounded-full p-0.5 hover:bg-black/10 disabled:opacity-30"
                              aria-label={`Remove ${role}`}
                            >
                              <MaterialIcon name="close" className="!text-sm" />
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === panelUser.id}
                            onClick={() => {
                              if (role === "ADMIN" && !window.confirm("Grant ADMIN? This user will have full admin API access.")) {
                                return;
                              }
                              void addRole(panelUser.id, role);
                            }}
                            className="rounded-full border border-dashed border-outline-variant px-3 py-1 text-xs font-extrabold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
                          >
                            + {role}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</div>
                <div className="flex flex-wrap gap-2">
                  {myUserId !== panelUser.id ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === panelUser.id}
                        onClick={() => void setStatus(panelUser.id, "ACTIVE")}
                        className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-extrabold disabled:opacity-50"
                      >
                        Set ACTIVE
                      </button>
                      <button
                        type="button"
                        disabled={busyId === panelUser.id}
                        onClick={() => void setStatus(panelUser.id, "SUSPENDED")}
                        className="rounded-full bg-tertiary-container/40 px-3 py-2 text-xs font-extrabold disabled:opacity-50"
                      >
                        Set SUSPENDED
                      </button>
                      <button
                        type="button"
                        disabled={busyId === panelUser.id}
                        onClick={() => {
                          if (window.confirm("Ban this user? They will not be able to sign in until reactivated.")) {
                            void setStatus(panelUser.id, "BANNED");
                          }
                        }}
                        className="rounded-full bg-error-container px-3 py-2 text-xs font-extrabold text-on-error-container disabled:opacity-50"
                      >
                        Set BANNED
                      </button>
                      <button
                        type="button"
                        disabled={busyId === panelUser.id}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Mark account as DELETED? They will be blocked from signing in until you set ACTIVE again."
                            )
                          ) {
                            void setStatus(panelUser.id, "DELETED");
                          }
                        }}
                        className="rounded-full border border-outline-variant px-3 py-2 text-xs font-extrabold disabled:opacity-50"
                      >
                        Set DELETED
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-on-surface-variant">You cannot change your own status from this panel.</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPanelUser(null)}
              className="mt-8 w-full rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
