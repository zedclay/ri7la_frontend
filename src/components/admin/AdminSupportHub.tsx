"use client";

import { Link } from "@/i18n/navigation";
import { apiGetJsonData } from "@/lib/api";
import { formatAuditAction } from "@/lib/auditActionLabels";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useEffect, useState } from "react";

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string | null } | null;
};

const SHORTCUTS: { href: string; label: string; icon: string; desc: string }[] = [
  { href: "/admin/bookings", label: "Bookings", icon: "confirmation_number", desc: "Cancellations & status" },
  { href: "/admin/users", label: "Users", icon: "group", desc: "Accounts & roles" },
  { href: "/admin/payments", label: "Payments", icon: "payments", desc: "Failed / pending" },
  { href: "/admin/trips", label: "Trips", icon: "route", desc: "Admin cancel" },
  { href: "/admin/drivers", label: "Drivers", icon: "badge", desc: "Verification" },
  { href: "/admin/reports", label: "Reviews", icon: "flag", desc: "Moderation" },
  { href: "/admin/audit", label: "Audit log", icon: "history", desc: "All admin actions" },
];

export function AdminSupportHub() {
  const [audit, setAudit] = useState<{ items: AuditRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiGetJsonData<{ items: AuditRow[] }>("/api/admin/audit-logs?limit=20");
        if (!cancelled) setAudit(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load activity");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Support &amp; operations</h1>
        <p className="mt-1 text-on-surface-variant">
          Saafir does not ship a separate ticketing API yet. Use these modules for real workflows; the feed below is live data from the{" "}
          <strong>audit log</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-start gap-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:bg-surface-container-low"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/15">
              <MaterialIcon name={s.icon} className="!text-2xl text-primary" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-on-surface">{s.label}</div>
              <div className="mt-1 text-xs text-on-surface-variant">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-on-surface">Recent audit activity</h2>
          <Link href="/admin/audit" className="text-xs font-extrabold text-primary hover:underline">
            Open full log
          </Link>
        </div>
        {error ? (
          <div className="rounded-xl bg-error-container/15 px-4 py-3 text-sm text-on-error-container">{error}</div>
        ) : !audit ? (
          <div className="flex justify-center py-10 text-on-surface-variant">
            <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
          </div>
        ) : audit.items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No audit entries yet.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/10">
            {audit.items.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
