import { SafetyFooter } from "@/components/safety/SafetyFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface-variant selection:bg-primary-fixed selection:text-on-primary-fixed">
      <PublicHeader />
      {children}
      <SafetyFooter />
    </div>
  );
}
