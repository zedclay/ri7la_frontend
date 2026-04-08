import { notFound } from "next/navigation";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { CheckoutConfirmClient } from "@/components/checkout/CheckoutConfirmClient";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { loadCheckoutBooking } from "@/lib/loadCheckoutBooking";

export default async function CheckoutConfirmPage({
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
      <CheckoutShell current="confirm" bookingId={bookingId}>
        <CheckoutConfirmClient bookingId={bookingId} booking={booking} />
      </CheckoutShell>
    </>
  );
}
