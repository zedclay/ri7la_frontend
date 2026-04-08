import type { Metadata } from "next";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Ri7la",
  description:
    "Politique de confidentialité Ri7la : données collectées, utilisation, conservation, et droits des utilisateurs.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Politique de Confidentialité
        </h1>
        <p className="mb-10 text-on-surface-variant">
          Cette page est une version MVP. Elle décrit les principes de base appliqués à Ri7la en
          attendant la version juridique finale.
        </p>

        <div className="space-y-8 rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Données collectées</h2>
            <p className="text-sm text-on-surface-variant">
              Identité, contact (email/téléphone), informations de profil, réservations, messages,
              avis, et journaux techniques nécessaires au fonctionnement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Utilisation</h2>
            <p className="text-sm text-on-surface-variant">
              Mise en relation, gestion des réservations, prévention de fraude, amélioration de la
              qualité et support client.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Conservation</h2>
            <p className="text-sm text-on-surface-variant">
              Les données sont conservées le temps nécessaire à la fourniture du service, aux
              obligations légales, et à la sécurité de la plateforme.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Vos droits</h2>
            <p className="text-sm text-on-surface-variant">
              Vous pouvez demander l’accès, la rectification, la suppression, ou l’export de vos
              données via le support.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

