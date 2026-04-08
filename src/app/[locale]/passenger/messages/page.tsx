import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function PassengerMessagesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Messages</h1>
        <p className="mt-1 text-on-surface-variant">
          Chat with drivers and get updates about your bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Inbox</div>
            <span className="rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
              2 NEW
            </span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Taharat Transport", preview: "Your seat 12A is confirmed.", when: "2m" },
              { name: "Ahmed (Driver)", preview: "Meet at Sogral gate 3.", when: "1h" },
            ].map((c) => (
              <button
                key={c.name}
                type="button"
                className="w-full rounded-2xl bg-surface-container-low px-4 py-4 text-left transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-on-surface">{c.name}</div>
                    <div className="mt-1 truncate text-xs text-on-surface-variant">{c.preview}</div>
                  </div>
                  <div className="text-[10px] font-bold text-on-surface-variant">{c.when}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Conversation</div>
            <button type="button" className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface">
              <span className="inline-flex items-center gap-2">
                <MaterialIcon name="support_agent" className="!text-lg" />
                Contact Support
              </span>
            </button>
          </div>

          <div className="flex h-[420px] flex-col justify-between rounded-2xl bg-surface-container-low p-5">
            <div className="space-y-4 overflow-auto pr-1">
              <div className="max-w-md rounded-2xl bg-white/70 px-4 py-3 text-sm text-on-surface">
                Bonjour, votre ticket est confirmé. Merci d&apos;arriver 30 minutes avant le départ.
              </div>
              <div className="ml-auto max-w-md rounded-2xl bg-primary px-4 py-3 text-sm text-white">
                Merci, est-ce que le siège 12A est bien côté fenêtre ?
              </div>
              <div className="max-w-md rounded-2xl bg-white/70 px-4 py-3 text-sm text-on-surface">
                Oui, 12A est côté fenêtre.
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-full bg-white px-4 py-3">
              <MaterialIcon name="chat" className="!text-xl text-outline" />
              <input
                className="min-w-0 flex-1 border-none bg-transparent text-sm text-on-surface outline-none"
                placeholder="Type a message..."
              />
              <button type="button" className="rounded-full bg-primary px-5 py-2 text-xs font-extrabold text-on-primary">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

