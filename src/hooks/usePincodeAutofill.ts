import { useEffect, useRef, useState } from 'react';
import { lookupIndianPincode, normalizePincode } from '../utils/pincodeLookup';

type FieldMap = {
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
};

type Status = 'idle' | 'loading' | 'ok' | 'err';

/**
 * Debounced India pincode autofill for Formik (or any setFieldValue API).
 * City / state / country are meant to be read-only — filled only from pincode.
 */
export function usePincodeAutofill(
  setFieldValue: (field: string, value: any) => void,
  fields: FieldMap = {},
) {
  const pinKey = fields.pincode || 'pincode';
  const cityKey = fields.city || 'city';
  const stateKey = fields.state || 'state';
  const countryKey = fields.country || 'country';

  const [status, setStatus] = useState<Status>('idle');
  const [hint, setHint] = useState('');
  const timerRef = useRef<number | null>(null);
  const reqRef = useRef(0);

  const clearPlace = () => {
    setFieldValue(cityKey, '');
    setFieldValue(stateKey, '');
    setFieldValue(countryKey, '');
  };

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const onPincodeChange = (raw: string) => {
    const digits = normalizePincode(raw);
    setFieldValue(pinKey, digits);

    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (digits.length < 6) {
      setStatus('idle');
      setHint('');
      clearPlace();
      return;
    }

    setStatus('loading');
    setHint('Looking up pincode…');
    const reqId = ++reqRef.current;

    timerRef.current = window.setTimeout(async () => {
      try {
        const place = await lookupIndianPincode(digits);
        if (reqId !== reqRef.current) return;
        if (!place) {
          clearPlace();
          setStatus('err');
          setHint('Pincode not found');
          return;
        }
        setFieldValue(cityKey, place.city || '');
        setFieldValue(stateKey, place.state || '');
        setFieldValue(countryKey, place.country || 'India');
        setStatus('ok');
        setHint([place.city, place.state].filter(Boolean).join(', '));
      } catch {
        if (reqId !== reqRef.current) return;
        clearPlace();
        setStatus('err');
        setHint('Lookup failed — try again');
      }
    }, 350);
  };

  /** City / state / country stay locked — only pincode can fill them */
  const fieldsLocked = true;

  return { status, hint, onPincodeChange, fieldsLocked };
}
