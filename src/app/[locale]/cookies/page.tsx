import type { Metadata } from "next";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  title: "Cookies — Saafir",
  description: "Informations sur l’utilisation des cookies et traceurs sur Saafir.",
};

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Cookies
        </h1>
        <p className="mb-10 text-on-surface-variant">
          Cette page est une version MVP. Les paramètres détaillés seront disponibles avec le
          système de consentement final.
        </p>

        <div className="space-y-6 rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
          <div>
            <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">Essentiels</h2>
            <p className="text-sm text-on-surface-variant">
              Nécessaires pour la connexion, la sécurité, et la navigation.
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">Performance</h2>
            <p className="text-sm text-on-surface-variant">
              Aident à comprendre l’utilisation afin d’améliorer l’expérience.
            </p>
          </div>
          <div>
            <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">Préférences</h2>
            <p className="text-sm text-on-surface-variant">
              Mémorisent la langue, l’interface et certaines options.
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
