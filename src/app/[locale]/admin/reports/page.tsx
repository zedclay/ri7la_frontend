import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminReportsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Reviews / Reports</h1>
          <p className="mt-1 text-on-surface-variant">
            Handle user reports, review moderation, and trust & safety signals.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { title: "Reports (24h)", value: "12", icon: "report" },
          { title: "Fake profiles", value: "3", icon: "person_off" },
          { title: "Refund disputes", value: "4", icon: "gavel" },
          { title: "High risk users", value: "6", icon: "warning" },
        ].map((k) => (
          <div key={k.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={k.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{k.title}</div>
            <div className="mt-2 text-2xl font-extrabold text-on-surface">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-extrabold text-on-surface">Queue</div>
          <span className="rounded-full bg-tertiary-fixed/60 px-3 py-1 text-[10px] font-extrabold text-on-tertiary-fixed">
            5 NEED REVIEW
          </span>
        </div>

        <div className="space-y-3">
          {[
            { type: "Review report", text: "Abusive language in review (Trip TR-88921).", severity: "MEDIUM" },
            { type: "User report", text: "Driver no-show complaint (Booking PX-4421-QR).", severity: "HIGH" },
            { type: "Fraud signal", text: "Multiple accounts using same phone number.", severity: "HIGH" },
          ].map((r) => (
            <div key={r.type + r.text} className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                  <MaterialIcon name="flag" className="!text-2xl text-primary" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-on-surface">{r.type}</div>
                  <div className="mt-1 text-xs text-on-surface-variant">{r.text}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${r.severity === "HIGH" ? "bg-error-container text-on-error-container" : "bg-tertiary-fixed/60 text-on-tertiary-fixed"}`}>
                  {r.severity}
                </span>
                <button type="button" className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  View
                </button>
                <button type="button" className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

