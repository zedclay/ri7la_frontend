"use client";

import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiPostJsonData } from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { isValidEmail } from "@/lib/emailValidation";
import { clearSignupProfile, readSignupProfile } from "@/lib/signupProfileStorage";

export function VerifyAccountClient() {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow") === "login" ? "login" : "signup";
  const phone = searchParams.get("phone")?.trim() ?? "";
  const roleParam = searchParams.get("role");
  const next = searchParams.get("next") ?? undefined;

  const role = useMemo(() => {
    if (flow !== "signup") return null;
    if (roleParam === "driver") return "driver";
    return "passenger";
  }, [flow, roleParam]);

  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resentHint, setResentHint] = useState(false);
  const [profileFullName, setProfileFullName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const isSignup = flow === "signup";
  const profileOk =
    !isSignup ||
    (profileFullName.trim().length >= 2 && isValidEmail(profileEmail));
  const canVerify =
    phone.length > 0 && profileOk && code.length === 4 && digits.every((d) => d.length === 1);

  useEffect(() => {
    if (!isSignup) return;
    const stored = readSignupProfile();
    if (stored) {
      setProfileFullName(stored.fullName);
      setProfileEmail(stored.email);
    }
  }, [isSignup]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function focusInput(index: number) {
    requestAnimationFrame(() => {
      const el = inputRefs.current[index];
      el?.focus();
      el?.select();
    });
  }

  function dashboardForRoles(roles: string[]) {
    if (roles.includes("ADMIN")) return "/admin";
    if (roles.includes("DRIVER")) return "/driver";
    return "/passenger/bookings";
  }

  async function handleVerify() {
    setError(null);
    if (!canVerify) return;
    try {
      const body: Record<string, unknown> = {
        phone,
        code,
        flow: flow === "signup" ? "SIGNUP" : "LOGIN",
      };
      if (flow === "signup") {
        body.role = role === "driver" ? "DRIVER" : "PASSENGER";
        body.fullName = profileFullName.trim();
        body.email = profileEmail.trim().toLowerCase();
      }
      const res = await apiPostJsonData<{
        user: { roles: string[] };
        tokens: { accessToken: string; refreshToken: string };
      }>("/api/auth/otp/verify", body);
      setAuthTokens(res.tokens);
      if (flow === "signup") {
        clearSignupProfile();
        if (res.user.roles.includes("DRIVER")) router.replace("/driver/onboarding");
        else router.replace(next || "/passenger/profile");
        return;
      }
      router.replace(next || dashboardForRoles(res.user.roles));
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : t("failedVerification"));
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-headline text-lg font-extrabold tracking-tight text-primary-container">
          Ri7la
        </Link>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <Link href="/help" className="rounded-full p-2 hover:bg-surface-container-high">
            <MaterialIcon name="help" className="!text-xl" />
          </Link>
          <LocaleSwitcher variant="header" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full rounded-2xl bg-surface-container-lowest p-10 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
          <div className="mb-6 rounded-xl bg-secondary-container/40 px-4 py-3 text-sm font-semibold text-on-secondary-fixed-variant">
            <span className="inline-flex items-start gap-2">
              <MaterialIcon name="terminal" filled className="!text-lg text-primary" />
              <span>
                {t("verifyDemoBanner")}
                <span className="mt-2 block text-xs font-medium text-on-secondary-fixed-variant/90">
                  {t("verifyDemoHint")}
                </span>
              </span>
            </span>
          </div>

          {resentHint && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary-container/10 px-4 py-3 text-center text-sm font-medium text-on-surface">
              {t("otpResentSeeTerminal")}
            </div>
          )}

          <h1 className="text-center font-headline text-3xl font-extrabold text-on-surface">
            {t("verifyTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-on-surface-variant">
            {t("sentCodeIntro")}{" "}
            <span className="font-bold text-on-surface">{phone || t("yourNumber")}</span>.
          </p>

          {isSignup ? (
            <div className="mt-8 space-y-4 rounded-xl border border-outline-variant/20 bg-surface-container-low/60 p-5">
              <div>
                <h2 className="font-headline text-lg font-extrabold text-on-surface">{t("verifyYourDetails")}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{t("verifyConfirmDetailsHint")}</p>
              </div>
              <div>
                <label htmlFor="verify-fullName" className="mb-1.5 block text-xs font-bold text-on-surface-variant">
                  {t("signupFullName")}
                </label>
                <input
                  id="verify-fullName"
                  type="text"
                  autoComplete="name"
                  minLength={2}
                  maxLength={160}
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  placeholder={t("signupFullNamePlaceholder")}
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="verify-email" className="mb-1.5 block text-xs font-bold text-on-surface-variant">
                  {t("signupEmailLabel")}
                </label>
                <input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder={t("signupEmailPlaceholder")}
                  className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-10 space-y-6">
            <div
              className="grid grid-cols-4 gap-3"
              dir="ltr"
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
                if (!text) return;
                const chars = text.split("");
                setDigits((prev) => {
                  const next = [...prev];
                  for (let i = 0; i < 4; i++) next[i] = chars[i] ?? "";
                  return next;
                });
                focusInput(Math.min(chars.length, 3));
              }}
            >
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-label={t("digitN", { n: idx + 1 })}
                  value={d}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    if (raw.length === 0) {
                      setDigits((prev) => prev.map((p, i) => (i === idx ? "" : p)));
                      return;
                    }
                    if (raw.length === 1) {
                      setDigits((prev) => {
                        const next = [...prev];
                        next[idx] = raw;
                        return next;
                      });
                      if (idx < 3) focusInput(idx + 1);
                      return;
                    }
                    const chars = raw.slice(0, 4).split("");
                    setDigits((prev) => {
                      const next = [...prev];
                      for (let j = 0; j < chars.length && idx + j < 4; j++) next[idx + j] = chars[j] ?? "";
                      return next;
                    });
                    focusInput(Math.min(idx + chars.length - 1, 3));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && e.currentTarget.value === "" && idx > 0) {
                      focusInput(idx - 1);
                      e.preventDefault();
                      return;
                    }
                    if (e.key === "ArrowLeft" && idx > 0) {
                      focusInput(idx - 1);
                      e.preventDefault();
                    }
                    if (e.key === "ArrowRight" && idx < 3) {
                      focusInput(idx + 1);
                      e.preventDefault();
                    }
                  }}
                  className="h-12 w-full rounded-xl border-none bg-surface-container-low text-center text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={!canVerify}
              className="flex w-full items-center justify-center rounded-full bg-primary py-4 font-headline font-bold text-on-primary shadow-lg shadow-primary/10 transition-all disabled:opacity-60 active:scale-95"
            >
              {t("verifyButton")}
            </button>

            <div className="text-center text-sm text-on-surface-variant">
              {t("noCodeReceived")}{" "}
              <button
                type="button"
                className="font-bold text-primary underline underline-offset-4"
                onClick={async () => {
                  try {
                    setError(null);
                    await apiPostJsonData<{ ok: boolean }>("/api/auth/otp/request", {
                      phone,
                      flow: flow === "signup" ? "SIGNUP" : "LOGIN",
                      role: flow === "signup" ? (role === "driver" ? "DRIVER" : "PASSENGER") : undefined,
                    });
                    setResentHint(true);
                  } catch (e2) {
                    setError(e2 instanceof Error ? e2.message : t("failedResend"));
                  }
                }}
              >
                {t("resendCode")}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant">
              <MaterialIcon name="timer" className="!text-sm" />
              01:59
            </div>

            <button
              type="button"
              className="mx-auto block text-xs font-semibold text-on-surface-variant hover:text-primary"
              onClick={() => {
                if (flow === "signup") {
                  clearSignupProfile();
                  router.replace("/auth/signup");
                } else router.replace("/auth/login");
              }}
            >
              {t("changeContact")}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-on-surface-variant md:flex-row">
          <div className="font-headline font-bold text-primary-container">Ri7la</div>
          <div>
            {t("verifyFooterNote", { year: new Date().getFullYear(), rights: t("rights") })}
          </div>
        </div>
      </footer>
    </div>
  );
}
