import { PublicHeader } from "@/components/layout/PublicHeader";
import { SearchResultsFooter } from "@/components/search/SearchResultsFooter";

export default function TrainTripLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant antialiased">
      <PublicHeader />
      {children}
      <SearchResultsFooter />
    </div>
  );
}

