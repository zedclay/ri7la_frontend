import type { Metadata } from "next";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "À propos — Ri7la",
  description: "Découvrez la mission de Ri7la : mobilité accessible en Algérie.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <div className="rounded-3xl bg-surface-container-lowest p-10 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/10">
            <MaterialIcon name="explore" className="!text-3xl text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            À propos de Ri7la
          </h1>
          <p className="mt-4 max-w-2xl text-on-surface-variant">
            Ri7la aide les voyageurs en Algérie à trouver des trajets fiables, transparents, et adaptés
            à la réalité locale : covoiturage et bus, avec support et sécurité.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: "shield_with_heart", title: "Confiance", desc: "Vérification, avis, et règles de sécurité." },
              { icon: "payments", title: "Flexibilité", desc: "Cash + paiements en ligne selon le trajet." },
              { icon: "support_agent", title: "Support", desc: "Aide 24/7 pour voyageurs, drivers, et opérateurs." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl bg-surface-container-low p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                  <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
                </div>
                <div className="text-sm font-extrabold text-on-surface">{c.title}</div>
                <p className="mt-1 text-sm text-on-surface-variant">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

