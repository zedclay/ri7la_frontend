import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminDriverVerificationPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Driver Verification</h1>
          <p className="mt-1 text-on-surface-variant">
            Review and approve driver identity and vehicle documents.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Bulk Actions
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-on-surface">Pending Verifications</div>
            <div className="flex items-center gap-2">
              {["All", "ID", "License", "Insurance"].map((t) => (
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

          <div className="space-y-4">
            {[
              { name: "Karim B.", doc: "Driver License", age: "Submitted 2h ago", risk: "Low" },
              { name: "Meriem A.", doc: "Vehicle Insurance", age: "Submitted 5h ago", risk: "Medium" },
              { name: "Sofiane K.", doc: "National ID", age: "Submitted 1d ago", risk: "High" },
            ].map((d) => (
              <div key={d.name + d.doc} className="rounded-2xl bg-surface-container-low p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                      {d.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-on-surface">{d.name}</div>
                      <div className="mt-1 text-xs font-bold text-on-surface-variant">
                        {d.doc} • {d.age}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
                        d.risk === "Low"
                          ? "bg-primary-fixed/40 text-on-primary-fixed-variant"
                          : d.risk === "Medium"
                            ? "bg-tertiary-fixed/60 text-on-tertiary-fixed"
                            : "bg-error-container text-on-error-container"
                      }`}
                    >
                      Risk: {d.risk}
                    </span>
                    <button type="button" className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                      View Docs
                    </button>
                    <button type="button" className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
                      Approve
                    </button>
                    <button type="button" className="rounded-full bg-error-container px-4 py-2 text-xs font-extrabold text-on-error-container active:scale-95">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="policy" className="!text-lg" />
              Compliance
            </div>
            <div className="text-lg font-extrabold">Algeria-first verification</div>
            <p className="mt-2 text-sm text-white/80">
              Ensure document format aligns with Algerian ID and license standards. Request re-upload if unclear.
            </p>
            <button type="button" className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              Open Guidelines
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 text-sm font-extrabold text-on-surface">Quick Stats</div>
            <div className="space-y-3">
              {[
                { label: "Pending reviews", value: "6" },
                { label: "Approved today", value: "14" },
                { label: "Rejected today", value: "2" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <div className="text-xs font-bold text-on-surface-variant">{s.label}</div>
                  <div className="text-sm font-extrabold text-on-surface">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

