import { BusTripFooter } from "@/components/bus/BusTripFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function BusTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant antialiased">
      <PublicHeader />
      {children}
      <BusTripFooter />
    </div>
  );
}
