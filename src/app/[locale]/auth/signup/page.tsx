import type { Metadata } from "next";
import { SignUpView } from "@/components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Créer un compte — Saafir",
  description:
    "Inscrivez-vous sur Saafir pour voyager en Algérie en toute confiance : utilisateurs vérifiés, paiements sécurisés et support local.",
};

export default function SignUpPage() {
  return <SignUpView />;
}
