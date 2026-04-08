import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-on-surface-variant">
            Monitor platform health, payments, verifications, and support requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/payments"
            className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
          >
            Review Payments
          </Link>
          <Link
            href="/admin/drivers"
            className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95"
          >
            Verify Drivers
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { title: "Total bookings", value: "12,482", icon: "confirmation_number", pill: "+4.2%" },
          { title: "Online payments", value: "2,981", icon: "payments", pill: "DZD" },
          { title: "Refund requests", value: "42", icon: "undo", pill: "24h" },
          { title: "Support tickets", value: "14", icon: "support_agent", pill: "OPEN" },
        ].map((k) => (
          <div key={k.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low">
                <MaterialIcon name={k.icon} className="!text-2xl text-primary" />
              </div>
              <span className="rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
                {k.pill}
              </span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{k.title}</div>
            <div className="mt-2 text-3xl font-extrabold text-on-surface">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Recent Activity</div>
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
              <MaterialIcon name="schedule" className="!text-lg" />
              Last 24 hours
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: "verified_user", title: "Driver verification approved", meta: "Driver: A. Kamel • 3 min ago", pill: "APPROVED", pillStyle: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
              { icon: "payments", title: "Payment flagged for review", meta: "TXN #88212 • 27 min ago", pill: "REVIEW", pillStyle: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
              { icon: "support_agent", title: "New support ticket created", meta: "Booking RX-9283-LZ • 1h ago", pill: "OPEN", pillStyle: "bg-error-container text-on-error-container" },
            ].map((a) => (
              <div key={a.title} className="flex items-center justify-between gap-4 rounded-2xl bg-surface-container-low p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                    <MaterialIcon name={a.icon} className="!text-2xl text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-on-surface">{a.title}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant">{a.meta}</div>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${a.pillStyle}`}>{a.pill}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/admin/bookings" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              Booking Monitoring
            </Link>
            <Link href="/admin/users" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              User Management
            </Link>
            <Link href="/admin/support" className="rounded-2xl bg-surface-container-low px-5 py-4 text-sm font-extrabold text-on-surface active:scale-95">
              Support Inbox
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="security" className="!text-lg" />
              Risk snapshot
            </div>
            <div className="text-lg font-extrabold">Fraud Signals</div>
            <p className="mt-2 text-sm text-white/80">
              6 users require additional verification. 2 payments are flagged by anomaly detection.
            </p>
            <Link href="/admin/users" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              Review Users
            </Link>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 text-sm font-extrabold text-on-surface">System Status</div>
            <div className="space-y-3 text-sm">
              {[
                { label: "API", ok: true },
                { label: "Payments", ok: true },
                { label: "SMS provider", ok: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <span className="font-bold text-on-surface">{s.label}</span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold ${s.ok ? "bg-primary-fixed/40 text-on-primary-fixed-variant" : "bg-error-container text-on-error-container"}`}>
                    <span className={`h-2 w-2 rounded-full ${s.ok ? "bg-primary" : "bg-error"}`} />
                    {s.ok ? "Healthy" : "Degraded"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

