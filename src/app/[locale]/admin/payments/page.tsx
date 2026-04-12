import { Suspense } from "react";

import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-on-surface-variant">Loading…</div>}>
      <AdminPaymentsClient />
    </Suspense>
  );
}

