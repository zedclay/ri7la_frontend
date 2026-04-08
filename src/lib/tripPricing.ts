/** Match search / checkout: total ticket price split for display (until API exposes lines separately). */
export function splitTicketPrice(total: number): { baseFare: number; serviceFee: number } {
  const serviceFee = Math.min(120, Math.max(25, Math.round(total * 0.045)));
  return { baseFare: total - serviceFee, serviceFee };
}
