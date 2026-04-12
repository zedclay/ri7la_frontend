"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAccessToken } from "@/lib/auth";
import {
  buildDriverOnboardingDocumentsHrefFromSlots,
  type ServerVerificationSlots,
} from "@/lib/driverVerificationNavigation";
import { fetchUserMeClientCached, type UserMeClientPayload } from "@/lib/userMeClientCache";

export function DriverDashboardVerificationCard() {
  const [me, setMe] = useState<UserMeClientPayload | null>(null);

  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    void fetchUserMeClientCached().then((m) => {
      if (!cancelled) setMe(m);
    });
    const onAuth = () => setMe(null);
    window.addEventListener("ri7la_auth", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("ri7la_auth", onAuth);
    };
  }, []);

  const driver = me?.driverVerification;

  const { title, body, tone, href, cta } = useMemo(() => {
    const fallback = {
      title: "Verification",
      body: "Complete your driver documents so passengers can trust your profile. You can continue using the app in the meantime.",
      tone: "amber" as const,
      href: "/driver/onboarding",
      cta: "Documents & verification",
    };

    if (!driver) return fallback;

    if (driver.fullyVerified) {
      return {
        title: "Verification complete",
        body: "Your identity, license, and vehicle documents are approved. You can publish trips and accept requests according to the rules.",
        tone: "success" as const,
        href: "/driver/profile",
        cta: "View profile",
      };
    }

    const slots = driver.slots as ServerVerificationSlots;
    const hasRejected =
      slots.identity === "rejected" ||
      slots.license === "rejected" ||
      slots.vehiclePhotos === "rejected" ||
      slots.otherDocs === "rejected";

    const docsHref = buildDriverOnboardingDocumentsHrefFromSlots(slots);

    if (hasRejected) {
      return {
        title: "Documents need an update",
        body:
          driver.adminComment?.trim() ??
          "One or more sections were rejected. Open the form at the step shown below and upload new files.",
        tone: "amber" as const,
        href: docsHref,
        cta: "Fix rejected documents",
      };
    }

    return {
      title: "Verification in progress",
      body: "Your documents are with the team. You can still review and accept carpool requests. If something is missing, continue your profile below.",
      tone: "info" as const,
      href: docsHref,
      cta: "Open document steps",
    };
  }, [driver]);

  const shell =
    tone === "success"
      ? "bg-primary-fixed/40 text-on-primary-fixed-variant"
      : tone === "info"
        ? "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant"
        : "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant";

  return (
    <div className={`rounded-2xl p-6 lg:col-span-2 ${shell}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70">
            <MaterialIcon
              name={tone === "success" ? "verified" : "verified_user"}
              className="!text-2xl text-tertiary"
              filled={tone === "success"}
            />
          </div>
          <div>
            <div className="text-sm font-extrabold">{title}</div>
            <div className="mt-1 text-sm opacity-95">{body}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={href}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-tertiary shadow-sm active:scale-95"
          >
            {cta}
          </Link>
          <Link
            href="/driver/support"
            className="rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-extrabold text-on-surface active:scale-95"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
