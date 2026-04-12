"use client";

import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PaymentSummary = {
  id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  hasProof: boolean;
  providerReference: string | null;
  createdAt: string;
};

type BookingRow = {
  id: string;
  status: string;
  seats: number;
  totalAmount: number;
  totalCurrency: string;
  paymentStatus: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
  passenger: {
    id: string;
    fullName: string;
    email: string | null;
    phoneE164: string | null;
  } | null;
  trip: {
    id: string;
    mode: string;
    status: string;
    originCity: string;
    originName: string;
    destinationCity: string;
    destinationName: string;
    departureAt: string;
    allowInstantBooking: boolean;
    priceAmount: number;
    priceCurrency: string;
    seatsTotal: number;
    seatsAvailable: number;
    owner: { id: string; fullName: string; email: string | null } | null;
  } | null;
  payments?: PaymentSummary[];
};

type ListResponse = { items: BookingRow[]; total: number; offset?: number; limit?: number };

function pill(status: string) {
  const s = status.toUpperCase();
  if (s === "CONFIRMED") return "bg-primary-fixed/40 text-on-primary-fixed-variant";
  if (s === "PENDING") return "bg-tertiary-fixed/60 text-on-tertiary-fixed";
  if (s === "CANCELLED") return "bg-error-container text-on-error-container";
  if (s === "COMPLETED") return "bg-surface-container-high text-on-surface";
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

export function AdminBookingsClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ListResponse | null>(null);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BookingRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const st = searchParams.get("status");
    const ps = searchParams.get("paymentStatus");
    if (st === "PENDING" || st === "CONFIRMED" || st === "CANCELLED" || st === "COMPLETED") setStatus(st);
    if (ps === "UNPAID" || ps === "PAID" || ps === "FAILED" || ps === "REFUNDED") setPaymentStatus(ps);
  }, [searchParams]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "50");
      if (status) qs.set("status", status);
      if (paymentStatus) qs.set("paymentStatus", paymentStatus);
      const res = await apiGetJsonData<ListResponse>(`/api/admin/bookings?${qs.toString()}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    }
  }, [status, paymentStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(id: string) {
    setDetail(null);
    setDetailLoading(true);
    setError(null);
    try {
      const d = await apiGetJsonData<BookingRow>(`/api/admin/bookings/${encodeURIComponent(id)}`);
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
    } finally {
      setDetailLoading(false);
    }
  }

  async function cancelBooking(id: string) {
    if (!window.confirm("Cancel this booking and restore seats on the trip?")) return;
    setBusyId(id);
    try {
      await apiPostJsonData(`/api/admin/bookings/${encodeURIComponent(id)}/cancel`, {});
      setDetail((cur) => (cur?.id === id ? null : cur));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  const statusFilters: { label: string; value?: string }[] = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const payFilters: { label: string; value?: string }[] = [
    { label: "Any payment", value: undefined },
    { label: "Unpaid", value: "UNPAID" },
    { label: "Paid", value: "PAID" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Bookings</h1>
        <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
          Full operational view: passenger contact, driver, route, payment state, and linked payment attempts. Open a row for
          identifiers and audit-friendly copy. Admin cancel restores seats and is audited.
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
        <div className="mb-4 flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <MaterialIcon name="bookmark" className="!text-base" />
              Booking status
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((t) => (
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
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <MaterialIcon name="payments" className="!text-base" />
              Payment on booking
            </div>
            <div className="flex flex-wrap gap-2">
              {payFilters.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setPaymentStatus(t.value)}
                  className={
                    paymentStatus === t.value
                      ? "rounded-full bg-secondary-container px-4 py-2 text-xs font-extrabold text-on-secondary-container"
                      : "rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-on-surface-variant">
          <span>{data ? `${data.total} booking(s) total` : "Loading…"}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 px-3 py-1.5 text-on-surface hover:bg-surface-container-low"
          >
            <MaterialIcon name="refresh" className="!text-base" />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Route & trip</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pay</th>
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
                    No bookings match these filters.
                  </td>
                </tr>
              ) : (
                data.items.map((b) => (
                  <tr key={b.id} className="border-t border-outline-variant/10 transition-colors hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => void openDetail(b.id)}
                        className="text-left font-mono text-xs font-extrabold text-primary-container hover:underline"
                      >
                        {b.id.slice(0, 10)}…
                      </button>
                      <div className="mt-1 text-[10px] font-bold text-on-surface-variant">
                        {b.seats} seat(s) · {b.totalAmount.toLocaleString()} {b.totalCurrency}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-on-surface-variant">{fmtShort(b.createdAt)}</td>
                    <td className="px-4 py-3 align-top">
                      {b.trip ? (
                        <>
                          <div className="font-extrabold text-on-surface">
                            {b.trip.originCity} → {b.trip.destinationCity}
                          </div>
                          <div className="mt-0.5 text-[10px] text-on-surface-variant">
                            {fmtShort(b.trip.departureAt)} · {b.trip.mode}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-[10px] text-on-surface-variant">
                            {b.trip.originName} → {b.trip.destinationName}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-extrabold text-on-surface">{b.passenger?.fullName ?? "—"}</div>
                      {b.passenger?.email ? (
                        <div className="text-[10px] text-on-surface-variant">{b.passenger.email}</div>
                      ) : null}
                      {b.passenger?.phoneE164 ? (
                        <div className="font-mono text-[10px] text-on-surface-variant">{b.passenger.phoneE164}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top text-xs font-semibold text-on-surface">{b.trip?.owner?.fullName ?? "—"}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${pill(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs font-extrabold text-on-surface-variant">{b.paymentStatus}</td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => void openDetail(b.id)}
                          className="text-xs font-extrabold text-primary-container hover:underline"
                        >
                          Details
                        </button>
                        {b.status !== "CANCELLED" && b.status !== "COMPLETED" ? (
                          <button
                            type="button"
                            disabled={busyId === b.id}
                            onClick={() => void cancelBooking(b.id)}
                            className="rounded-full bg-error-container px-3 py-1.5 text-[10px] font-extrabold text-on-error-container disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
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
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Booking detail"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-extrabold text-on-surface">Booking detail</div>
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
              <div className="mt-5 space-y-5 text-sm">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status & amounts</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${pill(detail.status)}`}>
                      {detail.status}
                    </span>
                    <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-extrabold">
                      Payment: {detail.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Seats</span>
                      <span className="font-extrabold">{detail.seats}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Total</span>
                      <span className="font-extrabold">
                        {detail.totalAmount.toLocaleString()} {detail.totalCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">External ref</span>
                      <span className="max-w-[60%] break-all font-mono text-[11px]">{detail.externalReference ?? "—"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Created</span>
                      <span className="text-right font-semibold">{fmtShort(detail.createdAt)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Updated</span>
                      <span className="text-right font-semibold">{fmtShort(detail.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Passenger</div>
                  <div className="mt-2 font-extrabold text-on-surface">{detail.passenger?.fullName ?? "—"}</div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div>
                      <span className="text-on-surface-variant">Email: </span>
                      {detail.passenger?.email ?? "—"}
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Phone: </span>
                      {detail.passenger?.phoneE164 ?? "—"}
                    </div>
                    {detail.passenger?.id ? (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="font-mono text-[10px] text-on-surface-variant">{detail.passenger.id}</span>
                        <button
                          type="button"
                          onClick={() => void copyText(detail.passenger!.id)}
                          className="text-[10px] font-extrabold text-primary-container underline"
                        >
                          Copy user ID
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {detail.trip ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trip</div>
                    <div className="mt-2 font-extrabold text-on-surface">
                      {detail.trip.originCity} → {detail.trip.destinationCity}
                    </div>
                    <div className="mt-1 text-xs text-on-surface-variant">
                      {detail.trip.originName} → {detail.trip.destinationName}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Departure</span>
                        <span className="text-right font-semibold">{fmtShort(detail.trip.departureAt)}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Mode / trip status</span>
                        <span className="font-extrabold">
                          {detail.trip.mode} · {detail.trip.status}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Instant booking</span>
                        <span className="font-extrabold">{detail.trip.allowInstantBooking ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Price / seat</span>
                        <span className="font-extrabold">
                          {detail.trip.priceAmount.toLocaleString()} {detail.trip.priceCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Seats (free / total)</span>
                        <span className="font-extrabold">
                          {detail.trip.seatsAvailable} / {detail.trip.seatsTotal}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 border-t border-outline-variant/10 pt-2">
                        <span className="text-on-surface-variant">Driver</span>
                        <span className="font-extrabold">{detail.trip.owner?.fullName ?? "—"}</span>
                        {detail.trip.owner?.email ? <span className="text-[11px]">{detail.trip.owner.email}</span> : null}
                        {detail.trip.owner?.id ? (
                          <button
                            type="button"
                            onClick={() => void copyText(detail.trip!.owner!.id)}
                            className="w-fit text-left text-[10px] font-extrabold text-primary-container underline"
                          >
                            Copy driver ID
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void copyText(detail.trip!.id)}
                          className="mt-1 w-fit text-left text-[10px] font-extrabold text-primary-container underline"
                        >
                          Copy trip ID
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {detail.payments && detail.payments.length > 0 ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Payment records</div>
                    <ul className="mt-3 space-y-3">
                      {detail.payments.map((p) => (
                        <li key={p.id} className="rounded-lg border border-outline-variant/15 bg-surface-container-lowest/80 p-3 text-xs">
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-extrabold">
                              {p.provider} · {p.status}
                            </span>
                            <span className="font-extrabold">
                              {p.amount.toLocaleString()} {p.currency}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-[10px] text-on-surface-variant">{p.id}</div>
                          <div className="mt-1 text-[10px] text-on-surface-variant">
                            {p.hasProof ? "Receipt on file" : "No receipt file"} · {fmtShort(p.createdAt)}
                          </div>
                          {p.providerReference ? (
                            <div className="mt-1 font-mono text-[10px]">Ref: {p.providerReference}</div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[10px] text-on-surface-variant">Open Payments to review Baridi Mob proof images.</p>
                  </div>
                ) : null}

                {detail.status !== "CANCELLED" && detail.status !== "COMPLETED" ? (
                  <button
                    type="button"
                    disabled={busyId === detail.id}
                    onClick={() => void cancelBooking(detail.id)}
                    className="w-full rounded-full bg-error-container py-3 text-sm font-extrabold text-on-error-container disabled:opacity-50"
                  >
                    Cancel booking (restore seats)
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
