import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminTripsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Trips</h1>
          <p className="mt-1 text-on-surface-variant">
            Monitor published trips, cancellations, incidents and compliance.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Create Trip Override
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-on-surface">Trip Monitor</div>
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Canceled", "Reported"].map((t) => (
              <button
                key={t}
                type="button"
                className={
                  t === "All"
                    ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                    : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant/10">
          <div className="grid grid-cols-7 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div>Trip</div>
            <div className="col-span-2">Route</div>
            <div>Mode</div>
            <div>Status</div>
            <div>Seats</div>
            <div className="text-right">Actions</div>
          </div>
          {[
            { id: "TR-88920", route: "Algiers → Oran", mode: "Bus", status: "ACTIVE", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant", seats: "48/50" },
            { id: "TR-88921", route: "Algiers → Blida", mode: "Carpool", status: "REPORTED", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed", seats: "3/4" },
            { id: "TR-88922", route: "Oran → Tlemcen", mode: "Bus", status: "CANCELED", pill: "bg-error-container text-on-error-container", seats: "—" },
          ].map((t) => (
            <div key={t.id} className="grid grid-cols-7 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
              <div className="font-extrabold text-primary-container">{t.id}</div>
              <div className="col-span-2 font-extrabold text-on-surface">{t.route}</div>
              <div className="text-xs font-extrabold text-on-surface-variant">{t.mode}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${t.pill}`}>{t.status}</span>
              </div>
              <div className="text-xs font-extrabold text-on-surface">{t.seats}</div>
              <div className="text-right">
                <button type="button" className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: "warning", title: "Incidents", value: "2 open", color: "bg-tertiary-fixed/50" },
            { icon: "schedule", title: "Delays", value: "6 today", color: "bg-surface-container-low" },
            { icon: "shield", title: "Compliance", value: "Healthy", color: "bg-primary-fixed/30" },
          ].map((k) => (
            <div key={k.title} className={`rounded-2xl p-6 ${k.color}`}>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
                <MaterialIcon name={k.icon} className="!text-2xl text-primary" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{k.title}</div>
              <div className="mt-2 text-2xl font-extrabold text-on-surface">{k.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

