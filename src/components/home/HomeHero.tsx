import { getTranslations } from "next-intl/server";
import { HomeHeroSliderClient } from "./HomeHeroSliderClient";

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
];

export async function HomeHero() {
  const t = await getTranslations("common");
  const slides = [
    {
      src: HERO_SLIDES[0]!,
      alt: `${t("heroImageAlt")} — ${t("modeCarpoolTitle")}`,
      kicker: t("modeCarpoolTitle"),
      title: t("homeSlide1Title"),
      subtitle: t("homeSlide1Subtitle"),
    },
    {
      src: HERO_SLIDES[1]!,
      alt: `${t("heroImageAlt")} — ${t("modeBusTitle")}`,
      kicker: t("modeBusTitle"),
      title: t("homeSlide2Title"),
      subtitle: t("homeSlide2Subtitle"),
    },
    {
      src: HERO_SLIDES[2]!,
      alt: `${t("heroImageAlt")} — ${t("modeTrainTitle")}`,
      kicker: t("modeTrainTitle"),
      title: t("homeSlide3Title"),
      subtitle: t("homeSlide3Subtitle"),
    },
  ];

  return (
    <section className="relative h-[min(78vh,760px)] min-h-[560px] w-full overflow-hidden">
      <HomeHeroSliderClient slides={slides} variant="fullbleed" className="absolute inset-0" />
    </section>
  );
}
