import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Driver Account</h1>
        <p className="mt-1 text-on-surface-variant">
          Manage your profile, vehicle information, and verification documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Personal Profile</div>
            <button type="button" className="text-xs font-bold text-primary underline underline-offset-4">
              Edit
            </button>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-6 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-xl font-extrabold text-on-primary-fixed-variant">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-extrabold text-on-surface">Alex Thompson</div>
              <div className="mt-1 text-sm text-on-surface-variant">alex.driver@ri7la.com</div>
              <div className="mt-1 text-sm text-on-surface-variant">+213 550 12 34 56</div>
            </div>
            <div className="rounded-full bg-primary-fixed/40 px-4 py-2 text-[10px] font-extrabold text-on-primary-fixed-variant">
              Fully Verified
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Verification Documents</div>
            <div className="space-y-3">
              {[
                { icon: "badge", label: "National ID Card", sub: "Expires: Oct 2028", pill: "Verified", pillStyle: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
                { icon: "credit_card", label: "Driver's License", sub: "Expires: May 2026", pill: "Verified", pillStyle: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
                { icon: "shield", label: "Vehicle Insurance", sub: "Expires in 12 days", pill: "Renewal Required", pillStyle: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between rounded-2xl bg-surface-container-low p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                      <MaterialIcon name={d.icon} className="!text-2xl text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-on-surface">{d.label}</div>
                      <div className="text-xs text-on-surface-variant">{d.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${d.pillStyle}`}>
                      {d.pill}
                    </span>
                    <button type="button" className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-extrabold text-on-surface">Vehicle</div>
              <button type="button" className="text-xs font-bold text-primary underline underline-offset-4">
                Edit
              </button>
            </div>
            <div className="h-28 rounded-2xl bg-surface-container-low" />
            <div className="mt-4 text-sm font-extrabold text-on-surface">Dacia Logan</div>
            <div className="text-xs text-on-surface-variant">Snow White • 2022 Model</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface-container-low px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Plate</div>
                <div className="mt-1 text-sm font-extrabold text-on-surface">01234 122 16</div>
              </div>
              <div className="rounded-xl bg-surface-container-low px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Seats</div>
                <div className="mt-1 text-sm font-extrabold text-on-surface">4 Available</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-primary-container/10 px-4 py-3 text-xs font-bold text-primary-container">
              Air Conditioning Equipped
            </div>
          </div>

          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="text-sm font-extrabold">Need Help?</div>
            <div className="mt-1 text-xs text-white/80">
              Our support team is available 24/7 to help with documentation or account issues.
            </div>
            <button type="button" className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

