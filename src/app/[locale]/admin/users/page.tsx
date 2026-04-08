import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">User Management</h1>
          <p className="mt-1 text-on-surface-variant">
            Search, verify, suspend, or review user activity across the platform.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Create Admin Note
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
            <MaterialIcon name="filter_alt" className="!text-xl text-primary" />
            Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Verified", "Pending", "Suspended"].map((t) => (
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
          <div className="grid grid-cols-6 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div className="col-span-2">User</div>
            <div>Role</div>
            <div>Status</div>
            <div>Trust</div>
            <div className="text-right">Actions</div>
          </div>
          {[
            { name: "Amine Rahmani", email: "amine@example.dz", role: "Passenger", status: "ACTIVE", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant", trust: "High" },
            { name: "Karim B.", email: "karim.driver@ri7la.com", role: "Driver", status: "PENDING", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed", trust: "Medium" },
            { name: "Yacine K.", email: "yacine@ri7la.com", role: "Passenger", status: "SUSPENDED", pill: "bg-error-container text-on-error-container", trust: "Low" },
          ].map((u) => (
            <div key={u.email} className="grid grid-cols-6 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
              <div className="col-span-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-extrabold text-on-surface">{u.name}</div>
                  <div className="truncate text-[10px] font-bold text-on-surface-variant">{u.email}</div>
                </div>
              </div>
              <div className="font-bold text-on-surface">{u.role}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${u.pill}`}>{u.status}</span>
              </div>
              <div className="font-extrabold text-on-surface">{u.trust}</div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  View
                </button>
                <button type="button" className="rounded-full bg-error-container px-4 py-2 text-xs font-extrabold text-on-error-container active:scale-95">
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

