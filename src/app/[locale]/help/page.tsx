import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";

export const metadata: Metadata = {
  title: "Aide & FAQ — Ri7la",
  description:
    "Centre d'aide Ri7la : réservations, paiements, covoiturage, bus et remboursements.",
};

export default function HelpPage() {
  return <HelpPageContent />;
}
