import { Suspense } from "react";

import { BookingMessagingHub } from "@/components/messaging/BookingMessagingHub";

export default function PassengerMessagesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-on-surface-variant">…</div>}>
      <BookingMessagingHub variant="passenger" />
    </Suspense>
  );
}
