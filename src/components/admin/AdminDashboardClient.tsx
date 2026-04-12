"use client";

import { Link } from "@/i18n/navigation";
import { apiGetJsonData } from "@/lib/api";
import { formatAuditAction } from "@/lib/auditActionLabels";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useEffect, useState } from "react";

type DashboardSummary = {
  users: { total: number; suspended: number };
  trips: { published: number; drafts: number };
  bookings: { pending: number; confirmed: number };
  payments: { pending: number; failed: number };
  reviews: { visible: number; hidden: number };
};

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string | null } | null;
};

export function AdminDashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [audit, setAudit] = useState<{ items: AuditRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [s, a] = await Promise.all([
          apiGetJsonData<DashboardSummary>("/api/admin/dashboard/summary"),
          apiGetJsonData<{ items: AuditRow[] }>("/api/admin/audit-logs?limit=8"),
        ]);
        if (!cancelled) {
          setSummary(s);
          setAudit(a);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-2xl border border-error-container bg-error-container/20 px-6 py-4 text-sm text-on-error-container">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-10 w-64 rounded-lg bg-surface-container-low" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Users (total)",
      value: String(summary.users.total),
      sub: `${summary.users.suspended} suspended`,
      icon: "group",
    },
    {
      title: "Trips",
      value: String(summary.trips.published + summary.trips.drafts),
      sub: `${summary.trips.published} published`,
      icon: "route",
    },
    {
      title: "Bookings",
      value: String(summary.bookings.pending + summary.bookings.confirmed),
      sub: `${summary.bookings.pending} pending`,
      icon: "confirmation_number",
    },
    {
      title: "Payments",
      value: String(summary.payments.pending + summary.payments.failed),
      sub: `${summary.payments.failed} failed`,
      icon: "payments",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Operations Dashboard</h1>
          <p className="mt-1 text-on-surface-variant">
            Live counts from the Ri7la API. Use the sidebar for queues and entity management.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link
            href="/admin/payments?status=PENDING"
            className="rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
          >
            Pending payments
          </Link>
          <Link
            href="/admin/bookings?status=PENDING"
            className="rounded-full bg-tertiary-fixed/50 px-5 py-3 text-sm font-extrabold text-on-tertiary-fixed active:scale-95"
          >
            Pending bookings
          </Link>
          <Link
            href="/admin/drivers"
            className="rounded-full bg-surface-container-low px-5 py-3 text-sm font-extrabold text-on-surface active:scale-95"
          >
            Drivers
          </Link>
          <Link
            href="/admin/trips?status=PUBLISHED"
            className="rounded-full bg-surface-container-low px-5 py-3 text-sm font-extrabold text-on-surface active:scale-95"
          >
            Live trips
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low">
                <MaterialIcon name={k.icon} className="!text-2xl text-primary" />
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{k.title}</div>
            <div className="mt-2 text-3xl font-extrabold text-on-surface">{k.value}</div>
            <div className="mt-1 text-xs font-bold text-on-surface-variant">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Recent audit log</div>
            <Link href="/admin/audit" className="text-xs font-extrabold text-primary-container hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(audit?.items ?? []).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No audit entries yet.</p>
            ) : (
              audit?.items.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm">
                  <div>
                    <span className="font-extrabold text-on-surface" title={a.action}>
                      {formatAuditAction(a.action)}
                    </span>
                    <span className="text-on-surface-variant">
                      {" "}
                      · {a.entityType}
                      {a.entityId ? ` ${a.entityId.slice(0, 8)}…` : ""}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-on-surface-variant">
                    {a.actor?.fullName ?? "—"} · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/admin/bookings" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              Bookings
            </Link>
            <Link href="/admin/users" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              Users
            </Link>
            <Link href="/admin/support" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              Support
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="rate_review" className="!text-lg" />
              Reviews
            </div>
            <div className="text-lg font-extrabold">{summary.reviews.visible} visible</div>
            <p className="mt-2 text-sm text-white/80">{summary.reviews.hidden} hidden by moderation.</p>
            <Link
              href="/admin/reports"
              className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95"
            >
              Moderation queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
