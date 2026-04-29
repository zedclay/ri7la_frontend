"use client";

import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { clearAuth } from "@/lib/auth";
import { apiPostJson } from "@/lib/api";
import { clearDemoSession } from "@/lib/demoSession";
import { invalidateUserMeClientCache } from "@/lib/userMeClientCache";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
};

export function PortalSidebar({
  brand,
  subtitle,
  userLabel,
  primaryCtaLabel,
  primaryCtaHref,
  items,
}: {
  brand: string;
  subtitle: string;
  userLabel: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  items: PortalNavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest p-6 lg:block">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/10">
            <MaterialIcon name="commute" className="!text-2xl text-primary-container" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-headline text-lg font-extrabold text-on-surface">{brand}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      <nav className="space-y-1" aria-label={`${brand} navigation`}>
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                active
                  ? "flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-extrabold text-primary-container"
                  : "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
              }
            >
              <span className="flex items-center gap-3">
                <MaterialIcon name={it.icon} className="!text-xl" />
                {it.label}
              </span>
              {it.badge && (
                <span className="rounded-full bg-tertiary-fixed/60 px-2.5 py-1 text-[10px] font-extrabold text-on-tertiary-fixed">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 space-y-4">
        <Link
          href={primaryCtaHref}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
        >
          {primaryCtaLabel}
          <MaterialIcon name="add" className="!text-lg" />
        </Link>
        <div className="rounded-2xl bg-surface-container-low px-4 py-4">
          <div className="text-xs font-extrabold text-on-surface">{userLabel}</div>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <MaterialIcon name="settings" className="!text-lg" />
            Settings
          </div>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2 text-xs font-bold text-error"
            onClick={() => {
              void apiPostJson("/api/auth/logout", {});
              clearAuth();
              invalidateUserMeClientCache();
              clearDemoSession();
              router.push("/auth/login");
            }}
          >
            <MaterialIcon name="logout" className="!text-lg" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
