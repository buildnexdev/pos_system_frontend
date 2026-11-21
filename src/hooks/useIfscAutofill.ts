import { useEffect, useRef, useState } from 'react';
import { isValidIfscFormat, lookupIndianIfsc, normalizeIfsc } from '../utils/ifscLookup';

type FieldMap = {
  ifsc?: string;
  bankName?: string;
  branch?: string;
  address?: string;
};

type Status = 'idle' | 'loading' | 'ok' | 'err';

/**
 * Debounced India IFSC autofill for Formik (or any setFieldValue API).
 * Bank name / branch / address are meant to be read-only — filled only from IFSC.
 */
export function useIfscAutofill(
  setFieldValue: (field: string, value: any) => void,
  fields: FieldMap = {},
) {
  const ifscKey = fields.ifsc || 'ifsc_code';
  const bankKey = fields.bankName || 'bank_name';
  const branchKey = fields.branch || 'bank_branch';
  const addressKey = fields.address || 'bank_address';

  const [status, setStatus] = useState<Status>('idle');
  const [hint, setHint] = useState('');
  const timerRef = useRef<number | null>(null);
  const reqRef = useRef(0);

  const clearBank = () => {
    setFieldValue(bankKey, '');
    setFieldValue(branchKey, '');
    setFieldValue(addressKey, '');
  };

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const onIfscChange = (raw: string) => {
    const code = normalizeIfsc(raw);
    setFieldValue(ifscKey, code);

    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (!isValidIfscFormat(code)) {
      setStatus('idle');
      setHint(code.length >= 11 ? 'Invalid IFSC format' : '');
      if (code.length < 11) clearBank();
      return;
    }

    setStatus('loading');
    setHint('Looking up IFSC…');
    const reqId = ++reqRef.current;

    timerRef.current = window.setTimeout(async () => {
      try {
        const bank = await lookupIndianIfsc(code);
        if (reqId !== reqRef.current) return;
        if (!bank) {
          clearBank();
          setStatus('err');
          setHint('IFSC not found');
          return;
        }
        setFieldValue(bankKey, bank.bank || '');
        setFieldValue(branchKey, bank.branch || '');
        setFieldValue(addressKey, bank.address || '');
        setStatus('ok');
        setHint([bank.bank, bank.branch].filter(Boolean).join(' · '));
      } catch {
        if (reqId !== reqRef.current) return;
        clearBank();
        setStatus('err');
        setHint('Lookup failed — try again');
      }
    }, 350);
  };

  /** Bank name / branch / address stay locked — only IFSC can fill them */
  const fieldsLocked = true;

  return { status, hint, onIfscChange, fieldsLocked };
}
