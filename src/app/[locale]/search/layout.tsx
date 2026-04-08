import { PublicHeader } from "@/components/layout/PublicHeader";
import { SearchResultsFooter } from "@/components/search/SearchResultsFooter";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body text-on-surface antialiased">
      <PublicHeader />
      <main className="flex-1 pt-28">{children}</main>
      <SearchResultsFooter />
    </div>
  );
}
