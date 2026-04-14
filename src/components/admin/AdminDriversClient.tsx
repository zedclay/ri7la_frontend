"use client";

import { Link } from "@/i18n/navigation";
import { apiGetJsonData, apiPatchJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

type SlotApi = "PENDING" | "APPROVED" | "REJECTED";

type VerificationPayload = {
  identity: "pending" | "approved" | "rejected";
  license: "pending" | "approved" | "rejected";
  vehiclePhotos: "pending" | "approved" | "rejected";
  otherDocs: "pending" | "approved" | "rejected";
  adminComment: string | null;
  updatedAt: string | null;
  documents: {
    identity: string[];
    license: string[];
    vehiclePhotos: string[];
    otherDocs: string[];
  };
};

type QueueItem = {
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phoneE164: string | null;
    status: string;
  };
  verification: VerificationPayload;
  summary: { pendingSlots: number; rejectedSlots: number; needsAttention: boolean };
};

const SLOTS: {
  key: keyof Pick<VerificationPayload, "identity" | "license" | "vehiclePhotos" | "otherDocs">;
  apiField: keyof PatchBody;
  label: string;
  docKey: keyof VerificationPayload["documents"];
  icon: string;
}[] = [
  { key: "identity", apiField: "identityStatus", label: "National ID", docKey: "identity", icon: "badge" },
  { key: "license", apiField: "licenseStatus", label: "Driver license", docKey: "license", icon: "id_card" },
  { key: "vehiclePhotos", apiField: "vehiclePhotosStatus", label: "Vehicle photos", docKey: "vehiclePhotos", icon: "directions_car" },
  { key: "otherDocs", apiField: "otherDocsStatus", label: "Other documents", docKey: "otherDocs", icon: "folder_open" },
];

const EMPTY_DOCS: VerificationPayload["documents"] = {
  identity: [],
  license: [],
  vehiclePhotos: [],
  otherDocs: [],
};

function fromApi(v: unknown): "pending" | "approved" | "rejected" {
  if (v === "approved" || v === "rejected" || v === "pending") return v;
  if (typeof v === "string") {
    const x = v.toLowerCase();
    if (x === "approved" || x === "rejected" || x === "pending") return x;
  }
  return "pending";
}

function stringsFromDocValue(v: unknown): string[] {
  if (typeof v === "string" && v.trim().length > 0) return [v];
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").slice(0, 8);
}

/** Ensures all four slots + document arrays exist (API / cache may omit keys or use legacy names). */
function normalizeVerification(v: Partial<VerificationPayload> | undefined | null): VerificationPayload {
  const rawDocs = v?.documents;
  const merged: VerificationPayload["documents"] = { ...EMPTY_DOCS };
  if (rawDocs && typeof rawDocs === "object") {
    const rd = rawDocs as Record<string, unknown>;
    for (const k of Object.keys(EMPTY_DOCS) as (keyof typeof EMPTY_DOCS)[]) {
      merged[k] = stringsFromDocValue(rd[k]);
    }
    const aliasPairs: [keyof typeof EMPTY_DOCS, string[]][] = [
      ["identity", ["nationalId", "national_id", "idDocument", "id_document", "cin"]],
      ["license", ["driversLicense", "drivers_license", "drivingLicense", "driving_license"]],
      ["vehiclePhotos", ["vehicle", "vehiclePhoto", "vehicle_photo", "vehicle_photos", "carPhotos"]],
      ["otherDocs", ["other", "additional", "additionalDocs", "additional_documents"]],
    ];
    for (const [canonical, aliases] of aliasPairs) {
      if (merged[canonical].length > 0) continue;
      for (const alias of aliases) {
        const picked = stringsFromDocValue(rd[alias]);
        if (picked.length > 0) {
          merged[canonical] = picked;
          break;
        }
      }
    }
  }
  return {
    identity: fromApi(v?.identity),
    license: fromApi(v?.license),
    vehiclePhotos: fromApi(v?.vehiclePhotos),
    otherDocs: fromApi(v?.otherDocs),
    adminComment: v?.adminComment ?? null,
    updatedAt: v?.updatedAt ?? null,
    documents: merged,
  };
}

function DocPreview({ urls }: { urls: string[] }) {
  if (!urls.length) {
    return (
      <p className="text-xs text-on-surface-variant">
        No file in the database for this slot. The driver should upload again from{" "}
        <strong className="text-on-surface">Driver onboarding</strong> (logged in). Very large images used to fail server-side; after the API update, re-upload should
        persist.
      </p>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((u, i) =>
        u.startsWith("data:application/pdf") || u.includes("application/pdf") ? (
          <a
            key={i}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-xs font-extrabold text-primary underline"
          >
            Open PDF {i + 1}
          </a>
        ) : (
          <a
            key={i}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="block max-h-44 max-w-[200px] overflow-hidden rounded-xl border border-outline-variant/20 bg-white/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="max-h-44 w-full object-contain" />
          </a>
        )
      )}
    </div>
  );
}

type PatchBody = {
  identityStatus?: SlotApi;
  licenseStatus?: SlotApi;
  vehiclePhotosStatus?: SlotApi;
  otherDocsStatus?: SlotApi;
  adminComment?: string | null;
};

type DraftSlots = Pick<VerificationPayload, "identity" | "license" | "vehiclePhotos" | "otherDocs">;

function toApi(s: "pending" | "approved" | "rejected"): SlotApi {
  if (s === "approved") return "APPROVED";
  if (s === "rejected") return "REJECTED";
  return "PENDING";
}

export function AdminDriversClient() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [draft, setDraft] = useState<(DraftSlots & { adminComment: string }) | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  const loadList = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      const res = await apiGetJsonData<{ items: QueueItem[] }>(`/api/admin/driver-verification?${qs.toString()}`);
      const items = (res.items ?? []).map((row) => ({
        ...row,
        verification: normalizeVerification(row.verification),
      }));
      setList(items);
      // Must keep the normalized row — `res.items` is raw API shape and can omit document keys / slots.
      setSelected((cur) => {
        if (!cur) return null;
        return items.find((i) => i.user.id === cur.user.id) ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load drivers");
      setList([]);
    }
  }, [q]);

  useEffect(() => {
    const t = window.setTimeout(() => void loadList(), 350);
    return () => window.clearTimeout(t);
  }, [loadList]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    void apiGetJsonData<VerificationPayload & { userId: string }>(`/api/admin/driver-verification/${encodeURIComponent(selected.user.id)}`)
      .then((detail) => {
        if (cancelled) return;
        const { userId: _u, ...ver } = detail;
        const verification = normalizeVerification(ver as Partial<VerificationPayload>);
        setSelected((prev) => (prev && prev.user.id === selected.user.id ? { ...prev, verification } : prev));
      })
      .catch(() => {
        /* keep list payload */
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.user.id]);

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    const v = normalizeVerification(selected.verification);
    setDraft({
      identity: v.identity,
      license: v.license,
      vehiclePhotos: v.vehiclePhotos,
      otherDocs: v.otherDocs,
      adminComment: v.adminComment ?? "",
    });
  }, [selected]);

  const selectOptions = useMemo(
    () =>
      [
        { value: "pending" as const, label: "Pending" },
        { value: "approved" as const, label: "Approved" },
        { value: "rejected" as const, label: "Rejected" },
      ] as const,
    []
  );

  /** Always merge missing slots / document arrays (selected row must match normalized list + detail fetch). */
  const detailVerification = useMemo(
    () => (selected ? normalizeVerification(selected.verification) : null),
    [selected]
  );

  async function submitPatch(body: PatchBody) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await apiPatchJsonData(`/api/admin/driver-verification/${encodeURIComponent(selected.user.id)}`, body);
      setSavedHint(true);
      window.setTimeout(() => setSavedHint(false), 2800);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function buildFullPatch(): PatchBody {
    if (!draft) return {};
    const b: PatchBody = {};
    for (const s of SLOTS) {
      b[s.apiField] = toApi(draft[s.key]);
    }
    b.adminComment = draft.adminComment.trim() || null;
    return b;
  }

  function setSlot(key: keyof DraftSlots, v: "pending" | "approved" | "rejected") {
    setDraft((d) => (d ? { ...d, [key]: v } : d));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Driver verification</h1>
          <p className="mt-1 text-on-surface-variant">
            All users with the DRIVER role appear here. Open a row to approve or reject each document group — drivers see the result after refresh.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadList()}
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-5 py-3 text-sm font-extrabold text-on-surface active:scale-95"
        >
          <MaterialIcon name="refresh" className="!text-xl" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container">{error}</div>
      ) : null}

      {savedHint ? (
        <div className="rounded-xl bg-primary-container/20 px-4 py-3 text-sm font-semibold text-on-surface" role="status">
          Saved — verification stored on the server.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
          <MaterialIcon name="search" className="!text-xl text-on-surface-variant" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, or paste user id…"
            className="min-w-0 flex-1 border-none bg-transparent text-base text-on-surface outline-none md:text-sm"
          />
        </div>
        <div className="text-xs font-bold text-on-surface-variant">
          {list === null ? "Loading…" : `${list.length} driver${list.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {!list ? (
            <div className="flex justify-center py-16 text-on-surface-variant">
              <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl bg-surface-container-low px-6 py-12 text-center text-sm text-on-surface-variant">
              No drivers found. Assign the DRIVER role in{" "}
              <Link href="/admin/users" className="font-extrabold text-primary underline">
                Users
              </Link>
              .
            </div>
          ) : (
            list.map((row) => {
              const active = selected?.user.id === row.user.id;
              return (
                <button
                  key={row.user.id}
                  type="button"
                  onClick={() => setSelected(row)}
                  className={
                    active
                      ? "w-full rounded-2xl border-2 border-primary bg-primary-container/15 p-4 text-left shadow-sm"
                      : "w-full rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4 text-left shadow-sm transition-colors hover:bg-surface-container-high"
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold text-on-surface">{row.user.fullName}</div>
                      <div className="truncate text-xs text-on-surface-variant">{row.user.email ?? row.user.phoneE164 ?? "—"}</div>
                    </div>
                    {row.summary.needsAttention ? (
                      <span className="shrink-0 rounded-full bg-amber-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-950 dark:text-amber-100">
                        Action
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-primary-fixed/30 px-2.5 py-0.5 text-[10px] font-extrabold text-on-primary-fixed-variant">
                        Clear
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-on-surface-variant">
                    <span>
                      Pending: {row.summary.pendingSlots}
                    </span>
                    <span>·</span>
                    <span className={row.summary.rejectedSlots > 0 ? "text-error" : ""}>
                      Rejected: {row.summary.rejectedSlots}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {SLOTS.map((slot) => {
                      const st = row.verification[slot.key];
                      const cls =
                        st === "rejected"
                          ? "bg-error-container/40 text-on-error-container"
                          : st === "approved"
                            ? "bg-primary-fixed/35 text-on-primary-fixed-variant"
                            : "bg-surface-container-high text-on-surface-variant";
                      return (
                        <span key={slot.key} className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${cls}`}>
                          {slot.label.split(" ")[0]}: {st}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-3">
          {!selected || !draft ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/50 p-8 text-center">
              <MaterialIcon name="touch_app" className="!text-4xl text-outline" />
              <p className="mt-4 text-sm font-semibold text-on-surface-variant">Select a driver on the left to review documents.</p>
            </div>
          ) : (
            <div className="space-y-6 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
              <div>
                <h2 className="font-headline text-xl font-extrabold text-on-surface">{selected.user.fullName}</h2>
                <p className="text-xs text-on-surface-variant">
                  Account: {selected.user.status} · {selected.user.email ?? selected.user.phoneE164}
                </p>
                <p className="mt-1 font-mono text-[10px] text-on-surface-variant">ID {selected.user.id}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void submitPatch({
                      identityStatus: "APPROVED",
                      licenseStatus: "APPROVED",
                      vehiclePhotosStatus: "APPROVED",
                      otherDocsStatus: "APPROVED",
                      adminComment: draft.adminComment.trim() || null,
                    })
                  }
                  className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary disabled:opacity-50"
                >
                  Approve all
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            identity: "pending",
                            license: "pending",
                            vehiclePhotos: "pending",
                            otherDocs: "pending",
                          }
                        : d
                    );
                  }}
                  className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface disabled:opacity-50"
                >
                  Reset form to pending
                </button>
              </div>

              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Document categories (4)
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {SLOTS.map((s, idx) => (
                    <section
                      key={s.key}
                      aria-labelledby={`driver-slot-${s.key}`}
                      className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container/25 text-[10px] font-extrabold text-primary">
                              {idx + 1}
                            </span>
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                              <MaterialIcon name={s.icon} className="!text-2xl text-primary" />
                            </div>
                            <div>
                              <div id={`driver-slot-${s.key}`} className="text-sm font-extrabold text-on-surface">
                                {s.label}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                Status &amp; uploads
                              </div>
                            </div>
                          </div>
                          <select
                            value={draft[s.key]}
                            onChange={(e) => setSlot(s.key, e.target.value as "pending" | "approved" | "rejected")}
                            className="shrink-0 rounded-xl border-none bg-white px-3 py-2 text-xs font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                          >
                            {selectOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="border-t border-outline-variant/10 pt-3">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Uploaded</div>
                          <DocPreview urls={detailVerification?.documents[s.docKey] ?? []} />
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="admin-driver-comment" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Message to driver (optional)
                </label>
                <textarea
                  id="admin-driver-comment"
                  value={draft.adminComment}
                  onChange={(e) => setDraft((d) => (d ? { ...d, adminComment: e.target.value } : d))}
                  rows={3}
                  placeholder="e.g. ID photo is blurry — please re-upload."
                  className="mt-2 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void submitPatch(buildFullPatch())}
                className="w-full rounded-full bg-primary py-3.5 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save verification"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
