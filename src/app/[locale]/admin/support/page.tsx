import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminSupportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Support Center</h1>
          <p className="mt-1 text-on-surface-variant">
            Handle customer escalations, disputes, and platform issues.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-on-surface">Ticket Queue</div>
            <div className="flex flex-wrap gap-2">
              {["Open", "In Progress", "Resolved", "Closed"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    t === "Open"
                      ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                      : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: "TCK-1022", subject: "Refund request pending", meta: "Booking HX-1102-AA • 12 min ago", priority: "HIGH", pill: "bg-error-container text-on-error-container" },
              { id: "TCK-1023", subject: "Driver no-show report", meta: "Trip Algiers→Blida • 44 min ago", priority: "MEDIUM", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
              { id: "TCK-1024", subject: "Payment failed (CIB)", meta: "TXN-88212 • 1h ago", priority: "HIGH", pill: "bg-error-container text-on-error-container" },
              { id: "TCK-1025", subject: "Change seat request", meta: "Booking RX-9283-LZ • 2h ago", priority: "LOW", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
            ].map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                    <MaterialIcon name="support_agent" className="!text-2xl text-primary" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-on-surface">
                      {t.subject}
                      <span className="text-xs font-bold text-on-surface-variant">{t.id}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-on-surface-variant">{t.meta}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${t.pill}`}>{t.priority}</span>
                  <button type="button" className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="query_stats" className="!text-lg" />
              SLA
            </div>
            <div className="text-lg font-extrabold">Average response time</div>
            <div className="mt-2 text-4xl font-extrabold">4m 12s</div>
            <div className="mt-2 text-sm text-white/80">Across all open tickets</div>
            <button type="button" className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              View Insights
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 text-sm font-extrabold text-on-surface">Quick Actions</div>
            <div className="space-y-3">
              {[
                { icon: "search", label: "Search bookings" },
                { icon: "payments", label: "Investigate payment" },
                { icon: "verified_user", label: "Review driver documents" },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl bg-surface-container-low px-4 py-4 text-sm font-extrabold text-on-surface active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <MaterialIcon name={a.icon} className="!text-xl text-outline" />
                    {a.label}
                  </span>
                  <MaterialIcon name="chevron_right" className="!text-xl text-outline" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

