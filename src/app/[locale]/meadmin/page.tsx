import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Admin Login — Ri7la",
  description: "Admin console login for Ri7la.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <MaterialIcon name="commute" className="!text-2xl text-primary" />
          <span className="font-headline text-xl font-extrabold tracking-tight text-primary-container">Ri7la</span>
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
