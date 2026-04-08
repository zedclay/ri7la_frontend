import { SearchFiltersAndResults } from "@/components/search/SearchFiltersAndResults";
import { SearchPageToolbar } from "@/components/search/SearchPageToolbar";
import { SearchRouteSidebar } from "@/components/search/SearchRouteSidebar";
import { resolveCityKeyFromParam, routeMarkerFromCityKey } from "@/lib/algeriaPlaces";
import { Suspense } from "react";

function pickParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const p = await searchParams;
  const fromRaw = pickParam(p.from);
  const toRaw = pickParam(p.to);

  const fromKey = resolveCityKeyFromParam(fromRaw, "Algiers");
  const destinationAny = (toRaw ?? "").trim().toLowerCase() === "any";
  const toKey = destinationAny ? "any" : resolveCityKeyFromParam(toRaw, "Oran");

  return (
    <>
      <Suspense fallback={<div className="sticky top-[72px] z-40 h-14 border-b border-outline-variant/15 bg-surface-container-lowest/80" />}>
        <SearchPageToolbar />
      </Suspense>
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="grid grid-cols-12 gap-8">
          <Suspense>
            <SearchFiltersAndResults />
          </Suspense>
          <SearchRouteSidebar
            fromShort={routeMarkerFromCityKey(fromKey)}
            toShort={routeMarkerFromCityKey(toKey)}
          />
        </div>
      </main>
    </>
  );
}
