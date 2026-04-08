import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyAccountClient } from "./verify-account-client";

export const metadata: Metadata = {
  title: "Vérification du compte — Ri7la",
  description: "Vérifiez votre compte avec un code envoyé par SMS ou e-mail.",
};

export default function VerifyAccountPage() {
  return (
    <Suspense>
      <VerifyAccountClient />
    </Suspense>
  );
}
