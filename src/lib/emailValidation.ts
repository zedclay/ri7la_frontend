/** Loose but practical check aligned with typical `type="email"` behavior. */
export function isValidEmail(value: string): boolean {
  const s = value.trim();
  if (s.length < 5 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
