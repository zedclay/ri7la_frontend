import { CarpoolTripFooter } from "@/components/carpool/CarpoolTripFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function CarpoolTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container/30 antialiased">
      <PublicHeader />
      {children}
      <CarpoolTripFooter />
    </div>
  );
}
