"use client";

import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const READ_ONLY = [
  { label: "Markets", value: "Algeria (DZD)", icon: "flag" as const },
  { label: "Languages", value: "French & Arabic (UI)", icon: "language" as const },
  { label: "Payment methods", value: "Edahabia, CIB, Baridi Mob (receipt review), bank/cash off", icon: "credit_card" as const },
];

const OPS_LINKS: { href: string; label: string; icon: string }[] = [
  { href: "/admin/users", label: "Users & roles", icon: "group" },
  { href: "/admin/drivers", label: "Driver verification", icon: "badge" },
  { href: "/admin/audit", label: "Audit log", icon: "history" },
];

export function AdminSettingsHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Platform settings</h1>
        <p className="mt-1 text-on-surface-variant">
          Centralized feature flags and SMS templates are not exposed via API yet. What follows is accurate for the current app; use the links to manage access and compliance.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary-container/10 px-4 py-3 text-sm text-on-surface">
        <strong>Live tools:</strong> user status, roles, driver verification, trips/bookings/payments, reviews, and audit logging are wired to the backend.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-extrabold text-on-surface">Current product defaults</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {READ_ONLY.map((f) => (
              <div key={f.label} className="rounded-xl bg-surface-container-low px-4 py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{f.label}</div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm font-extrabold text-on-surface">
                  <span className="leading-snug">{f.value}</span>
                  <MaterialIcon name={f.icon} className="!text-xl shrink-0 text-outline" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Operations</div>
            <div className="flex flex-wrap gap-3">
              {OPS_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-[0.99]"
                >
                  <MaterialIcon name={l.icon} className="!text-lg" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Future configuration</div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Maintenance mode, global payment kill-switch, and editable SMS templates will require dedicated APIs and approvals — not available in this build.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-full bg-outline-variant/30 py-3 text-sm font-extrabold text-on-surface-variant"
              title="Not implemented"
            >
              Maintenance mode (disabled)
            </button>
            <button
              type="button"
              disabled
              className="mt-3 w-full cursor-not-allowed rounded-full bg-outline-variant/30 py-3 text-sm font-extrabold text-on-surface-variant"
              title="Not implemented"
            >
              Disable online payments (disabled)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
