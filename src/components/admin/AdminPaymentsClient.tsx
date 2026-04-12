"use client";

import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PaymentRow = {
  id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  providerReference: string | null;
  proofUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    totalCurrency?: string;
    passenger: { id: string; fullName: string; email: string | null; phoneE164: string | null } | null;
    trip: {
      id: string;
      mode: string;
      originCity: string;
      destinationCity: string;
      departureAt: string;
    } | null;
  } | null;
};

type ListResponse = { items: PaymentRow[]; total: number };

function pill(status: string) {
  const s = status.toUpperCase();
  if (s === "PAID") return "bg-primary-fixed/40 text-on-primary-fixed-variant";
  if (s === "PENDING") return "bg-tertiary-fixed/60 text-on-tertiary-fixed";
  if (s === "FAILED") return "bg-error-container text-on-error-container";
  if (s === "REFUNDED") return "bg-surface-container-high text-on-surface";
  return "bg-surface-container-high text-on-surface";
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

export function AdminPaymentsClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ListResponse | null>(null);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<PaymentRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const q = searchParams.get("status");
    if (q === "PENDING" || q === "PAID" || q === "FAILED" || q === "REFUNDED") setStatus(q);
  }, [searchParams]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      if (status) qs.set("status", status);
      const res = await apiGetJsonData<ListResponse>(`/api/admin/payments?${qs.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
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
      const d = await apiGetJsonData<PaymentRow>(`/api/admin/payments/${encodeURIComponent(id)}`);
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payment");
    } finally {
      setDetailLoading(false);
    }
  }

  async function confirmBaridimob() {
    if (!detail) return;
    setConfirmBusy(true);
    setError(null);
    try {
      await apiPostJsonData(`/api/admin/payments/${encodeURIComponent(detail.id)}/confirm-baridimob`, {});
      setDetail(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirm failed");
    } finally {
      setConfirmBusy(false);
    }
  }

  const filters: { label: string; value?: string }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Paid", value: "PAID" },
    { label: "Failed", value: "FAILED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  const canConfirmBaridimob =
    detail &&
    detail.provider === "BARIDIMOB" &&
    detail.status === "PENDING" &&
    !!detail.proofUrl?.trim();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Payments</h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Reconcile Baridi Mob and other providers. Each row links to the booking, passenger contact, and route. Confirming Baridi Mob
          marks the payment and booking as paid.
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

        <div className="mb-3 text-xs font-bold text-on-surface-variant">{data ? `${data.total} payment(s)` : "Loading…"}</div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Booking / passenger</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {!data ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                    Loading…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                    No payments in this queue.
                  </td>
                </tr>
              ) : (
                data.items.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-t border-outline-variant/10 transition-colors hover:bg-surface-container-low/60"
                    onClick={() => void openDetail(p.id)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs font-extrabold text-primary-container">{p.id.slice(0, 10)}…</div>
                      <div className="mt-1 text-[10px] font-bold text-on-surface-variant">{fmtShort(p.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-extrabold text-on-surface">{p.booking?.passenger?.fullName ?? "—"}</div>
                      {p.booking?.passenger?.email ? (
                        <div className="text-[10px] text-on-surface-variant">{p.booking.passenger.email}</div>
                      ) : null}
                      {p.booking?.passenger?.phoneE164 ? (
                        <div className="font-mono text-[10px] text-on-surface-variant">{p.booking.passenger.phoneE164}</div>
                      ) : null}
                      {p.booking?.id ? (
                        <div className="mt-1 font-mono text-[10px] text-on-surface-variant">Bk: {p.booking.id.slice(0, 8)}…</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      {p.booking?.trip ? (
                        <>
                          <div className="font-semibold text-on-surface">
                            {p.booking.trip.originCity} → {p.booking.trip.destinationCity}
                          </div>
                          <div className="text-[10px] text-on-surface-variant">
                            {fmtShort(p.booking.trip.departureAt)} · {p.booking.trip.mode}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs font-extrabold">{p.provider}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${pill(p.status)}`}>
                        {p.status}
                      </span>
                      {p.proofUrl ? <div className="mt-1 text-[9px] font-bold text-secondary">Has receipt</div> : null}
                    </td>
                    <td className="px-4 py-3 align-top text-right font-extrabold text-on-surface">
                      {p.amount.toLocaleString()} {p.currency}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail || detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-on-surface">Payment detail</div>
                {detail ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-xs text-on-surface-variant">{detail.id}</span>
                    <button
                      type="button"
                      onClick={() => void copyText(detail.id)}
                      className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-extrabold text-primary-container"
                    >
                      Copy
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
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid gap-2 rounded-xl bg-surface-container-low p-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Provider</span>
                    <span className="font-extrabold">{detail.provider}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Status</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${pill(detail.status)}`}>{detail.status}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Amount</span>
                    <span className="font-extrabold">
                      {detail.amount.toLocaleString()} {detail.currency}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Created</span>
                    <span className="font-semibold">{fmtShort(detail.createdAt)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Paid at</span>
                    <span className="font-semibold">{detail.paidAt ? fmtShort(detail.paidAt) : "—"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Provider ref</span>
                    <span className="max-w-[55%] break-all font-mono text-[11px]">{detail.providerReference ?? "—"}</span>
                  </div>
                </div>

                {detail.booking ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Linked booking</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="break-all font-mono text-xs">{detail.booking.id}</span>
                      <button
                        type="button"
                        onClick={() => void copyText(detail.booking!.id)}
                        className="text-[10px] font-extrabold text-primary-container underline"
                      >
                        Copy booking ID
                      </button>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs">
                      <div>
                        Booking status: <span className="font-extrabold">{detail.booking.status}</span>
                      </div>
                      <div>
                        Booking payment flag: <span className="font-extrabold">{detail.booking.paymentStatus}</span>
                      </div>
                      <div>
                        Total:{" "}
                        <span className="font-extrabold">
                          {detail.booking.totalAmount.toLocaleString()} {detail.booking.totalCurrency ?? "DZD"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-outline-variant/10 pt-3">
                      <div className="text-[10px] font-bold uppercase text-on-surface-variant">Passenger</div>
                      <div className="mt-1 font-extrabold">{detail.booking.passenger?.fullName ?? "—"}</div>
                      <div className="mt-1 text-xs">Email: {detail.booking.passenger?.email ?? "—"}</div>
                      <div className="text-xs">Phone: {detail.booking.passenger?.phoneE164 ?? "—"}</div>
                    </div>
                    {detail.booking.trip ? (
                      <div className="mt-3 border-t border-outline-variant/10 pt-3">
                        <div className="text-[10px] font-bold uppercase text-on-surface-variant">Trip</div>
                        <div className="mt-1 font-extrabold">
                          {detail.booking.trip.originCity} → {detail.booking.trip.destinationCity}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {fmtShort(detail.booking.trip.departureAt)} · {detail.booking.trip.mode}
                        </div>
                        <button
                          type="button"
                          onClick={() => void copyText(detail.booking!.trip!.id)}
                          className="mt-2 text-[10px] font-extrabold text-primary-container underline"
                        >
                          Copy trip ID
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {detail.provider === "BARIDIMOB" && detail.proofUrl ? (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Transfer receipt</div>
                    <div className="mt-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-low">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={detail.proofUrl} alt="Receipt" className="max-h-72 w-full object-contain" />
                    </div>
                    {canConfirmBaridimob ? (
                      <button
                        type="button"
                        disabled={confirmBusy}
                        onClick={() => void confirmBaridimob()}
                        className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary disabled:opacity-50"
                      >
                        {confirmBusy ? "Confirming…" : "Confirm Baridimob payment"}
                      </button>
                    ) : null}
                    {detail.status === "PENDING" && detail.provider === "BARIDIMOB" && !detail.proofUrl ? (
                      <p className="mt-2 text-xs text-on-surface-variant">No receipt on file.</p>
                    ) : null}
                  </div>
                ) : detail.proofUrl ? (
                  <div className="text-xs text-on-surface-variant">Proof on file (open image in network tools if needed).</div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
