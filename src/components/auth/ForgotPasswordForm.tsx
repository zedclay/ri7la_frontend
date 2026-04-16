"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { apiPostJsonData } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

export function ForgotPasswordForm() {
  const t = useTranslations("common");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const value = phone.trim();
        if (!value) return;
        setLoading(true);
        try {
          await apiPostJsonData<{ ok: boolean }>("/api/auth/otp/request", {
            phone: value,
            flow: "PASSWORD_RESET",
          });
          const qs = new URLSearchParams();
          qs.set("flow", "reset");
          qs.set("phone", value);
          router.push(`/auth/verify?${qs.toString()}`);
        } catch (e2) {
          setError(e2 instanceof Error ? e2.message : t("failedOtp"));
        } finally {
          setLoading(false);
        }
      }}
    >
      {error ? (
        <div className="rounded-xl border border-error/40 bg-error-container/30 px-4 py-3 text-sm font-semibold text-on-error-container">
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-on-surface">
          {t("phoneNumber")}
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phonePlaceholder")}
          className="w-full rounded-xl border border-outline-variant/40 bg-surface px-4 py-3 text-base text-on-surface outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading || phone.trim().length === 0}
        className="gradient-primary w-full rounded-full px-6 py-4 font-headline font-bold text-on-primary shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/20 active:scale-95 disabled:opacity-60"
      >
        {t("sendOtp")}
      </button>
    </form>
  );
}
