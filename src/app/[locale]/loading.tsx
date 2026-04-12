/**
 * Instant fallback UI during client navigations under /[locale].
 * Improves perceived speed while RSC payloads stream in.
 */
export default function LocaleSegmentLoading() {
  return (
    <div className="min-h-[50vh] w-full animate-pulse px-6 pt-28 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-9 max-w-md rounded-xl bg-outline-variant/15" />
        <div className="h-4 max-w-2xl rounded-lg bg-outline-variant/10" />
        <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 rounded-2xl bg-outline-variant/10" />
          <div className="h-40 rounded-2xl bg-outline-variant/10" />
          <div className="h-40 rounded-2xl bg-outline-variant/10 sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </div>
  );
}
