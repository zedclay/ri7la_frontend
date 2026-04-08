"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const SECTION_IDS = [
  "intro",
  "eligibility",
  "booking",
  "payments",
  "cancel",
  "liability",
] as const;

const navItems: {
  id: (typeof SECTION_IDS)[number];
  label: string;
  icon: string;
}[] = [
  { id: "intro", label: "Introduction", icon: "gavel" },
  { id: "eligibility", label: "Éligibilité", icon: "policy" },
  { id: "booking", label: "Règles de Réservation", icon: "directions_bus" },
  { id: "payments", label: "Paiements", icon: "payments" },
  { id: "cancel", label: "Annulation", icon: "schedule" },
  { id: "liability", label: "Responsabilité", icon: "shield" },
];

export function TermsLegalSidebar() {
  const [active, setActive] = useState<string>("intro");

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="sticky top-24 rounded-2xl bg-surface-container-low p-4">
        <div className="mb-6 px-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-primary-container">
            Legal Center
          </h4>
          <p className="mt-1 text-xs text-slate-500">Version 2.4.0</p>
        </div>
        <nav className="space-y-1" aria-label="Sommaire des conditions">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className={
                  isActive
                    ? "flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-primary-container shadow-sm transition-transform hover:translate-x-0.5"
                    : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-transform hover:translate-x-0.5 hover:bg-white/50"
                }
              >
                <MaterialIcon name={item.icon} className="!text-xl" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
