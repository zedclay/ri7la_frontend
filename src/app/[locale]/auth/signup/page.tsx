import type { Metadata } from "next";
import { SignUpView } from "@/components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Créer un compte — Ri7la",
  description:
    "Inscrivez-vous sur Ri7la pour voyager en Algérie en toute confiance : utilisateurs vérifiés, paiements sécurisés et support local.",
};

export default function SignUpPage() {
  return <SignUpView />;
}
