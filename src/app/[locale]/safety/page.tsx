import type { Metadata } from "next";
import { SafetyPageContent } from "@/components/safety/SafetyPageContent";

export const metadata: Metadata = {
  title: "Sécurité et Confiance — Saafir",
  description:
    "Découvrez comment Saafir protège les voyageurs en Algérie : chauffeurs vérifiés, paiements sécurisés, GPS et support 24/7.",
};

export default function SafetyPage() {
  return <SafetyPageContent />;
}
