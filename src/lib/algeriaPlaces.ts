/** Canonical city keys match backend `TripEntity.originCity` / `destinationCity` (English). */

export type PlaceEntry = {
  cityKey: string;
  labelFr: string;
  labelAr: string;
  wilayaFr: string;
  wilayaAr: string;
  /** Wilaya administrative code (01–69) for search */
  wilayaCode: string;
  /** Extra strings for matching (FR/AR variants; diacritics stripped in norm()) */
  tokens: string[];
};

function n(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Province name = chef-lieu (same labels for city and wilaya). */
function place(
  wilayaCode: string,
  cityKey: string,
  labelFr: string,
  labelAr: string,
  extraTokens: string[] = []
): PlaceEntry {
  return {
    cityKey,
    labelFr,
    labelAr,
    wilayaFr: labelFr,
    wilayaAr: labelAr,
    wilayaCode,
    tokens: [wilayaCode, ...extraTokens],
  };
}

/**
 * 69 wilayas: 01–58 (réformes 2019) + 11 nouvelles (nov. 2025, codes 59–69).
 * @see https://en.wikipedia.org/wiki/Provinces_of_Algeria
 */
const RAW_ALGERIA_PLACES: PlaceEntry[] = [
  place("01", "Adrar", "Adrar", "أدرار", ["adrar"]),
  place("02", "Chlef", "Chlef", "الشلف", ["chlef", "el asnam"]),
  place("03", "Laghouat", "Laghouat", "الأغواط", ["laghouat"]),
  place("04", "OumElBouaghi", "Oum El Bouaghi", "أم البواقي", ["oum", "bouaghi"]),
  place("05", "Batna", "Batna", "باتنة", ["batna"]),
  place("06", "Bejaia", "Béjaïa", "بجاية", ["bejaia", "bougie"]),
  place("07", "Biskra", "Biskra", "بسكرة", ["biskra"]),
  place("08", "Bechar", "Béchar", "بشار", ["bechar"]),
  place("09", "Blida", "Blida", "البليدة", ["blida"]),
  place("10", "Bouira", "Bouïra", "البويرة", ["bouira"]),
  place("11", "Tamanrasset", "Tamanrasset", "تمنراست", ["tamanrasset"]),
  place("12", "Tebessa", "Tébessa", "تبسة", ["tebessa"]),
  place("13", "Tlemcen", "Tlemcen", "تلمسان", ["tlemcen"]),
  place("14", "Tiaret", "Tiaret", "تيارت", ["tiaret"]),
  place("15", "TiziOuzou", "Tizi Ouzou", "تيزي وزو", ["tizi", "ouzou"]),
  place("16", "Algiers", "Alger", "الجزائر", ["alger", "algiers"]),
  place("17", "Djelfa", "Djelfa", "الجلفة", ["djelfa"]),
  place("18", "Jijel", "Jijel", "جيجل", ["jijel"]),
  place("19", "Setif", "Sétif", "سطيف", ["setif", "stif"]),
  place("20", "Saida", "Saïda", "سعيدة", ["saida"]),
  place("21", "Skikda", "Skikda", "سكيكدة", ["skikda"]),
  place("22", "SidiBelAbbes", "Sidi Bel Abbès", "سيدي بلعباس", ["sidi", "bel", "abbes"]),
  place("23", "Annaba", "Annaba", "عنابة", ["annaba", "bone"]),
  place("24", "Guelma", "Guelma", "قالمة", ["guelma"]),
  place("25", "Constantine", "Constantine", "قسنطينة", ["constantine"]),
  place("26", "Medea", "Médéa", "المدية", ["medea"]),
  place("27", "Mostaganem", "Mostaganem", "مستغانم", ["mostaganem"]),
  place("28", "MSila", "M'Sila", "المسيلة", ["msila", "m sila"]),
  place("29", "Mascara", "Mascara", "معسكر", ["mascara"]),
  place("30", "Ouargla", "Ouargla", "ورقلة", ["ouargla"]),
  place("31", "Oran", "Oran", "وهران", ["oran", "wahran"]),
  place("32", "ElBayadh", "El Bayadh", "البيض", ["bayadh", "el bayadh"]),
  place("33", "Illizi", "Illizi", "اليزي", ["illizi"]),
  place("34", "BordjBouArreridj", "Bordj Bou Arréridj", "برج بوعريريج", ["bordj", "arreridj", "bou arreridj"]),
  place("35", "Boumerdes", "Boumerdès", "بومرداس", ["boumerdes"]),
  place("36", "ElTarf", "El Tarf", "الطارف", ["tarf", "el tarf"]),
  place("37", "Tindouf", "Tindouf", "تندوف", ["tindouf"]),
  place("38", "Tissemsilt", "Tissemsilt", "تسمسيلت", ["tissemsilt"]),
  place("39", "ElOued", "El Oued", "الوادي", ["el", "oued"]),
  place("40", "Khenchela", "Khenchela", "خنشلة", ["khenchela"]),
  place("41", "SoukAhras", "Souk Ahras", "سوق أهراس", ["souk", "ahras"]),
  place("42", "Tipaza", "Tipaza", "تيبازة", ["tipaza"]),
  place("43", "Mila", "Mila", "ميلة", ["mila"]),
  place("44", "AinDefla", "Aïn Defla", "عين الدفلى", ["ain", "defla"]),
  place("45", "Naama", "Naâma", "النعامة", ["naama", "nama"]),
  place("46", "AinTemouchent", "Aïn Témouchent", "عين تموشنت", ["ain", "temouchent"]),
  place("47", "Ghardaia", "Ghardaïa", "غرداية", ["ghardaia"]),
  place("48", "Relizane", "Relizane", "غليزان", ["relizane"]),
  place("49", "Timimoun", "Timimoun", "تيميمون", ["timimoun"]),
  place("50", "BordjBadjiMokhtar", "Bordj Badji Mokhtar", "برج باجي مختار", ["bordj", "badji", "mokhtar"]),
  place("51", "OuledDjellal", "Ouled Djellal", "أولاد جلال", ["ouled", "djellal"]),
  place("52", "BeniAbbes", "Béni Abbès", "بني عباس", ["beni", "abbes"]),
  place("53", "InSalah", "In Salah", "عين صالح", ["in salah", "ain salah"]),
  place("54", "InGuezzam", "In Guezzam", "عين قزام", ["in guezzam", "guezzam"]),
  place("55", "Touggourt", "Touggourt", "تقرت", ["touggourt", "tougourt"]),
  place("56", "Djanet", "Djanet", "جانت", ["djanet"]),
  place("57", "ElMghair", "El M'Ghair", "المغير", ["mghair", "el mghair"]),
  place("58", "ElMenia", "El Menia", "المنيعة", ["menia", "el menia"]),
  // 11 wilayas créées en novembre 2025 (codes provisoires 59–69, chef-lieu = nom de wilaya)
  place("59", "Aflou", "Aflou", "أفلو", ["aflou"]),
  place("60", "Barika", "Barika", "بريكة", ["barika"]),
  place("61", "KsarChellala", "Ksar Chellala", "قصر الشلالة", ["ksar", "chellala", "chelala"]),
  place("62", "Messaad", "Messaad", "مسعد", ["messaad", "mesaad"]),
  place("63", "AinOussera", "Aïn Oussera", "عين وسارة", ["ain", "oussera", "ousrera"]),
  place("64", "Boussada", "Boussaâda", "بوسعادة", ["boussada", "bou saada"]),
  place("65", "ElAbiodhSidiCheikh", "El Abiodh Sidi Cheikh", "الأبيض سيدي الشيخ", ["abiodh", "sidi cheikh"]),
  place("66", "ElKantara", "El Kantara", "القنطرة", ["kantara"]),
  place("67", "BirElAter", "Bir El Ater", "بئر العاتر", ["bir", "ater"]),
  place("68", "KsarElBoukhari", "Ksar El Boukhari", "قصر البخاري", ["ksar", "boukhari"]),
  place("69", "ElAricha", "El Aricha", "العريشة", ["aricha"]),
];

export const ALGERIA_PLACES = [...RAW_ALGERIA_PLACES].sort((a, b) =>
  a.labelFr.localeCompare(b.labelFr, "fr", { sensitivity: "base" })
);

const byKey = new Map(ALGERIA_PLACES.map((p) => [n(p.cityKey), p]));

export function getPlaceByCityKey(cityKey: string): PlaceEntry | undefined {
  return byKey.get(n(cityKey)) ?? ALGERIA_PLACES.find((p) => n(p.cityKey) === n(cityKey));
}

/** Primary line for UI (city / chef-lieu). */
export function placePrimaryLabel(p: PlaceEntry, locale: string): string {
  return locale === "ar" ? p.labelAr : p.labelFr;
}

/** Secondary line: official wilaya code (chef-lieu name is already on the first line). */
export function placeWilayaLabel(p: PlaceEntry, locale: string): string {
  return locale === "ar" ? `ولاية ${p.wilayaCode}` : `Wilaya ${p.wilayaCode}`;
}

export function formatPlaceLine(p: PlaceEntry, locale: string): string {
  return `${placePrimaryLabel(p, locale)} — ${placeWilayaLabel(p, locale)}`;
}

export function displayForCityKey(cityKey: string, locale: string): string {
  const p = getPlaceByCityKey(cityKey);
  if (!p) return cityKey;
  return formatPlaceLine(p, locale);
}

export function placeMatchesQuery(p: PlaceEntry, qNorm: string): boolean {
  if (!qNorm) return true;
  const parts = [
    p.cityKey,
    p.labelFr,
    p.labelAr,
    p.wilayaFr,
    p.wilayaAr,
    p.wilayaCode,
    ...p.tokens,
  ];
  return parts.some((f) => n(String(f)).includes(qNorm));
}

/**
 * When the input still shows the full formatted line for the current selection, treat as no
 * filter so opening the list shows all wilayas. Otherwise typing filters as usual.
 */
export function filterQueryForDropdown(raw: string, selected: PlaceEntry | undefined, locale: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (selected) {
    if (t === formatPlaceLine(selected, locale)) return "";
    if (t === placePrimaryLabel(selected, locale)) return "";
  }
  return t;
}

export function filterPlaces(raw: string, limit?: number): PlaceEntry[] {
  const q = n(raw.trim());
  if (!q) {
    return limit !== undefined ? ALGERIA_PLACES.slice(0, limit) : [...ALGERIA_PLACES];
  }
  const filtered = ALGERIA_PLACES.filter((p) => placeMatchesQuery(p, q));
  return limit !== undefined ? filtered.slice(0, limit) : filtered;
}

/** Map legacy free-text URLs (e.g. "Alger", "Oran") to canonical keys when possible. */
export function resolveCityKeyFromParam(raw: string | undefined, fallback: string): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return fallback;
  const direct = getPlaceByCityKey(trimmed);
  if (direct) return direct.cityKey;
  const q = n(trimmed);
  const hit = ALGERIA_PLACES.find(
    (p) =>
      n(p.labelFr) === q ||
      n(p.labelAr) === q ||
      n(p.wilayaFr) === q ||
      n(p.wilayaAr) === q ||
      n(p.cityKey) === q
  );
  if (hit) return hit.cityKey;
  const matches = ALGERIA_PLACES.filter((p) => placeMatchesQuery(p, q));
  if (matches.length === 1) return matches[0].cityKey;
  return trimmed;
}

/** Map typed or pasted text to a catalog key; keeps `currentKey` if ambiguous or unknown. */
export function resolveCityKeyFromTypedText(raw: string, currentKey: string): string {
  const t = raw.trim();
  if (!t) return currentKey;
  const q = n(t);
  const matches = ALGERIA_PLACES.filter((p) => placeMatchesQuery(p, q));
  if (matches.length === 1) return matches[0].cityKey;
  const fromParam = resolveCityKeyFromParam(t, currentKey);
  if (fromParam !== t.trim()) return fromParam;
  return currentKey;
}

export function routeMarkerFromCityKey(cityKey: string): string {
  if (cityKey.toLowerCase() === "any") return "∗";
  return cityKey.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "CITY";
}
