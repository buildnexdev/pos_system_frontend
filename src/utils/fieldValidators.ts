/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Shared Yup validators for Indian phone, Aadhaar, PAN, GSTIN, etc.
 * Edit Date: 2026-11-14
 */

import * as Yup from 'yup';

/** Digits only from any input (spaces/dashes stripped) */
export function digitsOnly(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** Normalize Indian mobile to 10 digits (+91 / leading 0 stripped when possible) */
export function normalizePhone(value: unknown): string {
  let d = digitsOnly(value);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

export function alnumUpper(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

const emptyOk = (v: unknown) => v == null || String(v).trim() === '';

/** Optional/required Indian mobile: exactly 10 digits */
export function phoneField(required = false) {
  let schema = Yup.string()
    .transform((v) => {
      if (v == null || String(v).trim() === '') return '';
      return normalizePhone(v);
    })
    .test('phone-10', 'Phone must be 10 digits', (v) => {
      if (emptyOk(v)) return !required;
      return /^\d{10}$/.test(String(v));
    });
  if (required) schema = schema.required('Phone is required');
  return schema;
}

/** Aadhaar: exactly 12 digits (optional when empty) */
export function aadhaarField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim()))
    .test('aadhaar-12', 'Aadhaar must be 12 digits', (v) => {
      if (emptyOk(v)) return !required;
      return /^\d{12}$/.test(digitsOnly(v));
    });
  if (required) schema = schema.required('Aadhaar is required');
  return schema;
}

/** PAN: ABCDE1234F */
export function panField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim().toUpperCase()))
    .test('pan', 'PAN must be like ABCDE1234F', (v) => {
      if (emptyOk(v)) return !required;
      return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(alnumUpper(v));
    });
  if (required) schema = schema.required('PAN is required');
  return schema;
}

/** Indian pincode: exactly 6 digits */
export function pincodeField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim()))
    .test('pincode-6', 'Pincode must be 6 digits', (v) => {
      if (emptyOk(v)) return !required;
      return /^\d{6}$/.test(digitsOnly(v));
    });
  if (required) schema = schema.required('Pincode is required');
  return schema;
}

/** IFSC: 4 letters + 0 + 6 alnum (11 chars) */
export function ifscField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim().toUpperCase()))
    .test('ifsc', 'IFSC must be 11 characters (e.g. SBIN0001234)', (v) => {
      if (emptyOk(v)) return !required;
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(alnumUpper(v));
    });
  if (required) schema = schema.required('IFSC is required');
  return schema;
}

/** GSTIN: 15 characters */
export function gstinField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim().toUpperCase()))
    .test('gstin', 'GSTIN must be 15 characters', (v) => {
      if (emptyOk(v)) return !required;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(alnumUpper(v));
    });
  if (required) schema = schema.required('GSTIN is required');
  return schema;
}

/** Bank account: 9–18 digits */
export function accountNumberField(required = false) {
  let schema = Yup.string()
    .transform((v) => (v == null ? '' : String(v).trim()))
    .test('account', 'Account number must be 9–18 digits', (v) => {
      if (emptyOk(v)) return !required;
      const d = digitsOnly(v);
      return /^\d{9,18}$/.test(d);
    });
  if (required) schema = schema.required('Account number is required');
  return schema;
}
