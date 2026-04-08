import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BusTripDetailView } from "@/components/bus/BusTripDetailView";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  params: Promise<{ departureId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departureId } = await params;
  return {
    title: `Bus trip — Ri7la`,
    description: `Bus departure ${departureId}. Select seats and book on Ri7la.`,
  };
}

export default async function BusTripPage({ params }: Props) {
  const { departureId } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-12">
      <nav className="mb-8" aria-label="Breadcrumb">
        <Link
          href="/search"
          className="flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
        >
          <MaterialIcon name="arrow_back" className="!text-sm" />
          <span className="font-body">Back to Search Results</span>
        </Link>
      </nav>
      <BusTripDetailView departureId={departureId} />
    </main>
  );
}
