import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function HowItWorks() {
  const t = await getTranslations("common");

  const steps = [
    { title: t("stepSearch"), desc: t("stepSearchDesc"), icon: "search" as const },
    { title: t("stepCompare"), desc: t("stepCompareDesc"), icon: "compare_arrows" as const },
    { title: t("stepBook"), desc: t("stepBookDesc"), icon: "book_online" as const },
    { title: t("stepTravel"), desc: t("stepTravelDesc"), icon: "travel_explore" as const },
  ];

  return (
    <section id="comment-ca-marche" className="bg-surface-container-low px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-headline text-3xl font-bold text-on-surface md:text-4xl">
            {t("howItWorksTitle")}
          </h2>
          <p className="text-on-surface-variant">{t("howItWorksSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="space-y-4 rounded-xl bg-surface-container-lowest p-8 text-center"
            >
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/30 text-primary-container">
                <MaterialIcon name={step.icon} className="!text-3xl" />
              </div>
              <h4 className="font-headline text-xl font-bold text-on-surface">{step.title}</h4>
              <p className="text-sm leading-relaxed text-on-surface-variant">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
