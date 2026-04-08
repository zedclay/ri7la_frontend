"use client";

import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { clearAuth, getAuthTokens } from "@/lib/auth";

type NavItem = { href: string; label: string; match: (p: string) => boolean };

type AppRole = "passenger" | "driver" | "admin";

function avatarLetter(input?: { fullName?: string | null; phoneE164?: string | null }) {
  const name = input?.fullName?.trim();
  if (name) return name.slice(0, 1).toUpperCase();
  const phone = input?.phoneE164?.trim();
  if (phone) return phone.slice(-2).toUpperCase();
  return "U";
}

function dashboardForRole(role: AppRole) {
  if (role === "passenger") return "/passenger/bookings";
  if (role === "driver") return "/driver";
  return "/admin";
}

function ProfileMenu({
  role,
  onLogout,
  avatar,
}: {
  role: Exclude<AppRole, "admin">;
  onLogout: () => void;
  avatar: { fullName?: string | null; phoneE164?: string | null } | null;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = wrapperRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const items =
    role === "passenger"
      ? [
          { href: "/passenger/profile", label: t("profile") },
          { href: "/passenger/reviews", label: t("reviews") },
          { href: "/passenger/settings", label: t("settings") },
        ]
      : role === "driver"
        ? [
            { href: "/driver/profile", label: t("profile") },
            { href: "/driver/vehicle", label: t("vehicleInfo") },
            { href: "/driver/reviews", label: t("reviews") },
            { href: "/driver/settings", label: t("settings") },
          ]
        : [];

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant"
        aria-label={t("profileMenu")}
        onClick={() => setOpen((v) => !v)}
      >
        {avatarLetter(avatar ?? undefined)}
      </button>
      {open && (
        <div className="absolute end-0 mt-3 w-56 overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]">
          <div className="border-b border-outline-variant/10 bg-surface-container-low px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("account")}
            </div>
          </div>
          <div className="p-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                {it.label}
                <MaterialIcon name="chevron_right" className="!text-lg text-outline rtl:rotate-180" />
              </Link>
            ))}
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-error transition-colors hover:bg-error-container/40"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              {t("logout")}
              <MaterialIcon name="logout" className="!text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  nav,
  right,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  right: React.ReactNode;
}) {
  const t = useTranslations("common");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        aria-label={t("closeMenu")}
        onClick={onClose}
      />
      <div className="absolute end-0 top-0 h-full w-[320px] max-w-[90vw] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <div className="font-headline text-lg font-extrabold text-primary-container">{t("menu")}</div>
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
            onClick={onClose}
            aria-label={t("close")}
          >
            <MaterialIcon name="close" className="!text-xl" />
          </button>
        </div>
        <div className="p-5">
          <nav className="space-y-2" aria-label={t("mobileNav")}>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-4 text-sm font-extrabold text-on-surface"
              >
                {item.label}
                <MaterialIcon name="chevron_right" className="!text-xl text-outline rtl:rotate-180" />
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-2xl bg-surface-container-low p-4">{right}</div>
        </div>
      </div>
    </div>
  );
}

export function PublicHeader() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [me, setMe] = useState<{ fullName?: string | null; phoneE164?: string | null } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    async function load() {
      const tokens = getAuthTokens();
      if (!tokens) {
        setRole(null);
        setMe(null);
        return;
      }
      try {
        const res = await apiGetJsonData<{
          roles: string[];
          fullName: string;
          phoneE164: string | null;
        }>("/api/users/me");
        if (cancelled) return;
        const roles = res.roles;
        const nextRole: AppRole = roles.includes("ADMIN") ? "admin" : roles.includes("DRIVER") ? "driver" : "passenger";
        setRole(nextRole);
        setMe({ fullName: res.fullName, phoneE164: res.phoneE164 });
      } catch {
        if (cancelled) return;
        clearAuth();
        setRole(null);
        setMe(null);
      }
    }

    const handler = () => void load();
    window.addEventListener("storage", handler);
    window.addEventListener("ri7la_auth", handler);
    void load();

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handler);
      window.removeEventListener("ri7la_auth", handler);
    };
  }, []);

  const nav = useMemo(() => {
    if (!role) {
      return [
        { href: "/", label: t("navHome"), match: (p: string) => p === "/" },
        { href: "/#comment-ca-marche", label: t("navHowItWorks"), match: () => false },
        { href: "/safety", label: t("navSafety"), match: (p: string) => p.startsWith("/safety") },
        { href: "/help", label: t("navHelp"), match: (p: string) => p.startsWith("/help") },
      ];
    }

    if (role === "passenger") {
      return [
        { href: "/search", label: t("navSearchRide"), match: (p: string) => p.startsWith("/search") },
        {
          href: "/passenger/bookings",
          label: t("navMyBookings"),
          match: (p: string) => p.startsWith("/passenger/bookings"),
        },
        { href: "/passenger/messages", label: t("messages"), match: (p: string) => p.startsWith("/passenger/messages") },
        { href: "/help", label: t("navHelp"), match: (p: string) => p.startsWith("/help") },
      ];
    }

    if (role === "driver") {
      return [
        { href: "/driver/trips", label: t("navMyTrips"), match: (p: string) => p.startsWith("/driver/trips") },
        {
          href: "/driver/requests",
          label: t("navBookingRequests"),
          match: (p: string) => p.startsWith("/driver/requests"),
        },
        { href: "/driver/messages", label: t("messages"), match: (p: string) => p.startsWith("/driver/messages") },
        { href: "/help", label: t("navHelp"), match: (p: string) => p.startsWith("/help") },
      ];
    }

    return [];
  }, [role, t]);

  const rightControls = useMemo(() => {
    const lang = <LocaleSwitcher variant="header" />;

    if (!role) {
      return (
        <div className="flex flex-col gap-3">
          {lang}
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="flex-1 rounded-full bg-white px-5 py-2.5 text-center text-sm font-extrabold text-primary-container shadow-sm"
            >
              {t("logIn")}
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      );
    }

    if (role === "admin") {
      return (
        <div className="flex flex-col gap-3">
          {lang}
          <div className="flex items-center gap-3">
            <Link
              href={dashboardForRole("admin")}
              className="flex-1 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
            >
              {t("adminConsole")}
            </Link>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-extrabold text-error"
              onClick={() => {
                clearAuth();
                router.push("/auth/login");
              }}
            >
              {t("logout")}
            </button>
          </div>
        </div>
      );
    }

    if (role === "passenger") {
      return (
        <div className="flex flex-col gap-3">
          {lang}
          <Link
            href="/passenger/become-driver"
            className="rounded-full bg-surface-container-high px-5 py-2.5 text-center text-sm font-extrabold text-on-surface"
          >
            {t("becomeDriverCta")}
          </Link>
        </div>
      );
    }

    if (role === "driver") {
      return (
        <div className="flex flex-col gap-3">
          {lang}
          <Link
            href="/driver/trips/new"
            className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
          >
            {t("publishTrip")}
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {lang}
        <Link
          href="/admin"
          className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
        >
          {t("adminConsole")}
        </Link>
      </div>
    );
  }, [role, router, t]);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant/20 bg-white/85 font-headline shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary-container">
                Ri7la
              </Link>
            </div>

            <nav className="hidden items-center justify-center gap-8 md:flex" aria-label={t("mainNav")}>
              {nav.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "border-b-2 border-primary-container pb-1 text-sm font-extrabold text-primary-container"
                        : "text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary-container"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-3">
              <div className="hidden items-center gap-3 md:flex">
                <LocaleSwitcher variant="header" />

                {!role ? (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-3 py-2 text-sm font-extrabold text-primary-container transition-colors hover:text-primary active:scale-95"
                    >
                      {t("logIn")}
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded-full bg-primary px-6 py-2.5 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
                    >
                      {t("signUp")}
                    </Link>
                  </>
                ) : role === "passenger" ? (
                  <>
                    <Link
                      href="/passenger/become-driver"
                      className="rounded-full bg-surface-container-low px-4 py-2 text-sm font-extrabold text-on-surface transition-colors hover:bg-surface-container-high"
                    >
                      {t("becomeDriverCta")}
                    </Link>
                    <ProfileMenu
                      role="passenger"
                      avatar={me}
                      onLogout={() => {
                        clearAuth();
                        router.push("/auth/login");
                      }}
                    />
                  </>
                ) : role === "driver" ? (
                  <>
                    <Link
                      href="/driver/trips/new"
                      className="rounded-full bg-primary px-5 py-2 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
                    >
                      {t("publishTrip")}
                    </Link>
                    <ProfileMenu
                      role="driver"
                      avatar={me}
                      onLogout={() => {
                        clearAuth();
                        router.push("/auth/login");
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Link
                      href={dashboardForRole("admin")}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10"
                    >
                      {t("adminConsole")}
                    </Link>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-extrabold text-error transition-colors hover:text-error/80"
                      onClick={() => {
                        clearAuth();
                        router.push("/auth/login");
                      }}
                    >
                      {t("logout")}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                className="rounded-full bg-surface-container-low p-2 text-on-surface transition-colors hover:bg-surface-container-high md:hidden"
                aria-label={t("openMenu")}
                onClick={() => setMobileOpen(true)}
              >
                <MaterialIcon name="menu" className="!text-2xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={nav}
        right={
          <div className="space-y-3">
            {rightControls}
            {role && role !== "admin" && (
              <div className="pt-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-on-surface shadow-sm"
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(dashboardForRole(role));
                  }}
                >
                  {t("dashboard")}
                  <MaterialIcon name="arrow_forward" className="!text-lg rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
