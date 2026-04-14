import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PassengerBookingsList } from "@/components/passenger/PassengerBookingsList";
import { getTranslations } from "next-intl/server";

export default async function PassengerBookingsPage() {
  const t = await getTranslations("bookings");
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
          <p className="mt-1 text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "upcoming", label: t("tabUpcoming") },
            { key: "pending", label: t("tabPending") },
            { key: "completed", label: t("tabCompleted") },
            { key: "canceled", label: t("tabCanceled") },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={
                tab.key === "upcoming"
                  ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-primary-container"
                  : "rounded-full px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t("filterTransportType")}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              {t("filterAllTypes")}
              <MaterialIcon name="expand_more" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t("filterDateRange")}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              {t("filterDateRangeValue")}
              <MaterialIcon name="calendar_month" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t("filterStatus")}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              {t("filterAllStatuses")}
              <MaterialIcon name="tune" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            >
              <MaterialIcon name="filter_alt" className="!text-xl" />
              {t("applyFilters")}
            </button>
          </div>
        </div>
      </div>

      <PassengerBookingsList />
    </div>
  );
}
