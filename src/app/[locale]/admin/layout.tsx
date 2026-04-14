import { Link } from "@/i18n/navigation";
import { AdminDemoBanner } from "@/components/admin/AdminDemoBanner";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <RequireDemoRole role="admin" />
      <AdminDemoBanner />
      <div className="mx-auto flex max-w-[1500px]">
        <PortalSidebar
          brand={t("adminBrand")}
          subtitle={t("adminSubtitle")}
          userLabel={t("adminUserLabel")}
          primaryCtaLabel={t("adminDashboard")}
          primaryCtaHref="/admin"
          items={[
            { href: "/admin", label: t("adminDashboard"), icon: "space_dashboard" },
            { href: "/admin/users", label: t("adminUsers"), icon: "group" },
            { href: "/admin/passengers", label: t("adminPassengers"), icon: "person" },
            { href: "/admin/drivers", label: t("adminDrivers"), icon: "badge" },
            { href: "/admin/trips", label: t("adminTrips"), icon: "route" },
            { href: "/admin/bookings", label: t("adminBookings"), icon: "confirmation_number" },
            { href: "/admin/payments", label: t("adminPayments"), icon: "payments" },
            { href: "/admin/reports", label: t("adminReviews"), icon: "flag" },
            { href: "/admin/support", label: t("adminSupport"), icon: "support_agent" },
            { href: "/admin/audit", label: t("adminAuditLog"), icon: "history" },
            { href: "/admin/settings", label: t("adminSettings"), icon: "settings" },
          ]}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-outline-variant/10 bg-surface/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("adminQuickQueues")}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/admin/payments?status=PENDING"
                    className="rounded-full bg-tertiary-fixed/50 px-3 py-1.5 text-xs font-extrabold text-on-tertiary-fixed hover:opacity-90"
                  >
                    {t("adminPendingPayments")}
                  </Link>
                  <Link
                    href="/admin/bookings?status=PENDING"
                    className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-extrabold text-on-surface hover:bg-surface-container-high"
                  >
                    {t("adminPendingBookings")}
                  </Link>
                  <Link
                    href="/admin/drivers"
                    className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-extrabold text-on-surface hover:bg-surface-container-high"
                  >
                    {t("adminDrivers")}
                  </Link>
                  <Link
                    href="/admin/passengers"
                    className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-extrabold text-on-surface hover:bg-surface-container-high"
                  >
                    {t("adminPassengers")}
                  </Link>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href="/admin/support" className="rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface">
                  {t("adminSupport")}
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-sm font-bold text-on-surface"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-xs font-extrabold text-on-primary-fixed-variant">
                    A
                  </span>
                  <span className="hidden sm:inline">{t("adminSettings")}</span>
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
