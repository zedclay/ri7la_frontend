import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function PassengerSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Profile & Settings</h1>
        <p className="mt-1 text-on-surface-variant">Manage personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-tertiary-fixed/40">
            <span className="text-2xl font-extrabold text-on-tertiary-fixed">A</span>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-extrabold text-on-surface">Alex Johnson</div>
            <div className="text-sm text-on-surface-variant">alex.johnson@example.com</div>
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface active:scale-95"
          >
            Edit Profile
          </button>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold text-on-surface">Personal Information</div>
            <span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold text-on-surface-variant">
              PUBLIC PROFILE
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Full Name", value: "Alex Johnson", icon: "person" },
              { label: "Date of Birth", value: "05/14/1992", icon: "calendar_today" },
              { label: "Gender", value: "Male", icon: "wc" },
              { label: "Nationality", value: "Algerian", icon: "flag" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl bg-surface-container-low px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {f.label}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm font-bold text-on-surface">
                  <span className="truncate">{f.value}</span>
                  <MaterialIcon name={f.icon} className="!text-xl text-outline" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-bold text-on-surface">Contact Information</div>
          <div className="space-y-4">
            {[
              { label: "Email Address", value: "alex.johnson@example.com", icon: "mail", badge: "VERIFIED" },
              { label: "Phone Number", value: "+213 555 123 456", icon: "smartphone", badge: "VERIFIED" },
              { label: "Residential Address", value: "Algiers, Algeria", icon: "home", badge: "Change" },
            ].map((i) => (
              <div key={i.label} className="flex items-center gap-4 rounded-xl bg-surface-container-low px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60">
                  <MaterialIcon name={i.icon} className="!text-2xl text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {i.label}
                  </div>
                  <div className="mt-1 truncate text-sm font-bold text-on-surface">{i.value}</div>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold text-on-surface-variant">
                  {i.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 text-sm font-bold text-on-surface">Password & Security</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-4">
              <div>
                <div className="text-sm font-bold text-on-surface">Two-factor Authentication</div>
                <div className="text-xs text-on-surface-variant">Added layer of security</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={true}
                className="relative h-5 w-10 rounded-full bg-primary transition-colors"
              >
                <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-all" />
              </button>
            </div>

            {[
              { label: "Change Password", icon: "lock" },
              { label: "Active Sessions", icon: "devices" },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                className="flex w-full items-center justify-between rounded-xl bg-surface-container-low px-4 py-4 text-sm font-bold text-on-surface active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <MaterialIcon name={a.icon} className="!text-xl text-outline" />
                  {a.label}
                </span>
                <MaterialIcon name="chevron_right" className="!text-xl text-outline" />
              </button>
            ))}

            <div className="rounded-xl bg-tertiary-fixed/40 px-4 py-4 text-sm text-on-tertiary-fixed-variant">
              <div className="flex items-start gap-3">
                <MaterialIcon name="shield" className="!text-xl text-tertiary" />
                <div>
                  <div className="font-bold text-on-tertiary-fixed">Security Tip</div>
                  <div className="text-xs">
                    Complete your emergency contacts and keep your profile information updated.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:flex-row">
        <button type="button" className="text-sm font-bold text-error underline underline-offset-4">
          Deactivate Account
        </button>
        <div className="flex gap-3">
          <button type="button" className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-bold text-on-surface active:scale-95">
            Cancel
          </button>
          <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

