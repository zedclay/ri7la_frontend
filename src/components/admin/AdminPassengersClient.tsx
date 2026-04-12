"use client";

import { Link } from "@/i18n/navigation";
import { apiGetJsonData, apiPatchJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

type SlotApi = "PENDING" | "APPROVED" | "REJECTED";

type VerificationPayload = {
  identity: "pending" | "approved" | "rejected";
  adminComment: string | null;
  updatedAt: string | null;
  documents: { identity: string[] };
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
  summary: { pendingSlots: number; rejectedSlots: number; needsAttention: boolean; hasDocuments: boolean };
};

type PatchBody = { identityStatus?: SlotApi; adminComment?: string | null };

function toApi(s: "pending" | "approved" | "rejected"): SlotApi {
  if (s === "approved") return "APPROVED";
  if (s === "rejected") return "REJECTED";
  return "PENDING";
}

function fromApi(v: VerificationPayload["identity"]): "pending" | "approved" | "rejected" {
  if (v === "approved" || v === "rejected" || v === "pending") return v;
  return "pending";
}

function DocPreview({ urls }: { urls: string[] }) {
  if (!urls.length) {
    return (
      <p className="text-xs text-on-surface-variant">
        No ID on file. Run migration <code className="rounded bg-surface-container-high px-1">0009</code> and ensure the voyager uploaded from{" "}
        <strong>Passenger profile</strong> while logged in.
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

export function AdminPassengersClient() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [draft, setDraft] = useState<{ identity: "pending" | "approved" | "rejected"; adminComment: string } | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  const loadList = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      const res = await apiGetJsonData<{ items: QueueItem[] }>(`/api/admin/passenger-verification?${qs.toString()}`);
      setList(res.items ?? []);
      setSelected((cur) => {
        if (!cur) return null;
        const next = res.items.find((i) => i.user.id === cur.user.id);
        return next ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load passengers");
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
    void apiGetJsonData<VerificationPayload & { userId: string }>(`/api/admin/passenger-verification/${encodeURIComponent(selected.user.id)}`)
      .then((detail) => {
        if (cancelled) return;
        const { userId: _u, ...ver } = detail;
        setSelected((prev) => (prev && prev.user.id === selected.user.id ? { ...prev, verification: ver } : prev));
      })
      .catch(() => {
        /* keep list */
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
    const v = selected.verification;
    setDraft({
      identity: fromApi(v.identity),
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

  async function submitPatch(body: PatchBody) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await apiPatchJsonData(`/api/admin/passenger-verification/${encodeURIComponent(selected.user.id)}`, body);
      setSavedHint(true);
      window.setTimeout(() => setSavedHint(false), 2800);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Passenger verification</h1>
          <p className="mt-1 text-on-surface-variant">
            Voyagers (PASSENGER role) can upload a national ID from their profile. Approve or reject here — same pattern as driver checks.
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
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-on-surface outline-none"
          />
        </div>
        <div className="text-xs font-bold text-on-surface-variant">
          {list === null ? "Loading…" : `${list.length} passenger${list.length === 1 ? "" : "s"}`}
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
              No passengers found.
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
                    {row.summary.needsAttention || (row.summary.hasDocuments && row.verification.identity === "pending") ? (
                      <span className="shrink-0 rounded-full bg-amber-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-950 dark:text-amber-100">
                        Action
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-primary-fixed/30 px-2.5 py-0.5 text-[10px] font-extrabold text-on-primary-fixed-variant">
                        Clear
                      </span>
                    )}
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
              <p className="mt-4 text-sm font-semibold text-on-surface-variant">Select a passenger to review identity.</p>
              <p className="mt-2 text-xs text-on-surface-variant">
                Tip: voyagers upload documents from{" "}
                <Link href="/passenger/profile" className="font-extrabold text-primary underline">
                  Passenger profile
                </Link>
                .
              </p>
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

              <div className="rounded-2xl bg-surface-container-low p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-extrabold text-on-surface">National ID</div>
                  <select
                    value={draft.identity}
                    onChange={(e) => setDraft((d) => (d ? { ...d, identity: e.target.value as "pending" | "approved" | "rejected" } : d))}
                    className="rounded-xl border-none bg-white px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  >
                    {selectOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 border-t border-outline-variant/10 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Uploaded</div>
                  <DocPreview urls={selected.verification.documents?.identity ?? []} />
                </div>
              </div>

              <div>
                <label htmlFor="admin-passenger-comment" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Message to passenger (optional)
                </label>
                <textarea
                  id="admin-passenger-comment"
                  value={draft.adminComment}
                  onChange={(e) => setDraft((d) => (d ? { ...d, adminComment: e.target.value } : d))}
                  rows={3}
                  placeholder="e.g. ID is expired — please upload a new photo."
                  className="mt-2 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void submitPatch({
                    identityStatus: toApi(draft.identity),
                    adminComment: draft.adminComment.trim() || null,
                  })
                }
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
