import type { PaymentMethod } from "@/lib/types";

const PREFIX = "saafir_checkout_";

export type PassengerCheckoutDraft = {
  fullName: string;
  email: string;
  phone: string;
};

export type PaymentCheckoutDraft = {
  method: PaymentMethod;
  /** Baridimob transfer receipt (data URL) — required when method is baridimob */
  baridimobReceiptDataUrl?: string;
};

function passengerKey(bookingId: string) {
  return `${PREFIX}passenger_${bookingId}`;
}

function paymentKey(bookingId: string) {
  return `${PREFIX}payment_${bookingId}`;
}

export function savePassengerDraft(bookingId: string, draft: PassengerCheckoutDraft) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(passengerKey(bookingId), JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function loadPassengerDraft(bookingId: string): PassengerCheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(passengerKey(bookingId));
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<PassengerCheckoutDraft>;
    if (typeof j.fullName !== "string" || typeof j.email !== "string" || typeof j.phone !== "string") {
      return null;
    }
    return { fullName: j.fullName, email: j.email, phone: j.phone };
  } catch {
    return null;
  }
}

export function savePaymentDraft(bookingId: string, draft: PaymentCheckoutDraft) {
  if (typeof window === "undefined") return;
  try {
    const payload: Record<string, unknown> = { method: draft.method };
    if (draft.method === "baridimob" && draft.baridimobReceiptDataUrl) {
      payload.baridimobReceiptDataUrl = draft.baridimobReceiptDataUrl;
    }
    sessionStorage.setItem(paymentKey(bookingId), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadPaymentDraft(bookingId: string): PaymentCheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(paymentKey(bookingId));
    if (!raw) return null;
    const j = JSON.parse(raw) as { method?: PaymentMethod; baridimobReceiptDataUrl?: string };
    if (!j.method) return null;
    return {
      method: j.method,
      baridimobReceiptDataUrl: typeof j.baridimobReceiptDataUrl === "string" ? j.baridimobReceiptDataUrl : undefined,
    };
  } catch {
    return null;
  }
}

export function clearCheckoutDrafts(bookingId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(passengerKey(bookingId));
    sessionStorage.removeItem(paymentKey(bookingId));
  } catch {
    /* ignore */
  }
}
