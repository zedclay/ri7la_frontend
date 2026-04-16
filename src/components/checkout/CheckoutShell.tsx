"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Step = "details" | "payment" | "confirm";

function stepChip(n: number, label: string, active: boolean, done: boolean) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          done
            ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary"
            : active
              ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary"
              : "flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant"
        }
      >
        {done ? <MaterialIcon name="check" className="!text-xl" /> : <span className="text-sm font-extrabold">{n}</span>}
      </div>
      <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{label}</div>
    </div>
  );
}

export function CheckoutShell({
  current,
  bookingId,
  children,
}: {
  current: Step;
  bookingId: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("checkout");
  const steps: Step[] = ["details", "payment", "confirm"];
  const idx = steps.indexOf(current);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <header className="sticky top-0 z-40 border-b border-outline-variant/10 bg-surface/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary-container">
            <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MaterialIcon name="lock" className="!text-lg" />
            <span className="text-xs font-bold uppercase tracking-widest">{t("secureCheckout")}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <Link href={`/passenger/checkout/${bookingId}/details`} className="focus:outline-none">
            {stepChip(1, t("stepDetails"), current === "details", idx > 0)}
          </Link>
          <div className="hidden h-px w-16 bg-outline-variant/30 sm:block md:w-24" />
          <Link href={`/passenger/checkout/${bookingId}/payment`} className="focus:outline-none">
            {stepChip(2, t("stepPayment"), current === "payment", idx > 1)}
          </Link>
          <div className="hidden h-px w-16 bg-outline-variant/30 sm:block md:w-24" />
          <Link href={`/passenger/checkout/${bookingId}/confirm`} className="focus:outline-none">
            {stepChip(3, t("stepConfirm"), current === "confirm", false)}
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
