import type { Metadata } from "next";
import { TermsPageContent } from "@/components/terms/TermsPageContent";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Ri7la",
  description:
    "Conditions Générales d'Utilisation de la plateforme Ri7la : éligibilité, réservations, paiements, annulations et responsabilité.",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
