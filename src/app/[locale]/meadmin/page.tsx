import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Admin Login — Saafir",
  description: "Admin console login for Saafir.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
        </Link>
        <Link href="/auth/login" className="text-sm font-bold text-primary underline underline-offset-4">
          Passenger/Driver Login
        </Link>
      </header>
      <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16">
        <Suspense>
          <LoginForm fixedRole="admin" />
        </Suspense>
      </main>
    </div>
  );
}
