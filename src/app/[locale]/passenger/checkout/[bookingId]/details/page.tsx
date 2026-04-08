import { notFound } from "next/navigation";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { CheckoutDetailsClient } from "@/components/checkout/CheckoutDetailsClient";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { loadCheckoutBooking } from "@/lib/loadCheckoutBooking";

export default async function CheckoutDetailsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await loadCheckoutBooking(bookingId);
  if (!booking) return notFound();

  return (
    <>
      <RequireDemoRole role="passenger" requireProfileComplete />
      <CheckoutShell current="details" bookingId={bookingId}>
        <CheckoutDetailsClient bookingId={bookingId} booking={booking} />
      </CheckoutShell>
    </>
  );
}
