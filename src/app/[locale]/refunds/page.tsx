import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  title: "Politique de Remboursement — Saafir",
  description:
    "Politique de remboursement Saafir (MVP) : annulation, frais, délais, et support.",
};

export default function RefundsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Politique de Remboursement
        </h1>
        <p className="mb-10 text-on-surface-variant">
          Les règles exactes dépendent du type de trajet (covoiturage ou bus), du transporteur, et
          du mode de paiement. Cette version MVP décrit des principes généraux.
        </p>

        <div className="space-y-8 rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Annulation</h2>
            <p className="text-sm text-on-surface-variant">
              Les annulations sont possibles selon le délai avant départ. Des frais peuvent
              s’appliquer selon la politique du trajet.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Paiements en ligne</h2>
            <p className="text-sm text-on-surface-variant">
              En cas de paiement en ligne, un remboursement peut être total ou partiel, et le délai
              dépend du prestataire.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-xl font-bold text-on-surface">Paiements cash</h2>
            <p className="text-sm text-on-surface-variant">
              En mode cash, l’annulation peut entraîner des pénalités internes (crédits, score de
              fiabilité) plutôt qu’un remboursement bancaire.
            </p>
          </section>

          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-sm text-on-surface-variant">
              Besoin d’aide ?{" "}
              <Link href="/help" className="font-bold text-primary underline underline-offset-4">
                Contactez le support
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
