"use client";

import { apiGetJsonData, apiPatchJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useCallback, useEffect, useState } from "react";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  hiddenAt: string | null;
  author: { id: string; fullName: string } | null;
  targetUser: { id: string; fullName: string } | null;
  booking: { id: string; status: string } | null;
};

type ListResponse = { items: ReviewRow[]; total: number };

export function AdminReviewsClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [visibility, setVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      qs.set("visibility", visibility);
      const res = await apiGetJsonData<ListResponse>(`/api/admin/reviews?${qs.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    }
  }, [visibility]);

  useEffect(() => {
    void load();
  }, [load]);

  async function moderate(id: string, vis: "VISIBLE" | "HIDDEN") {
    setBusyId(id);
    try {
      await apiPatchJsonData(`/api/admin/reviews/${encodeURIComponent(id)}/moderate`, {
        visibility: vis,
        note: vis === "HIDDEN" ? "Hidden via admin console" : undefined,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Moderation failed");
    } finally {
      setBusyId(null);
    }
  }

  const tabs: { label: string; value: typeof visibility }[] = [
    { label: "All", value: "all" },
    { label: "Visible", value: "visible" },
    { label: "Hidden", value: "hidden" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Reviews & moderation</h1>
        <p className="mt-1 text-on-surface-variant">Hide or restore reviews; actions are written to the audit log.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container">{error}</div>
      ) : null}

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setVisibility(t.value)}
              className={
                visibility === t.value
                  ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                  : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {!data ? (
            <div className="text-center text-sm text-on-surface-variant">Loading…</div>
          ) : (
            data.items.map((r) => (
              <div key={r.id} className="flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                    <MaterialIcon name="star" className="!text-2xl text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-on-surface">
                      {r.rating}/5 · {r.author?.fullName ?? "?"} → {r.targetUser?.fullName ?? "?"}
                    </div>
                    <div className="mt-1 max-w-xl text-xs text-on-surface-variant">{r.comment ?? "(no comment)"}</div>
                    <div className="mt-2 text-[10px] font-bold text-on-surface-variant">
                      {r.hiddenAt ? `Hidden ${new Date(r.hiddenAt).toLocaleString()}` : "Visible"} · booking {r.booking?.id?.slice(0, 8) ?? "—"}…
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.hiddenAt ? (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void moderate(r.id, "VISIBLE")}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary disabled:opacity-50"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void moderate(r.id, "HIDDEN")}
                      className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-extrabold text-on-surface disabled:opacity-50"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
