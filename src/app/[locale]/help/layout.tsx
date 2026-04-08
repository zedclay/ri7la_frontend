import { HelpFooter } from "@/components/help/HelpFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <PublicHeader />
      {children}
      <HelpFooter />
    </div>
  );
}
