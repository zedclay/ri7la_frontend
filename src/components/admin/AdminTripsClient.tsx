"use client";

import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type TripRow = {
  id: string;
  mode: string;
  status: string;
  owner: { id: string; fullName: string; email: string | null; phoneE164: string | null } | null;
  originCity: string;
  originName: string;
  destinationCity: string;
  destinationName: string;
  departureAt: string;
  seatsTotal: number;
  seatsAvailable: number;
  priceAmount: number;
  priceCurrency: string;
  allowInstantBooking: boolean;
  womenOnly: boolean;
  driverNote: string | null;
  tripRules: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = { items: TripRow[]; total: number };

function statusPill(status: string) {
  const s = status.toUpperCase();
  if (s === "PUBLISHED") return "bg-primary-fixed/40 text-on-primary-fixed-variant";
  if (s === "CANCELLED") return "bg-error-container text-on-error-container";
  if (s === "COMPLETED") return "bg-surface-container-high text-on-surface";
  return "bg-tertiary-fixed/60 text-on-tertiary-fixed";
}

function fmtShort(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

export function AdminTripsClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ListResponse | null>(null);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TripRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const st = searchParams.get("status");
    if (st === "PUBLISHED" || st === "DRAFT" || st === "CANCELLED" || st === "COMPLETED") setStatus(st);
  }, [searchParams]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      if (status) qs.set("status", status);
      const res = await apiGetJsonData<ListResponse>(`/api/admin/trips?${qs.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trips");
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(id: string) {
    setDetail(null);
    setDetailLoading(true);
    setError(null);
    try {
      const d = await apiGetJsonData<TripRow>(`/api/admin/trips/${encodeURIComponent(id)}`);
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trip");
    } finally {
      setDetailLoading(false);
    }
  }

  async function cancelTrip(id: string) {
    if (!window.confirm("Cancel this trip and all active bookings? This cannot be undone from the passenger app.")) return;
    setBusyId(id);
    setError(null);
    try {
      await apiPostJsonData(`/api/admin/trips/${encodeURIComponent(id)}/cancel`, {});
      setDetail((cur) => (cur?.id === id ? null : cur));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  const filters: { label: string; value?: string }[] = [
    { label: "All", value: undefined },
    { label: "Published", value: "PUBLISHED" },
    { label: "Draft", value: "DRAFT" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Trips</h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Published and draft routes with pricing, capacity, driver contact, and moderation notes. Admin cancel cancels active bookings
          and frees seats — actions are audited.
        </p>
      </div>

      {error ? (
        <div
          className="flex items-start justify-between gap-3 rounded-2xl border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container"
          role="alert"
        >
          <span>{error}</span>
          <button type="button" className="shrink-0 font-extrabold underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setStatus(t.value)}
                className={
                  status === t.value
                    ? "rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary"
                    : "rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-low"
          >
            <MaterialIcon name="refresh" className="!text-base" />
            Refresh
          </button>
        </div>

        <div className="mb-3 text-xs font-bold text-on-surface-variant">{data ? `${data.total} trip(s)` : "Loading…"}</div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Trip</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!data ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-on-surface-variant">
                    Loading…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-on-surface-variant">
                    No trips match this filter.
                  </td>
                </tr>
              ) : (
                data.items.map((t) => {
                  const taken = t.seatsTotal - t.seatsAvailable;
                  return (
                    <tr key={t.id} className="border-t border-outline-variant/10 transition-colors hover:bg-surface-container-low/50">
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => void openDetail(t.id)}
                          className="font-mono text-xs font-extrabold text-primary-container hover:underline"
                        >
                          {t.id.slice(0, 10)}…
                        </button>
                        <div className="mt-1 text-[10px] font-bold text-on-surface-variant">{t.mode}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-extrabold text-on-surface">
                          {t.originCity} → {t.destinationCity}
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-[10px] text-on-surface-variant">
                          {t.originName} → {t.destinationName}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-on-surface-variant">{fmtShort(t.departureAt)}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-on-surface">{t.owner?.fullName ?? "—"}</div>
                        {t.owner?.email ? <div className="text-[10px] text-on-surface-variant">{t.owner.email}</div> : null}
                      </td>
                      <td className="px-4 py-3 align-top text-xs font-extrabold">
                        {taken}/{t.seatsTotal} taken
                        <div className="mt-0.5 text-[10px] font-bold text-on-surface-variant">{t.seatsAvailable} free</div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs font-extrabold">
                        {t.priceAmount.toLocaleString()} {t.priceCurrency}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusPill(t.status)}`}>
                          {t.status}
                        </span>
                        {t.allowInstantBooking ? (
                          <div className="mt-1 text-[9px] font-bold text-secondary">Instant OK</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => void openDetail(t.id)}
                            className="text-xs font-extrabold text-primary-container hover:underline"
                          >
                            Details
                          </button>
                          {t.status !== "CANCELLED" && t.status !== "COMPLETED" ? (
                            <button
                              type="button"
                              disabled={busyId === t.id}
                              onClick={() => void cancelTrip(t.id)}
                              className="rounded-full bg-error-container px-3 py-1.5 text-[10px] font-extrabold text-on-error-container disabled:opacity-50"
                            >
                              Cancel trip
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail || detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-on-surface">Trip detail</div>
                {detail ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-xs text-on-surface-variant">{detail.id}</span>
                    <button
                      type="button"
                      onClick={() => void copyText(detail.id)}
                      className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-extrabold text-primary-container"
                    >
                      Copy ID
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-full p-2 hover:bg-surface-container-low"
                aria-label="Close"
              >
                <MaterialIcon name="close" className="!text-xl" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex justify-center py-12 text-on-surface-variant">
                <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
              </div>
            ) : detail ? (
              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Route</div>
                  <div className="mt-2 text-lg font-extrabold text-on-surface">
                    {detail.originCity} → {detail.destinationCity}
                  </div>
                  <div className="mt-1 text-xs text-on-surface-variant">
                    {detail.originName} → {detail.destinationName}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Departure</span>
                      <span className="font-semibold">{fmtShort(detail.departureAt)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Mode / status</span>
                      <span className="font-extrabold">
                        {detail.mode} · {detail.status}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Women only</span>
                      <span className="font-extrabold">{detail.womenOnly ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Instant booking</span>
                      <span className="font-extrabold">{detail.allowInstantBooking ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Seats (free / total)</span>
                      <span className="font-extrabold">
                        {detail.seatsAvailable} / {detail.seatsTotal}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Price / seat</span>
                      <span className="font-extrabold">
                        {detail.priceAmount.toLocaleString()} {detail.priceCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 text-[11px]">
                      <span className="text-on-surface-variant">Created</span>
                      <span>{fmtShort(detail.createdAt)}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-[11px]">
                      <span className="text-on-surface-variant">Updated</span>
                      <span>{fmtShort(detail.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Driver</div>
                  <div className="mt-2 font-extrabold text-on-surface">{detail.owner?.fullName ?? "—"}</div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div>Email: {detail.owner?.email ?? "—"}</div>
                    <div>Phone: {detail.owner?.phoneE164 ?? "—"}</div>
                    {detail.owner?.id ? (
                      <button
                        type="button"
                        onClick={() => void copyText(detail.owner!.id)}
                        className="text-[10px] font-extrabold text-primary-container underline"
                      >
                        Copy driver user ID
                      </button>
                    ) : null}
                  </div>
                </div>

                {detail.driverNote ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Driver note</div>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-on-surface">{detail.driverNote}</p>
                  </div>
                ) : null}

                {detail.tripRules ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trip rules</div>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-on-surface">{detail.tripRules}</p>
                  </div>
                ) : null}

                {detail.status !== "CANCELLED" && detail.status !== "COMPLETED" ? (
                  <button
                    type="button"
                    disabled={busyId === detail.id}
                    onClick={() => void cancelTrip(detail.id)}
                    className="w-full rounded-full bg-error-container py-3 text-sm font-extrabold text-on-error-container disabled:opacity-50"
                  >
                    Cancel entire trip
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
