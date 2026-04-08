import { Link } from "@/i18n/navigation";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <RequireDemoRole role="admin" />
      <div className="mx-auto flex max-w-[1500px]">
        <PortalSidebar
          brand="Admin Console"
          subtitle="Ri7la Ops"
          userLabel="Admin"
          primaryCtaLabel="New Action"
          primaryCtaHref="/admin"
          items={[
            { href: "/admin", label: "Dashboard", icon: "space_dashboard" },
            { href: "/admin/users", label: "Users", icon: "group" },
            { href: "/admin/trips", label: "Trips", icon: "route" },
            { href: "/admin/bookings", label: "Bookings", icon: "confirmation_number" },
            { href: "/admin/reports", label: "Reviews / Reports", icon: "flag" },
            { href: "/admin/settings", label: "Settings", icon: "settings" },
          ]}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-outline-variant/10 bg-surface/80 px-6 py-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="group relative w-full max-w-2xl">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <MaterialIcon
                    name="search"
                    className="!text-xl text-outline transition-colors group-focus-within:text-primary"
                  />
                </div>
                <input
                  type="search"
                  placeholder="Search users, bookings, payments..."
                  className="w-full rounded-full border-none bg-surface-container-low px-12 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="rounded-full p-2 hover:bg-surface-container-low" aria-label="Notifications">
                  <MaterialIcon name="notifications" className="!text-xl" />
                </button>
                <Link href="/admin/support" className="rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface">
                  Support
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-sm font-bold text-on-surface">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-xs font-extrabold text-on-primary-fixed-variant">
                    A
                  </span>
                </Link>
              </div>
            </div>
          </header>

          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
