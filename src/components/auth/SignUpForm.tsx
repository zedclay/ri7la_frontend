"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiPostJsonData } from "@/lib/api";
import { isValidEmail } from "@/lib/emailValidation";
import { writeSignupProfile } from "@/lib/signupProfileStorage";

export function SignUpForm() {
  const t = useTranslations("common");
  const router = useRouter();
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = isValidEmail(email);
  const canSubmit =
    fullName.trim().length >= 2 && emailOk && phone.trim().length > 0 && termsAccepted;

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (!canSubmit) {
          if (!termsAccepted) setError(t("signupTermsRequired"));
          else if (!emailOk) setError(t("signupEmailInvalid"));
          return;
        }
        const value = phone.trim();
        try {
          await apiPostJsonData<{ ok: boolean }>("/api/auth/otp/request", {
            phone: value,
            flow: "SIGNUP",
            role: role === "driver" ? "DRIVER" : "PASSENGER",
          });
          writeSignupProfile({ fullName: fullName.trim(), email: email.trim() });
          const qs = new URLSearchParams();
          qs.set("flow", "signup");
          qs.set("role", role);
          qs.set("phone", value);
          router.push(`/auth/verify?${qs.toString()}`);
        } catch (e2) {
          setError(e2 instanceof Error ? e2.message : t("signupOtpRequestFailed"));
        }
      }}
    >
      {error && (
        <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <div className="text-sm font-medium text-on-surface-variant">{t("signupYouAre")}</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={
              role === "passenger"
                ? "rounded-xl border border-primary bg-white px-4 py-4 text-left"
                : "rounded-xl border border-outline-variant/20 bg-white/60 px-4 py-4 text-left"
            }
            onClick={() => setRole("passenger")}
          >
            <div className="flex items-center gap-2">
              <MaterialIcon name="person" className="!text-xl text-primary" />
              <div className="text-sm font-extrabold text-on-surface">{t("signupRolePassenger")}</div>
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">{t("signupRolePassengerHint")}</div>
          </button>
          <button
            type="button"
            className={
              role === "driver"
                ? "rounded-xl border border-primary bg-white px-4 py-4 text-left"
                : "rounded-xl border border-outline-variant/20 bg-white/60 px-4 py-4 text-left"
            }
            onClick={() => setRole("driver")}
          >
            <div className="flex items-center gap-2">
              <MaterialIcon name="directions_car" className="!text-xl text-primary" />
              <div className="text-sm font-extrabold text-on-surface">{t("signupRoleDriver")}</div>
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">{t("signupRoleDriverHint")}</div>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="signup-fullName" className="mb-1.5 block text-sm font-medium text-on-surface-variant">
          {t("signupFullName")}
        </label>
        <input
          id="signup-fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={160}
          placeholder={t("signupFullNamePlaceholder")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-on-surface-variant">
          {t("signupEmailLabel")}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("signupEmailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-on-surface-variant">
          {t("signupPhoneLabel")}
        </label>
        <div className="flex gap-2">
          <div className="flex shrink-0 items-center rounded-lg bg-surface-container-low px-3 py-3 text-sm font-medium text-on-surface-variant">
            +213
          </div>
          <div className="group relative min-w-0 flex-1">
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel-national"
              placeholder={t("signupPhonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20"
            />
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-focus-within:w-full" />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-5 items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-outline-variant text-primary focus:ring-primary"
          />
        </div>
        <label htmlFor="terms" className="cursor-pointer text-sm leading-tight text-on-surface-variant">
          {t("signupAcceptTerms")}{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            {t("signupTermsLink")}
          </Link>{" "}
          {t("signupAndThe")}{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            {t("signupPrivacyLink")}
          </Link>
          .
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-lg font-bold text-white shadow-xl shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-60"
      >
        {t("signupReceiveOtp")}
      </button>

      <p className="mt-8 text-center text-on-surface-variant">
        {t("signupAlreadyAccount")}{" "}
        <Link
          href="/auth/login"
          className="ml-1 font-bold text-primary transition-colors hover:text-primary-container"
        >
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
