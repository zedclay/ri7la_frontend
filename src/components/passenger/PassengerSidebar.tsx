"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { clearAuth } from "@/lib/auth";
import { clearDemoSession } from "@/lib/demoSession";
import { invalidateUserMeClientCache } from "@/lib/userMeClientCache";

export function PassengerSidebar() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { href: "/passenger/bookings", label: t("navMyBookings"), icon: "confirmation_number" as const },
    { href: "/passenger/payments", label: t("payments"), icon: "payments" as const },
    { href: "/passenger/support", label: t("support"), icon: "support_agent" as const },
    { href: "/passenger/settings", label: t("settings"), icon: "settings" as const },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest p-6 lg:block">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-headline text-xl font-extrabold text-primary-container">
          Ri7la
        </Link>
        <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-on-secondary-fixed-variant">
          {t("premiumMember")}
        </span>
      </div>

      <nav className="space-y-1" aria-label={t("passengerArea")}>
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                active
                  ? "flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-primary-container"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
              }
            >
              <MaterialIcon name={it.icon} className="!text-xl" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10">
        <Link
          href="/search"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/10 active:scale-95"
        >
          {t("bookNewTrip")}
          <MaterialIcon name="arrow_forward" className="!text-lg rtl:rotate-180" />
        </Link>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-bold text-error"
          onClick={() => {
            clearAuth();
            invalidateUserMeClientCache();
            clearDemoSession();
            router.push("/auth/login");
          }}
        >
          <MaterialIcon name="logout" className="!text-lg" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
