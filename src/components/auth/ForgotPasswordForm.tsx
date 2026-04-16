"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { apiPostJsonData } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

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
        const value = toAlgeriaE164(phone);
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
        <div className="flex items-center overflow-hidden rounded-xl border border-outline-variant/40 bg-surface ring-0 focus-within:ring-2 focus-within:ring-primary">
          <span className="inline-flex h-full items-center px-4 text-sm font-semibold text-on-surface-variant">+213</span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="5XXXXXXXX"
            className="w-full border-none bg-transparent py-3 text-base text-on-surface outline-none placeholder:text-outline"
          />
        </div>
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
