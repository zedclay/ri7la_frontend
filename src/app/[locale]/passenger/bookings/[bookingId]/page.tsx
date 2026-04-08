import { PassengerBookingDetailContainer } from "@/components/passenger/PassengerBookingDetailContainer";

export default async function PassengerBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <PassengerBookingDetailContainer bookingId={bookingId} />;
}
