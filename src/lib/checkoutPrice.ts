import type { Booking } from "@/lib/types";

export function checkoutPriceBreakdown(booking: Booking) {
  const base = booking.baseFare?.amount ?? booking.totalPrice.amount;
  const fee = booking.serviceFee?.amount ?? 0;
  const total = booking.totalPrice.amount;
  return { base, fee, total, currency: booking.totalPrice.currency };
}
