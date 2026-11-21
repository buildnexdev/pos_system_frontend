/**
 * India pincode → city / state / country via public Postal PIN API.
 * https://api.postalpincode.in/pincode/{pin}
 */

export type PincodePlace = {
  city: string;
  state: string;
  country: string;
  district?: string;
  area?: string;
};

export function normalizePincode(value: unknown) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 6);
}

export async function lookupIndianPincode(pin: string): Promise<PincodePlace | null> {
  const code = normalizePincode(pin);
  if (code.length !== 6) return null;

  const res = await fetch(`https://api.postalpincode.in/pincode/${code}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  const offices = first?.PostOffice;
  if (!first || first.Status !== 'Success' || !Array.isArray(offices) || !offices.length) {
    return null;
  }

  const po = offices[0];
  return {
    city: String(po.District || po.Block || po.Name || '').trim(),
    state: String(po.State || '').trim(),
    country: String(po.Country || 'India').trim() || 'India',
    district: po.District ? String(po.District) : undefined,
    area: po.Name ? String(po.Name) : undefined,
  };
}
