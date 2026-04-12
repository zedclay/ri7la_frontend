"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { getPlaceByCityKey, placePrimaryLabel } from "@/lib/algeriaPlaces";

type TripRow = {
  id: string;
  mode: "CARPOOL" | "BUS" | "TRAIN";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  originCity: string;
  originName: string;
  destinationCity: string;
  destinationName: string;
  departureAt: string;
  seatsTotal: number;
  seatsAvailable: number;
  priceAmount: number;
  priceCurrency: string;
};

type TabId = "all" | "draft" | "upcoming" | "live" | "completed" | "cancelled";

function tripDetailHref(t: TripRow): string {
  if (t.mode === "BUS") return `/bus/${t.id}`;
  if (t.mode === "TRAIN") return `/train/${t.id}`;
  return `/carpool/${t.id}`;
}

function labelOriginDest(t: TripRow, locale: string) {
  const o = getPlaceByCityKey(t.originCity);
  const d = getPlaceByCityKey(t.destinationCity);
  const from = o ? placePrimaryLabel(o, locale) : t.originName || t.originCity;
  const to = d ? placePrimaryLabel(d, locale) : t.destinationName || t.destinationCity;
  return { from, to };
}

const TRIP_ACTIVE_HOURS = 12;

/** Bucket for counts; `null` = older published trip — visible only under "All". */
function tabBucket(t: TripRow, now: Date): TabId | null {
  if (t.status === "DRAFT") return "draft";
  if (t.status === "CANCELLED") return "cancelled";
  if (t.status === "COMPLETED") return "completed";
  const dep = new Date(t.departureAt);
  if (t.status === "PUBLISHED") {
    if (dep > now) return "upcoming";
    const endWindow = new Date(dep.getTime() + TRIP_ACTIVE_HOURS * 60 * 60 * 1000);
    if (now <= endWindow) return "live";
    return null;
  }
  return null;
}

function tripMatchesTab(t: TripRow, tab: TabId, now: Date): boolean {
  if (tab === "all") return true;
  if (tab === "draft") return t.status === "DRAFT";
  if (tab === "cancelled") return t.status === "CANCELLED";
  if (tab === "completed") return t.status === "COMPLETED";
  if (tab === "upcoming") return t.status === "PUBLISHED" && new Date(t.departureAt) > now;
  if (tab === "live") {
    if (t.status !== "PUBLISHED") return false;
    const dep = new Date(t.departureAt);
    if (dep > now) return false;
    const endWindow = new Date(dep.getTime() + TRIP_ACTIVE_HOURS * 60 * 60 * 1000);
    return now <= endWindow;
  }
  return false;
}

export function DriverTripsClient() {
  const t = useTranslations("driverTrips");
  const locale = useLocale();
  const [rows, setRows] = useState<TripRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("all");

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setRows([]);
      return;
    }
    setError(null);
    try {
      const res = await apiGetJsonData<{ items: TripRow[]; total: number }>("/api/trips/mine");
      setRows(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError"));
      setRows([]);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onAuth() {
      void load();
    }
    window.addEventListener("ri7la_auth", onAuth);
    return () => window.removeEventListener("ri7la_auth", onAuth);
  }, [load]);

  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => tripMatchesTab(r, tab, now));
  }, [rows, tab, now]);

  const counts = useMemo(() => {
    const c: Record<TabId, number> = {
      all: rows?.length ?? 0,
      draft: 0,
      upcoming: 0,
      live: 0,
      completed: 0,
      cancelled: 0,
    };
    if (!rows) return c;
    for (const r of rows) {
      const b = tabBucket(r, now);
      if (b) c[b]++;
    }
    return c;
  }, [rows, now]);

  const weekStats = useMemo(() => {
    if (!rows) return { upcoming: 0, drafts: 0, revenue: 0 };
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    let upcoming = 0;
    let drafts = 0;
    let revenue = 0;
    for (const r of rows) {
      if (r.status === "DRAFT") {
        drafts++;
        continue;
      }
      const dep = new Date(r.departureAt);
      if (r.status === "PUBLISHED" && dep >= start && dep < end) upcoming++;
      const sold = Math.max(0, r.seatsTotal - r.seatsAvailable);
      revenue += sold * r.priceAmount;
    }
    return { upcoming, drafts, revenue };
  }, [rows]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: t("tabAll") },
    { id: "draft", label: t("tabDrafts") },
    { id: "upcoming", label: t("tabUpcoming") },
    { id: "live", label: t("tabLive") },
    { id: "completed", label: t("tabCompleted") },
    { id: "cancelled", label: t("tabCancelled") },
  ];

  if (rows === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-on-surface-variant">
        <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
      </div>
    );
  }

  if (!getAccessToken()) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center text-on-surface">
        <p className="font-semibold">{t("signInHint")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
          <p className="mt-1 text-on-surface-variant">{t("subtitle")}</p>
        </div>
        <Link
          href="/driver/trips/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
        >
          {t("createNew")}
          <MaterialIcon name="add" className="!text-xl" />
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container" role="alert">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={
              tab === x.id
                ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
            }
          >
            {x.label}
            {counts[x.id] > 0 ? ` (${counts[x.id]})` : ""}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-lowest px-6 py-16 text-center shadow-sm">
          <MaterialIcon name="route" className="mx-auto !text-4xl text-outline" />
          <p className="mt-4 text-on-surface-variant">{t("empty")}</p>
          <Link href="/driver/trips/new" className="mt-4 inline-block text-sm font-extrabold text-primary underline underline-offset-4">
            {t("createNew")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((trip) => {
            const { from, to } = labelOriginDest(trip, locale);
            const sold = Math.max(0, trip.seatsTotal - trip.seatsAvailable);
            const revenue = sold * trip.priceAmount;
            const dep = new Date(trip.departureAt);
            const depLabel = dep.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
              dateStyle: "medium",
              timeStyle: "short",
            });
            const modeLabel =
              trip.mode === "CARPOOL" ? t("modeCarpool") : trip.mode === "BUS" ? t("modeBus") : t("modeTrain");
            const statusLabel =
              trip.status === "DRAFT"
                ? t("statusDraft")
                : trip.status === "PUBLISHED"
                  ? t("statusPublished")
                  : trip.status === "COMPLETED"
                    ? t("statusCompleted")
                    : t("statusCancelled");

            return (
              <div key={trip.id} className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
                    <MaterialIcon name="calendar_today" className="!text-xl text-outline" />
                    {depLabel}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[10px] font-extrabold text-on-surface-variant">
                      {modeLabel}
                    </span>
                    <span className="rounded-full bg-primary-container/25 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("fromLabel")}</div>
                    <div className="mt-1 text-lg font-extrabold text-on-surface">{from}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("toLabel")}</div>
                    <div className="mt-1 text-lg font-extrabold text-on-surface">{to}</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/10 pt-4">
                  <div className="text-xs font-bold text-on-surface-variant">
                    {t("seats")}{" "}
                    <span className="text-on-surface">
                      {sold}/{trip.seatsTotal}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-on-surface-variant">
                    {t("estimated")}{" "}
                    <span className="text-primary-container">
                      {revenue.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ")} {trip.priceCurrency}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  <Link
                    href={tripDetailHref(trip)}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary shadow-md active:scale-95"
                  >
                    {t("viewDetails")}
                  </Link>
                  <Link
                    href="/driver/requests"
                    className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95"
                  >
                    {t("requests")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-primary-container p-8 text-white shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">{t("thisWeek")}</div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-extrabold tabular-nums">{weekStats.upcoming}</div>
              <div className="text-xs font-bold opacity-90">{t("scheduledCount")}</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold tabular-nums">{weekStats.drafts}</div>
              <div className="text-xs font-bold opacity-90">{t("draftCount")}</div>
            </div>
          </div>
          <div className="mt-6 text-sm font-extrabold">{t("revenueHint")}</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums">
            {weekStats.revenue.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ")} DZD
          </div>
        </div>
      </div>
    </div>
  );
}
