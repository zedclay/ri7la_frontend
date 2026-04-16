import type { Metadata } from "next";
import { TermsPageContent } from "@/components/terms/TermsPageContent";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Saafir",
  description:
    "Conditions Générales d'Utilisation de la plateforme Saafir : éligibilité, réservations, paiements, annulations et responsabilité.",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
