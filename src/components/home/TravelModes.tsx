import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const IMG_CARPOOL =
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80";

const IMG_BUS =
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=80";

const IMG_TRAIN =
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80";

export async function TravelModes() {
  const t = await getTranslations("common");

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center font-headline text-3xl font-bold text-on-surface md:text-4xl">
          {t("travelModesTitle")}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <article className="subtle-shadow group overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={IMG_CARPOOL}
                alt={t("modeCarpoolTitle")}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-6 start-6 text-white">
                <span className="mb-2 inline-block rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed">
                  {t("tagEconomical")}
                </span>
                <h3 className="font-headline text-2xl font-bold">{t("modeCarpoolTitle")}</h3>
              </div>
            </div>
            <div className="p-8">
              <p className="mb-8 leading-relaxed text-on-surface-variant">{t("modeCarpoolBody")}</p>
              <Link
                href="/search?mode=carpool"
                className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
              >
                {t("modeCarpoolCta")}
                <MaterialIcon name="chevron_right" className="!text-xl rtl:rotate-180" />
              </Link>
            </div>
          </article>

          <article className="subtle-shadow group overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={IMG_BUS}
                alt={t("modeBusTitle")}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-6 start-6 text-white">
                <span className="mb-2 inline-block rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-primary-fixed-variant">
                  {t("tagComfort")}
                </span>
                <h3 className="font-headline text-2xl font-bold">{t("modeBusTitle")}</h3>
              </div>
            </div>
            <div className="p-8">
              <p className="mb-8 leading-relaxed text-on-surface-variant">{t("modeBusBody")}</p>
              <Link
                href="/search?mode=bus"
                className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
              >
                {t("modeBusCta")}
                <MaterialIcon name="chevron_right" className="!text-xl rtl:rotate-180" />
              </Link>
            </div>
          </article>

          <article className="subtle-shadow group overflow-hidden rounded-xl bg-surface-container-lowest">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={IMG_TRAIN}
                alt={t("modeTrainTitle")}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-6 start-6 text-white">
                <span className="mb-2 inline-block rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-secondary-fixed-variant">
                  {t("tagOfficial")}
                </span>
                <h3 className="font-headline text-2xl font-bold">{t("modeTrainTitle")}</h3>
              </div>
            </div>
            <div className="p-8">
              <p className="mb-8 leading-relaxed text-on-surface-variant">{t("modeTrainBody")}</p>
              <Link
                href="/search?mode=train"
                className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
              >
                {t("modeTrainCta")}
                <MaterialIcon name="chevron_right" className="!text-xl rtl:rotate-180" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
