import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Admin Settings</h1>
        <p className="mt-1 text-on-surface-variant">
          Manage platform configuration, notification templates, and safety policies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-extrabold text-on-surface">General</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Default language", value: "French (FR) + Arabic (AR)", icon: "language" },
              { label: "Country", value: "Algeria (DZ)", icon: "flag" },
              { label: "Cash enabled", value: "Yes", icon: "payments" },
              { label: "Online payments", value: "Edahabia + CIB + Bank", icon: "credit_card" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-surface-container-low px-4 py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {f.label}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm font-extrabold text-on-surface">
                  <span className="truncate">{f.value}</span>
                  <MaterialIcon name={f.icon} className="!text-xl text-outline" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-surface-container-low p-6">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Notifications</div>
            <div className="space-y-3">
              {[
                { label: "OTP SMS template", status: "Active" },
                { label: "Booking confirmation", status: "Active" },
                { label: "Refund status updates", status: "Active" },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl bg-surface-container-lowest px-4 py-4 text-sm font-extrabold text-on-surface active:scale-[0.99]"
                >
                  <span className="flex items-center gap-3">
                    <MaterialIcon name="notifications" className="!text-xl text-outline" />
                    {t.label}
                  </span>
                  <span className="rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="shield" className="!text-lg" />
              Safety policy
            </div>
            <div className="text-lg font-extrabold">Trust & Safety Rules</div>
            <p className="mt-2 text-sm text-white/80">
              Configure verification rules and incident handling workflows.
            </p>
            <button type="button" className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              Open Policy
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Danger Zone</div>
            <button type="button" className="w-full rounded-full bg-error py-3 text-sm font-extrabold text-white active:scale-95">
              Disable Online Payments
            </button>
            <button type="button" className="mt-3 w-full rounded-full bg-surface-container-low py-3 text-sm font-extrabold text-on-surface active:scale-95">
              Maintenance Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

