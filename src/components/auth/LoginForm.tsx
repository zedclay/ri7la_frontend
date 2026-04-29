"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { clearAuth } from "@/lib/auth";
import { invalidateUserMeClientCache } from "@/lib/userMeClientCache";

type Props = {
  showError?: boolean;
  fixedRole?: "admin";
};

function toAlgeriaE164(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("213")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+213${digits.slice(1)}`;
  if ((digits.startsWith("5") || digits.startsWith("6") || digits.startsWith("7")) && digits.length === 9) {
    return `+213${digits}`;
  }
  return input.trim();
}

function dashboardForRole(role: "passenger" | "driver" | "admin") {
  if (role === "driver") return "/driver";
  if (role === "admin") return "/admin";
  return "/passenger/bookings";
}

export function LoginForm({ showError = false, fixedRole }: Props) {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await apiGetJsonData<{ roles: string[] }>("/api/users/me");
        if (cancelled) return;
        const nextRaw = searchParams.get("next");
        const next =
          nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") && !nextRaw.includes("://")
            ? nextRaw
            : null;
        if (me.roles.includes("ADMIN")) {
          router.replace(dashboardForRole("admin"));
        } else if (me.roles.includes("DRIVER")) {
          router.replace(next?.startsWith("/driver") ? next : dashboardForRole("driver"));
        } else {
          router.replace(next ?? dashboardForRole("passenger"));
        }
      } catch {
        if (cancelled) return;
        clearAuth();
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md space-y-8">
      <header className="space-y-2">
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          {fixedRole === "admin" ? t("adminLoginTitle") : t("loginTitle")}
        </h1>
        <p className="text-base text-on-surface-variant">
          {fixedRole ? t("adminLoginSubtitle") : t("loginSubtitlePhone")}
        </p>
      </header>

      {(showError || error) && (
        <div
          className="flex items-center gap-3 rounded-xl border-none bg-error-container p-4 text-on-error-container"
          role="alert"
        >
          <MaterialIcon name="error" className="!text-xl shrink-0" />
          <span className="text-sm font-medium">
            {error ?? t("invalidCredentials")}
          </span>
        </div>
      )}

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const next = searchParams.get("next") || undefined;
          const value = fixedRole ? identifier.trim() : toAlgeriaE164(identifier);
          try {
            const res = await apiPostJsonData<{
              user: { roles: string[] };
              tokens: { accessToken: string; refreshToken: string };
            }>("/api/auth/login", { identifier: value, password });

            if (fixedRole === "admin" && !res.user.roles.includes("ADMIN")) {
              clearAuth();
              setError(t("invalidCredentials"));
              return;
            }

            invalidateUserMeClientCache();
            try {
              window.dispatchEvent(new Event("saafir_auth"));
            } catch {}

            if (res.user.roles.includes("ADMIN")) {
              router.push(dashboardForRole("admin"));
              return;
            }
            if (res.user.roles.includes("DRIVER")) {
              router.push(next?.startsWith("/driver") ? next : dashboardForRole("driver"));
              return;
            }
            router.push(next || dashboardForRole("passenger"));
          } catch (e2) {
            setError(e2 instanceof Error ? e2.message : t("loginFailed"));
          }
        }}
      >
        <div className="space-y-2">
          <label htmlFor="identifier" className="ms-1 text-sm font-semibold text-on-surface">
            {fixedRole ? t("email") : t("phoneNumber")}
          </label>
          {fixedRole ? (
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                <MaterialIcon
                  name="person"
                  className="!text-xl text-outline transition-colors group-focus-within:text-primary"
                />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder={t("emailPlaceholder")}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-11 pe-4 text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
              />
            </div>
          ) : (
            <div className="flex items-center overflow-hidden rounded-xl bg-surface-container-low ring-0 focus-within:ring-2 focus-within:ring-primary">
              <span className="inline-flex h-full items-center px-4 text-sm font-semibold text-on-surface-variant">
                +213
              </span>
              <input
                id="identifier"
                name="identifier"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="5XXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full border-none bg-transparent py-3.5 pe-4 text-on-surface outline-none placeholder:text-outline"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="ms-1 text-sm font-semibold text-on-surface">
            {t("password")}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
              <MaterialIcon
                name="lock"
                className="!text-xl text-outline transition-colors group-focus-within:text-primary"
              />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-11 pe-12 text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              className="absolute inset-y-0 end-0 flex items-center pe-4 text-outline transition-colors hover:text-primary"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-container"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={!identifier.trim() || password.trim().length === 0}
          className="gradient-primary w-full rounded-full px-6 py-4 font-headline font-bold text-on-primary shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/20 active:scale-95"
        >
          {t("logIn")}
        </button>
      </form>

      {!fixedRole && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-4 font-medium text-on-surface-variant">{t("noAccount")}</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/50 px-8 py-3 font-headline font-bold text-primary transition-all hover:bg-surface-container-low"
            >
              {t("signUpFree")}
              <MaterialIcon name="arrow_forward" className="!text-sm rtl:rotate-180" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
