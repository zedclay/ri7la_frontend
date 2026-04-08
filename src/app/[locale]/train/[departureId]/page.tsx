import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { trainCoverImage } from "@/lib/coverImages";
import { splitTicketPrice } from "@/lib/tripPricing";
import { unwrapApiSuccess } from "@/lib/unwrapApi";

type Props = { params: Promise<{ departureId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departureId } = await params;
  return {
    title: `Train trip — Ri7la`,
    description: `Train departure ${departureId}. Book on Ri7la.`,
  };
}

type ApiTrip = {
  id: string;
  mode: string;
  originName: string;
  destinationName: string;
  departureAt: string;
  arrivalAt: string | null;
  priceAmount: number;
  seatsAvailable: number;
  coverImageUrl?: string | null;
  busDetails?: { lineName: string; busType: string | null } | null;
};

function hhmm(iso: string) {
  return new Date(iso).toISOString().slice(11, 16);
}

function durationLabel(dep: string, arr: string | null) {
  if (!arr) return "—";
  const a = new Date(arr).getTime();
  const d = new Date(dep).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(d)) return "—";
  const mins = Math.max(0, Math.round((a - d) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function trainClass(busType: string | null | undefined): "Standard" | "First" {
  const s = (busType ?? "").toLowerCase();
  return s.includes("first") ? "First" : "Standard";
}

export default async function TrainDeparturePage({ params }: Props) {
  const { departureId } = await params;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  const res = await fetch(`${base}/api/trips/${departureId}`, { cache: "no-store" });
  if (!res.ok) return notFound();

  const trip = unwrapApiSuccess<ApiTrip>(await res.json());
  if (trip.mode !== "TRAIN") return notFound();

  const { baseFare, serviceFee } = splitTicketPrice(trip.priceAmount);
  const total = baseFare + serviceFee;
  const coverSrc = trip.coverImageUrl?.trim() || trainCoverImage();
  const dateLabel = new Date(trip.departureAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-28">
      <div className="rounded-2xl bg-surface-container-lowest p-10 shadow-sm">
        <div className="relative mb-8 h-48 overflow-hidden rounded-2xl bg-surface-container-low">
          <Image
            src={coverSrc}
            alt="Train"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 900px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-on-surface">
            <MaterialIcon name="train" className="!text-sm text-primary" />
            Train
          </div>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high">
              <MaterialIcon name="train" className="!text-3xl text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Train</div>
              <h1 className="font-headline text-2xl font-extrabold text-on-surface">
                {trip.busDetails?.lineName?.split("·")[0]?.trim() ?? "SNTF"}
              </h1>
            </div>
          </div>
          <Link href="/search?mode=train" className="text-sm font-bold text-primary underline underline-offset-4">
            Back to results
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="rounded-2xl bg-surface-container-low p-8 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{dateLabel}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
              <div className="min-w-[140px] text-center sm:text-left">
                <div className="text-2xl font-extrabold text-on-surface">{hhmm(trip.departureAt)}</div>
                <div className="text-sm font-bold text-on-surface">{trip.originName}</div>
                <div className="text-xs text-on-surface-variant">Departure</div>
              </div>
              <div className="flex flex-1 flex-col items-center px-2 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Journey</div>
                <div className="mt-1 text-sm font-extrabold text-primary">
                  {durationLabel(trip.departureAt, trip.arrivalAt)}
                </div>
              </div>
              <div className="min-w-[140px] text-center sm:text-right">
                <div className="text-2xl font-extrabold text-on-surface">
                  {trip.arrivalAt ? hhmm(trip.arrivalAt) : "—"}
                </div>
                <div className="text-sm font-bold text-on-surface">{trip.destinationName}</div>
                <div className="text-xs text-on-surface-variant">Arrival</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
                <MaterialIcon name="info" className="!text-xl text-primary" />
                {trip.busDetails?.lineName ?? "SNTF service"}
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">
                Times and fares are seeded for demo. Production will sync with official operator APIs.
              </p>
            </div>
          </section>

          <aside className="rounded-2xl bg-surface-container-low p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Price</div>
            <div className="mt-2 text-3xl font-extrabold text-primary">
              {total.toLocaleString("fr-DZ")} <span className="text-sm font-bold">DZD</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-on-secondary-fixed-variant">
              <MaterialIcon name="event_seat" className="!text-sm" />
              {trip.seatsAvailable} seats available
            </div>
            <div className="mt-6 space-y-2 text-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Class</span>
                <span className="font-bold text-on-surface">{trainClass(trip.busDetails?.busType)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Base fare</span>
                <span className="font-bold text-on-surface">{baseFare.toLocaleString("fr-DZ")} DZD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span className="font-bold text-on-surface">{serviceFee.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </div>

            <Link
              href={`/passenger/checkout/${trip.id}/details`}
              className="mt-8 flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            >
              Continue
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
