import type { ConfirmedBookingSnapshot } from "@/lib/confirmedBooking";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildTicketQrPayload(snapshot: ConfirmedBookingSnapshot): string {
  const b = snapshot.booking;
  return [
    "RI7LA",
    snapshot.bookingId,
    b.referenceCode,
    snapshot.ticketToken,
    b.departureTime,
    b.fromLabel,
    b.toLabel,
  ].join("|");
}

export function ticketQrImageUrl(snapshot: ConfirmedBookingSnapshot, size = 200): string {
  const data = encodeURIComponent(buildTicketQrPayload(snapshot));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=M&data=${data}`;
}

const PAYMENT_LABELS_FR: Record<string, string> = {
  edahabia: "Edahabia",
  cib: "Carte CIB",
  bank_transfer: "Virement / CCP",
  cash: "Espèces",
};

function paymentLabel(method: string): string {
  return PAYMENT_LABELS_FR[method] ?? method;
}

function modeLabelFr(mode: string): string {
  if (mode === "bus") return "Bus";
  if (mode === "train") return "Train";
  return "Covoiturage";
}

export function generateTicketHtml(snapshot: ConfirmedBookingSnapshot): string {
  const { booking: b, passenger, pricing, confirmedAt, ticketToken } = snapshot;
  const ref = escapeHtml(b.referenceCode);
  const name = escapeHtml(passenger.fullName);
  const email = escapeHtml(passenger.email);
  const phone = escapeHtml(passenger.phone);
  const pay = escapeHtml(paymentLabel(snapshot.payment.method));
  const payState =
    snapshot.payment.status === "captured" ? "Payé (simulation)" : "À régler avec le conducteur";
  const qrUrl = escapeHtml(ticketQrImageUrl(snapshot, 220));

  const lines: string[] = [
    "<!DOCTYPE html>",
    '<html lang="fr">',
    "<head>",
    '<meta charset="utf-8"/>',
    `<title>Billet Ri7la — ${ref}</title>`,
    `<style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; color: #0d2323; background: #f4faf9; }
      .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 8px 32px rgba(0,83,91,0.12); border: 1px solid #e0eeec; }
      h1 { margin: 0 0 8px; font-size: 22px; color: #00535b; }
      .ref { display: inline-block; background: #e8f5f4; padding: 8px 14px; border-radius: 999px; font-weight: 800; letter-spacing: 0.05em; font-size: 14px; color: #00535b; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
      .box { background: #f7faf9; border-radius: 12px; padding: 14px; }
      .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #5c7a78; margin-bottom: 6px; }
      .val { font-size: 15px; font-weight: 700; }
      .route { font-size: 18px; font-weight: 800; margin-top: 16px; color: #0d2323; }
      .muted { color: #5c7a78; font-size: 13px; margin-top: 4px; }
      .qr { text-align: center; margin-top: 24px; }
      .qr img { border-radius: 12px; border: 1px solid #e0eeec; }
      .footer { margin-top: 24px; font-size: 11px; color: #7a9a96; text-align: center; }
      @media print { body { background: #fff; } .card { box-shadow: none; border: none; } }
    </style>`,
    "</head>",
    "<body>",
    '<div class="card">',
    `<h1>Ri7la — ${escapeHtml(modeLabelFr(b.mode))}</h1>`,
    `<p class="muted">Billet électronique — présentez ce document (ou le QR) à l’embarquement.</p>`,
    `<p><span class="ref">Réf. ${ref}</span></p>`,
    `<p class="muted">Jeton billet : ${escapeHtml(ticketToken)} · Confirmé le ${escapeHtml(
      new Date(confirmedAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    )}</p>`,
    `<div class="route">${escapeHtml(b.fromLabel)} → ${escapeHtml(b.toLabel)}</div>`,
    `<p class="muted">${escapeHtml(b.dateLabel)} · Départ ${escapeHtml(b.departureTime)}${
      b.arrivalTime ? ` · Arrivée ${escapeHtml(b.arrivalTime)}` : ""
    }</p>`,
    '<div class="grid">',
    `<div class="box"><div class="label">Passager</div><div class="val">${name}</div><div class="muted">${email}</div><div class="muted">+213 ${phone}</div></div>`,
    `<div class="box"><div class="label">Place / véhicule</div><div class="val">${escapeHtml(
      b.seatLabel ?? "—"
    )}</div>${
      b.vehicleLabel
        ? `<div class="muted">${escapeHtml(b.vehicleLabel)}</div>`
        : b.serviceClass
          ? `<div class="muted">Classe : ${escapeHtml(b.serviceClass)}</div>`
          : ""
    }</div>`,
    `<div class="box"><div class="label">Opérateur</div><div class="val">${escapeHtml(b.providerOrDriverName)}</div></div>`,
    `<div class="box"><div class="label">Paiement</div><div class="val">${pay}</div><div class="muted">${escapeHtml(
      payState
    )}</div><div class="muted" style="margin-top:8px;font-weight:700">Total : ${pricing.total.toLocaleString(
      "fr-DZ"
    )} ${escapeHtml(pricing.currency)}</div></div>`,
    "</div>",
  ];

  if (b.originDetail || b.pickupDetail) {
    lines.push(
      `<div class="box" style="margin-top:16px"><div class="label">Départ (détail)</div><div class="val">${escapeHtml(
        b.originDetail ?? b.pickupDetail ?? ""
      )}</div></div>`
    );
  }
  if (b.destinationDetail || b.dropoffDetail) {
    lines.push(
      `<div class="box" style="margin-top:12px"><div class="label">Arrivée (détail)</div><div class="val">${escapeHtml(
        b.destinationDetail ?? b.dropoffDetail ?? ""
      )}</div></div>`
    );
  }
  if (b.boardingPointTitle || b.boardingPointBody) {
    lines.push(
      `<div class="box" style="margin-top:12px"><div class="label">${escapeHtml(
        b.boardingPointTitle ?? "Embarquement"
      )}</div><div class="muted">${escapeHtml(b.boardingPointBody ?? "")}</div></div>`
    );
  }

  lines.push(
    `<div class="qr"><div class="label">QR d’embarquement</div><img src="${qrUrl}" width="220" height="220" alt="QR code billet"/></div>`,
    '<p class="footer">Ri7la — démo MVP. Conservez ce billet sur votre téléphone.</p>',
    "</div>",
    "</body>",
    "</html>"
  );

  return lines.join("");
}

export function downloadTicketHtml(snapshot: ConfirmedBookingSnapshot, fileBaseName?: string): void {
  const html = generateTicketHtml(snapshot);
  const ref = snapshot.booking.referenceCode.replace(/\s+/g, "-");
  const name = fileBaseName ?? `ri7la-billet-${ref}`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.html`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const PAYMENT_SHORT: Record<string, string> = {
  edahabia: "Edahabia",
  cib: "CIB",
  bank_transfer: "Virement",
  cash: "Especes",
};

/** Client-only: saves a real PDF (with embedded QR). Uses ASCII-friendly labels for PDF font compatibility. */
export async function downloadTicketPdf(
  snapshot: ConfirmedBookingSnapshot,
  fileBaseName?: string
): Promise<void> {
  const [jspdfMod, QRCode] = await Promise.all([import("jspdf"), import("qrcode")]);
  const JsPDF = jspdfMod.default;
  const payload = buildTicketQrPayload(snapshot);
  const qrDataUrl = await QRCode.default.toDataURL(payload, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const b = snapshot.booking;
  const p = snapshot.passenger;
  const pr = snapshot.pricing;
  const margin = 18;
  let y = margin;
  const pageW = doc.internal.pageSize.getWidth();
  const textW = pageW - margin * 2;

  doc.setFontSize(16);
  doc.setTextColor(0, 83, 91);
  doc.text("Ri7la — E-ticket", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Reference: ${b.referenceCode}`, margin, y);
  y += 6;
  doc.text(`Token: ${snapshot.ticketToken}`, margin, y);
  y += 6;
  doc.text(
    `Confirmed: ${new Date(snapshot.confirmedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`,
    margin,
    y
  );
  y += 10;

  doc.setFontSize(13);
  doc.setTextColor(13, 35, 35);
  const route = `${b.fromLabel} -> ${b.toLabel}`;
  const routeLines = doc.splitTextToSize(route, textW);
  doc.text(routeLines, margin, y);
  y += routeLines.length * 6 + 4;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const when = `${b.dateLabel} · Depart ${b.departureTime}${b.arrivalTime ? ` · Arrive ${b.arrivalTime}` : ""}`;
  doc.text(doc.splitTextToSize(when, textW), margin, y);
  y += 12;

  doc.setTextColor(13, 35, 35);
  doc.text(`Passenger: ${p.fullName}`, margin, y);
  y += 6;
  doc.setTextColor(60, 60, 60);
  doc.text(doc.splitTextToSize(`${p.email} · +213 ${p.phone}`, textW), margin, y);
  y += 10;

  doc.setTextColor(13, 35, 35);
  doc.text(`Seat / vehicle: ${b.seatLabel ?? "—"}`, margin, y);
  y += 6;
  if (b.vehicleLabel) {
    doc.setTextColor(60, 60, 60);
    const vl = doc.splitTextToSize(b.vehicleLabel, textW);
    doc.text(vl, margin, y);
    y += vl.length * 5 + 4;
  } else {
    y += 4;
  }

  doc.setTextColor(13, 35, 35);
  doc.text(`Operator: ${b.providerOrDriverName}`, margin, y);
  y += 8;

  const pay = PAYMENT_SHORT[snapshot.payment.method] ?? snapshot.payment.method;
  const payState = snapshot.payment.status === "captured" ? "Paid (demo)" : "Pay driver / pending";
  doc.text(`Payment: ${pay} — ${payState}`, margin, y);
  y += 6;
  doc.text(`Total: ${pr.total.toLocaleString("fr-DZ")} ${pr.currency}`, margin, y);
  y += 12;

  doc.addImage(qrDataUrl, "PNG", margin, y, 50, 50);
  y += 54;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(doc.splitTextToSize("Show this QR at boarding. Ri7la MVP demo.", textW), margin, y);
  if (b.originDetail || b.pickupDetail) {
    y += 8;
    doc.text(doc.splitTextToSize(`From: ${b.originDetail ?? b.pickupDetail ?? ""}`, textW), margin, y);
  }
  if (b.destinationDetail || b.dropoffDetail) {
    y += 6;
    doc.text(doc.splitTextToSize(`To: ${b.destinationDetail ?? b.dropoffDetail ?? ""}`, textW), margin, y);
  }

  const ref = b.referenceCode.replace(/\s+/g, "-");
  const name = fileBaseName ?? `ri7la-billet-${ref}`;
  doc.save(`${name}.pdf`);
}

export function printTicketHtml(snapshot: ConfirmedBookingSnapshot): void {
  const html = generateTicketHtml(snapshot);
  const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => {
    try {
      w.print();
    } catch {
      /* ignore */
    }
  }, 450);
}
