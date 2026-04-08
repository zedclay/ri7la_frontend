import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getPlaceByCityKey, placePrimaryLabel } from "@/lib/algeriaPlaces";

export async function PopularRoutes() {
  const t = await getTranslations("common");
  const locale = await getLocale();

  const routes: {
    fromKey: string;
    toKey: string;
    duration: string;
    price: string;
    carpool: boolean;
    bus: boolean;
  }[] = [
    {
      fromKey: "Algiers",
      toKey: "Oran",
      duration: t("routeDur1"),
      price: "1 200 DA",
      carpool: true,
      bus: true,
    },
    {
      fromKey: "Algiers",
      toKey: "Constantine",
      duration: t("routeDur2"),
      price: "1 500 DA",
      carpool: true,
      bus: true,
    },
    {
      fromKey: "Oran",
      toKey: "Tlemcen",
      duration: t("routeDur3"),
      price: "800 DA",
      carpool: true,
      bus: false,
    },
  ];

  function lineLabel(fromKey: string, toKey: string) {
    const a = getPlaceByCityKey(fromKey);
    const b = getPlaceByCityKey(toKey);
    const from = a ? placePrimaryLabel(a, locale) : fromKey;
    const to = b ? placePrimaryLabel(b, locale) : toKey;
    return { from, to, title: `${from} → ${to}` };
  }

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-2 font-headline text-3xl font-bold text-on-surface md:text-4xl">
              {t("popularTitle")}
            </h2>
            <p className="text-on-surface-variant">{t("popularSubtitle")}</p>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-2 font-bold text-primary md:flex"
          >
            {t("seeAll")}
            <MaterialIcon name="arrow_forward" className="!text-xl rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => {
            const { title } = lineLabel(r.fromKey, r.toKey);
            return (
              <Link
                key={`${r.fromKey}-${r.toKey}`}
                href={`/search?from=${encodeURIComponent(r.fromKey)}&to=${encodeURIComponent(r.toKey)}`}
                className="cursor-pointer rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h5 className="font-headline text-lg font-bold text-on-surface">{title}</h5>
                    <p className="text-xs font-semibold tracking-wider text-outline">
                      {t("durationApprox", { duration: r.duration })}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="block text-xs font-medium text-on-surface-variant">
                      {t("fromPrice")}
                    </span>
                    <span className="text-xl font-bold text-primary">{r.price}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.carpool && (
                    <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface">
                      <MaterialIcon name="directions_car" className="!text-sm" />
                      {t("carpoolShort")}
                    </span>
                  )}
                  {r.bus && (
                    <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface">
                      <MaterialIcon name="directions_bus" className="!text-sm" />
                      {t("bus")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
