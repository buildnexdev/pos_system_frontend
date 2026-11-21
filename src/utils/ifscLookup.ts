/**
 * India IFSC → bank / branch / address via Razorpay public IFSC API.
 * https://ifsc.razorpay.com/{IFSC}
 */

export type IfscBank = {
  bank: string;
  branch: string;
  address: string;
  city?: string;
  state?: string;
  ifsc: string;
};

/** Normalize to 11-char uppercase IFSC (letters + digits only). */
export function normalizeIfsc(value: unknown) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 11);
}

/** Basic IFSC shape: AAAA0XXXXXX */
export function isValidIfscFormat(code: string) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
}

export async function lookupIndianIfsc(raw: string): Promise<IfscBank | null> {
  const code = normalizeIfsc(raw);
  if (!isValidIfscFormat(code)) return null;

  const res = await fetch(`https://ifsc.razorpay.com/${code}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('IFSC lookup failed');

  const data = await res.json();
  if (!data || typeof data !== 'object') return null;

  return {
    bank: String(data.BANK || '').trim(),
    branch: String(data.BRANCH || '').trim(),
    address: String(data.ADDRESS || '').trim(),
    city: data.CITY ? String(data.CITY).trim() : undefined,
    state: data.STATE ? String(data.STATE).trim() : undefined,
    ifsc: String(data.IFSC || code).trim(),
  };
}
