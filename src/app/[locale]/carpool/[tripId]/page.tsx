import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { CarpoolBookingSidebar } from "@/components/carpool/CarpoolBookingSidebar";
import { CarpoolTripMain } from "@/components/carpool/CarpoolTripMain";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { coverForCarMake } from "@/lib/coverImages";

type Props = {
  params: Promise<{ tripId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tripId } = await params;
  return {
    title: `Trip details — Saafir`,
    description: `Carpool trip ${tripId}. Book seats from Algiers to Oran on Saafir.`,
  };
}

export default async function CarpoolTripPage({ params }: Props) {
  const { tripId } = await params;
  const base =
    process.env.API_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  const res = await fetch(`${base}/api/trips/${tripId}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
        <div className="mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <MaterialIcon name="arrow_back" className="!text-lg" />
            Back to Search Results
          </Link>
        </div>
        <div className="rounded-2xl bg-error-container px-6 py-5 text-sm font-semibold text-on-error-container">
          Trip not found.
        </div>
      </main>
    );
  }

  const payload = (await res.json()) as {
    success: boolean;
    data: {
      id: string;
      mode: "CARPOOL" | "BUS";
      originName: string;
      destinationName: string;
      departureAt: string;
      arrivalAt: string | null;
      seatsAvailable: number;
      seatsTotal: number;
      priceAmount: number;
      priceCurrency: "DZD";
      allowInstantBooking: boolean;
      driverNote: string | null;
      tripRules: string | null;
      womenOnly: boolean;
      owner: { id: string; fullName: string } | null;
      carpoolDetails: {
        carMake: string;
        carModel: string;
        carColor: string | null;
        plateNumber: string | null;
        luggagePolicy: string;
        smokingAllowed: boolean;
        petsAllowed: boolean;
        amenities: string[];
      } | null;
    };
  };
  const t = payload.data;
  const dep = new Date(t.departureAt);
  const arr = t.arrivalAt ? new Date(t.arrivalAt) : null;
  const hhmm = (d: Date) => d.toISOString().slice(11, 16);
  const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const durationHoursApprox =
    arr && Number.isFinite(arr.getTime())
      ? Math.max(1, Math.round((arr.getTime() - dep.getTime()) / 3_600_000))
      : null;
  const durationLabel =
    durationHoursApprox != null ? `${durationHoursApprox}h` : "—";
  const coverImageUrl = coverForCarMake(t.carpoolDetails?.carMake ?? null);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="mb-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialIcon name="arrow_back" className="!text-lg" />
          Back to Search Results
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <CarpoolTripMain
          trip={{
            id: t.id,
            coverImageUrl,
            title: `${t.originName} to ${t.destinationName}`,
            dateLabel,
            departureTime: hhmm(dep),
            arrivalTime: arr ? hhmm(arr) : hhmm(new Date(dep.getTime() + 4 * 60 * 60 * 1000)),
            durationLabel,
            durationHoursApprox,
            seatsAvailable: t.seatsAvailable,
            seatsTotal: t.seatsTotal,
            driverName: t.owner?.fullName ?? "Driver",
            vehicleLabel: t.carpoolDetails
              ? `${t.carpoolDetails.carMake} ${t.carpoolDetails.carModel}${t.carpoolDetails.carColor ? ` • ${t.carpoolDetails.carColor}` : ""}`
              : "Car",
            plateNumber: t.carpoolDetails?.plateNumber ?? null,
            originName: t.originName,
            destinationName: t.destinationName,
            luggagePolicy: t.carpoolDetails?.luggagePolicy ?? "MEDIUM",
            smokingAllowed: t.carpoolDetails?.smokingAllowed ?? false,
            petsAllowed: t.carpoolDetails?.petsAllowed ?? false,
            womenOnly: t.womenOnly ?? false,
            driverNote: t.driverNote ?? null,
            tripRules: t.tripRules ?? null,
            amenities: Array.isArray(t.carpoolDetails?.amenities) ? t.carpoolDetails!.amenities : [],
          }}
        />
        <div className="lg:col-span-4">
          <CarpoolBookingSidebar
            pricePerSeat={t.priceAmount}
            currency={t.priceCurrency}
            seatsAvailable={t.seatsAvailable}
            instantBooking={t.allowInstantBooking}
            checkoutHref={`/passenger/checkout/${t.id}/details`}
            tripOwnerUserId={t.owner?.id ?? null}
          />
        </div>
      </div>
    </main>
  );
}
