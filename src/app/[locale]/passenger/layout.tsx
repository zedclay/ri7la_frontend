import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <RequireDemoRole role="passenger" />
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-28">{children}</main>
    </div>
  );
}
