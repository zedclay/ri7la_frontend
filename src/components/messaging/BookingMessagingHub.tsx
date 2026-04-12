"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type Thread = {
  bookingId: string;
  bookingStatus: string;
  myRole: "passenger" | "driver";
  otherUser: { id: string; fullName: string };
  trip: { id: string; originCity: string; destinationCity: string; departureAt: string };
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
};

type ThreadsResponse = { items: Thread[] };

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; fullName: string };
};

type MessagesResponse = {
  bookingId: string;
  bookingStatus: string;
  canPost: boolean;
  items: MessageRow[];
};

function fmtTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function fmtRelative(iso: string, locale: string) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return "now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function BookingMessagingHub({ variant }: { variant: "passenger" | "driver" }) {
  const t = useTranslations("messaging");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagesResponse | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sendBusy, setSendBusy] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    function sync() {
      setHasToken(!!getAccessToken());
    }
    sync();
    setClientReady(true);
    window.addEventListener("ri7la_auth", sync);
    return () => window.removeEventListener("ri7la_auth", sync);
  }, []);

  const loadThreads = useCallback(async () => {
    if (!getAccessToken()) {
      setThreads([]);
      return;
    }
    setThreadsError(null);
    try {
      const res = await apiGetJsonData<ThreadsResponse>("/api/bookings/messaging/threads");
      setThreads(res.items ?? []);
    } catch (e) {
      setThreadsError(e instanceof Error ? e.message : t("loadError"));
      setThreads([]);
    }
  }, [t]);

  const loadMessages = useCallback(
    async (bookingId: string) => {
      if (!getAccessToken()) return;
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const res = await apiGetJsonData<MessagesResponse>(`/api/bookings/${encodeURIComponent(bookingId)}/messages`);
        setMessages(res);
      } catch (e) {
        setMessagesError(e instanceof Error ? e.message : t("loadError"));
        setMessages(null);
      } finally {
        setMessagesLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (!hasToken) return;
    void loadThreads();
  }, [hasToken, loadThreads]);

  useEffect(() => {
    if (!hasToken) {
      setMeId(null);
      return;
    }
    void apiGetJsonData<{ id: string }>("/api/users/me")
      .then((u) => setMeId(u.id))
      .catch(() => setMeId(null));
  }, [hasToken]);

  useEffect(() => {
    const q = searchParams.get("booking");
    if (q && /^[0-9a-f-]{36}$/i.test(q)) setSelectedId(q);
  }, [searchParams]);

  useEffect(() => {
    if (selectedId) void loadMessages(selectedId);
    else setMessages(null);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (!hasToken || !selectedId) return;
    const bookingId = selectedId;
    function tick() {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void loadMessages(bookingId);
    }
    const id = window.setInterval(tick, 25_000);
    return () => window.clearInterval(id);
  }, [hasToken, selectedId, loadMessages]);

  useEffect(() => {
    if (!hasToken || threads === null) return;
    function tick() {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      void loadThreads();
    }
    const id = window.setInterval(tick, 45_000);
    return () => window.clearInterval(id);
  }, [hasToken, threads, loadThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.items]);

  async function send() {
    if (!selectedId || !messages?.canPost || sendBusy) return;
    const text = draft.trim();
    if (!text) return;
    setSendBusy(true);
    setMessagesError(null);
    try {
      const res = await apiPostJsonData<MessagesResponse>(`/api/bookings/${encodeURIComponent(selectedId)}/messages`, {
        body: text,
      });
      setMessages(res);
      setDraft("");
      await loadThreads();
    } catch (e) {
      setMessagesError(e instanceof Error ? e.message : t("sendError"));
    } finally {
      setSendBusy(false);
    }
  }

  const supportHref = variant === "passenger" ? "/passenger/support" : "/driver/support";
  const messagesPath = variant === "passenger" ? "/passenger/messages" : "/driver/messages";
  const loginNext = encodeURIComponent(messagesPath);

  const activeThread = threads?.find((th) => th.bookingId === selectedId) ?? null;

  if (!clientReady) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center px-4 py-20">
        <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
          <p className="mt-2 text-on-surface-variant">{t("signInHint")}</p>
          <Link
            href={`/auth/login?next=${loginNext}`}
            className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/15"
          >
            {t("signInCta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            {variant === "passenger" ? t("subtitlePassenger") : t("subtitleDriver")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadThreads()}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface"
          >
            <MaterialIcon name="refresh" className="!text-lg" />
            {t("refresh")}
          </button>
          <Link
            href={supportHref}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface"
          >
            <MaterialIcon name="support_agent" className="!text-lg" />
            {variant === "passenger" ? t("supportPassenger") : t("supportDriver")}
          </Link>
        </div>
      </div>
      <p className="-mt-2 text-[11px] text-on-surface-variant">{t("pollNote")}</p>

      {threadsError ? (
        <div className="rounded-2xl border border-error-container bg-error-container/15 px-4 py-3 text-sm text-on-error-container">
          {threadsError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 text-sm font-extrabold text-on-surface">{t("bookingShort")}</div>
          {threads === null ? (
            <div className="flex justify-center py-12 text-on-surface-variant">
              <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
            </div>
          ) : threads.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("emptyThreads")}</p>
          ) : (
            <div className="space-y-2">
              {threads.map((th) => {
                const active = selectedId === th.bookingId;
                return (
                  <button
                    key={th.bookingId}
                    type="button"
                    onClick={() => setSelectedId(th.bookingId)}
                    className={
                      active
                        ? "w-full rounded-2xl bg-primary-container/25 px-4 py-3 text-left ring-2 ring-primary-container"
                        : "w-full rounded-2xl bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-surface-container-high"
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-on-surface">{th.otherUser.fullName}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                          {th.myRole === "driver" ? t("rolePassenger") : t("roleDriver")} · {th.bookingStatus}
                        </div>
                        <div className="mt-1 truncate text-xs text-on-surface-variant">
                          {t("tripLine", { origin: th.trip.originCity, dest: th.trip.destinationCity })}
                        </div>
                        {th.lastMessage ? (
                          <div className="mt-1 truncate text-xs text-on-surface-variant">{th.lastMessage.body}</div>
                        ) : null}
                      </div>
                      {th.lastMessage ? (
                        <div className="shrink-0 text-[10px] font-bold text-on-surface-variant">
                          {fmtRelative(th.lastMessage.createdAt, locale)}
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm lg:col-span-2">
          {!selectedId ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-4 text-center">
              <MaterialIcon name="forum" className="!text-5xl text-outline" />
              <div className="font-extrabold text-on-surface">{t("selectThread")}</div>
              <p className="max-w-md text-sm text-on-surface-variant">{t("selectHint")}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-on-surface">
                    {activeThread ? t("conversationWith", { name: activeThread.otherUser.fullName }) : t("selectThread")}
                  </div>
                  {activeThread ? (
                    <div className="mt-0.5 text-xs text-on-surface-variant">
                      {t("tripLine", { origin: activeThread.trip.originCity, dest: activeThread.trip.destinationCity })}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void loadMessages(selectedId)}
                  className="text-xs font-extrabold text-primary-container underline"
                >
                  {t("refresh")}
                </button>
              </div>

              {messagesError ? (
                <div className="mb-4 rounded-xl border border-error-container bg-error-container/15 px-3 py-2 text-xs text-on-error-container">
                  {messagesError}
                </div>
              ) : null}

              <div className="flex max-h-[min(52vh,480px)] flex-col rounded-2xl bg-surface-container-low p-4">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {messagesLoading ? (
                    <div className="flex justify-center py-12">
                      <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {(messages?.items ?? []).map((m) => {
                        const mine = meId != null && m.sender.id === meId;
                        return (
                          <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                            <div
                              className={
                                mine
                                  ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-on-primary"
                                  : "max-w-[85%] rounded-2xl bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface shadow-sm"
                              }
                            >
                              <div className="text-[10px] font-bold opacity-80">
                                {mine ? t("you") : m.sender.fullName}
                              </div>
                              <div className="mt-1 whitespace-pre-wrap break-words">{m.body}</div>
                              <div className="mt-1 text-[10px] font-bold opacity-70">{fmtTime(m.createdAt, locale)}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                {messages && !messages.canPost ? (
                  <p className="mt-3 text-center text-xs font-bold text-on-surface-variant">{t("readOnly")}</p>
                ) : (
                  <div className="mt-4 flex items-end gap-2 rounded-full bg-surface-container-lowest px-3 py-2 shadow-inner">
                    <MaterialIcon name="chat" className="mb-2 !text-xl text-outline" />
                    <textarea
                      rows={1}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void send();
                        }
                      }}
                      placeholder={t("placeholder")}
                      className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-y border-none bg-transparent py-2 text-sm text-on-surface outline-none"
                      disabled={sendBusy || messagesLoading}
                    />
                    <button
                      type="button"
                      disabled={sendBusy || messagesLoading || !draft.trim()}
                      onClick={() => void send()}
                      className="mb-1 shrink-0 rounded-full bg-primary px-5 py-2 text-xs font-extrabold text-on-primary disabled:opacity-45"
                    >
                      {sendBusy ? t("sending") : t("send")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
