import { TermsFooter } from "@/components/terms/TermsFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <PublicHeader />
      {children}
      <TermsFooter />
    </div>
  );
}
