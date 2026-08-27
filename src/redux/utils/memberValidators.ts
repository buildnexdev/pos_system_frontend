// Shared input sanitizers + validators for the Member onboarding form and master
// pages — created for the SN task.csv QA fixes. Use the *Chars sanitizers in input
// onChange handlers (they strip disallowed characters and cap length as you type),
// and the *_RE / is* validators inside the formik validate() helpers (submit-time
// error messages). All are pure + side-effect free.

/** Keep only digits, optionally cap to `max` length. Use for aadhar/phone/pincode/account. */

const getDOBInputBounds = (_minAge: number, _maxAge?: number) => {
	const today = new Date();
	const isoDate = today.toISOString().split('T')[0];
	return {
		min: '1900-01-01',
		max: isoDate,
	};
};
export const digitsOnly = (v: unknown, max?: number): string => {
	const d = String(v ?? '').replace(/\D/g, '');
	return typeof max === 'number' ? d.slice(0, max) : d;
};

export const PINCODE_ERROR = 'Enter a valid 6-digit pincode';

/** Paste handler — keeps only digits and caps at 6 for pincode fields. */
export const mergePincodePaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	current: string,
): string => {
	e.preventDefault();
	const input = e.currentTarget;
	const start = input.selectionStart ?? current.length;
	const end = input.selectionEnd ?? current.length;
	const pasted = digitsOnly(e.clipboardData.getData('text'), 6);
	return digitsOnly(`${current.slice(0, start)}${pasted}${current.slice(end)}`, 6);
};

/** Spread on pincode `<Input>` fields — digits only, max 6. */
export const pincodeInputGuards = (value: string, setValue: (v: string) => void) => ({
	onKeyDown: blockNonDigitKeyDown,
	onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
		setValue(mergePincodePaste(e, value));
	},
	maxLength: 6,
	inputMode: 'numeric' as const,
});

/** Paste handler — keeps only digits and caps at `max` for phone fields. */
export const mergePhonePaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	current: string,
	max = 10,
): string => {
	e.preventDefault();
	const input = e.currentTarget;
	const start = input.selectionStart ?? current.length;
	const end = input.selectionEnd ?? current.length;
	const pasted = digitsOnly(e.clipboardData.getData('text'), max);
	return digitsOnly(`${current.slice(0, start)}${pasted}${current.slice(end)}`, max);
};

/** Spread on 10-digit phone `<Input>` fields — digits only. */
export const phoneInputGuards = (value: string, setValue: (v: string) => void, max = 10) => ({
	onKeyDown: blockNonDigitKeyDown,
	onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
		setValue(mergePhonePaste(e, value, max));
	},
	maxLength: max,
	inputMode: 'numeric' as const,
});

/** Names: letters, spaces and a single dot only (member/father/mother/spouse/nominee). */
export const nameChars = (v: unknown): string => String(v ?? '').replace(/[^a-zA-Z\s.]/g, '');

export const MEMBER_NAME_ERROR =
	'Only alphabetic characters, spaces, and full stop (.) are allowed';

/** Block invalid keys while typing in name fields. */
export const blockNonNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	const allowed = [
		'Backspace',
		'Delete',
		'Tab',
		'Escape',
		'Enter',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
		' ',
	];
	if (allowed.includes(e.key)) return;
	if (e.key === '.') return;
	if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) return;
	e.preventDefault();
};

/** Paste handler — strips invalid characters from pasted name text. */
export const mergeNamePaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	current: string,
): string => {
	e.preventDefault();
	const input = e.currentTarget;
	const start = input.selectionStart ?? current.length;
	const end = input.selectionEnd ?? current.length;
	const pasted = nameChars(e.clipboardData.getData('text'));
	return nameChars(`${current.slice(0, start)}${pasted}${current.slice(end)}`);
};

/** Spread on name `<Input>` fields to block invalid keys and sanitize paste. */
export const nameInputGuards = (value: string, setValue: (v: string) => void) => ({
	onKeyDown: blockNonNameKeyDown,
	onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
		setValue(mergeNamePaste(e, value));
	},
});

/** Submit-time name check — empty values pass (required rules handle blanks). */
export const validateMemberNameField = (value: unknown): string | undefined => {
	if (!isValidName(value) && String(value ?? '').trim()) {
		return MEMBER_NAME_ERROR;
	}
	return undefined;
};

/** Alphanumeric + space only — for ID-proof / address-proof numbers (no special chars). */
export const idProofChars = (v: unknown): string => String(v ?? '').replace(/[^a-zA-Z0-9\s]/g, '');

/** Strip the characters a numeric <input type="number/text"> wrongly accepts ('e','E','+','-'). */
export const numericChars = (v: unknown, allowDecimal = true): string => {
	const re = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
	let s = String(v ?? '').replace(re, '');
	if (allowDecimal) {
		const parts = s.split('.');
		if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
	}
	return s;
};

/** Account number: digits only, capped at 18. */
export const accountNumberChars = (v: unknown): string => digitsOnly(v, 18);

/** Block e/E/+/− in decimal numeric fields (use with type="tel" + numericChars). */
export const blockNegativeNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault();
};

/** Reject paste that would introduce non-numeric or negative content. */
export const blockInvalidNumericPaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	allowDecimal = true,
): void => {
	const pasted = e.clipboardData.getData('text');
	const ok = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
	if (!ok.test(pasted)) e.preventDefault();
};

/** Allow only digit keys + navigation/editing keys in numeric fields. */
export const blockNonDigitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	const allowed = [
		'Backspace',
		'Delete',
		'Tab',
		'Escape',
		'Enter',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
	];
	if (allowed.includes(e.key)) return;
	if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};

/** Allow only alphanumeric + space keys in ID/address proof number fields. */
export const blockNonIdProofKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
	if (e.ctrlKey || e.metaKey || e.altKey) return;
	const allowed = [
		'Backspace',
		'Delete',
		'Tab',
		'Escape',
		'Enter',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Home',
		'End',
		' ',
	];
	if (allowed.includes(e.key)) return;
	if (e.key.length === 1 && !/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault();
};

/** Paste handler — strips special characters from ID/address proof number fields. */
export const mergeIdProofPaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	current: string,
): string => idProofChars(`${current}${e.clipboardData.getData('text')}`);

/** Paste handler — merges clipboard digits into the current account number value. */
export const mergeAccountNumberPaste = (
	e: React.ClipboardEvent<HTMLInputElement>,
	current: string,
): string => {
	e.preventDefault();
	const input = e.currentTarget;
	const start = input.selectionStart ?? current.length;
	const end = input.selectionEnd ?? current.length;
	const pasted = digitsOnly(e.clipboardData.getData('text'), 18);
	return digitsOnly(`${current.slice(0, start)}${pasted}${current.slice(end)}`, 18);
};

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // ABCDE1234F
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/; // SBIN0001234
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_RE = /^[1-9][0-9]{5}$/;
/** Names: letters, spaces and full stop only (no digits/special chars). Non-empty. */
export const NAME_RE = /^[A-Za-z. ]+$/;
/** ID / address proof numbers: alphanumeric (spaces allowed), no special chars. Non-empty. */
export const ID_PROOF_RE = /^[A-Za-z0-9 ]+$/;

export const isValidPAN = (v: unknown): boolean => PAN_RE.test(String(v ?? '').toUpperCase());
export const isValidIFSC = (v: unknown): boolean => IFSC_RE.test(String(v ?? '').toUpperCase());
export const isValidEmail = (v: unknown): boolean => EMAIL_RE.test(String(v ?? ''));
export const isValidPincode = (v: unknown): boolean => PINCODE_RE.test(String(v ?? ''));
/** Account number must be 9–18 digits. */
export const isValidAccountNumber = (v: unknown): boolean => /^[0-9]{9,18}$/.test(String(v ?? ''));
/** Name: alphabets, spaces and full stop only. Empty -> true (let required check handle it). */
export const isValidName = (v: unknown): boolean => {
	const trimmed = String(v ?? '').trim();
	if (!trimmed) return true;
	return /^[A-Za-z\s.]+$/.test(trimmed) && /[A-Za-z]/.test(trimmed);
};
/** ID/address proof number: alphanumeric (+ spaces) only. Empty -> true. */
export const isValidIdProof = (v: unknown): boolean => {
	const s = String(v ?? '');
	return s === '' || ID_PROOF_RE.test(s);
};
/** Exactly `n` numeric digits. Empty -> true (let required check handle it). */
export const isExactDigits = (v: unknown, n: number): boolean => {
	const s = String(v ?? '');
	return s === '' || new RegExp(`^\\d{${n}}$`).test(s);
};

export type DOBAgeRole = 'member' | 'spouse' | 'nominee' | 'coapplicant';

export const DEFAULT_MIN_DOB_AGE = 18;

/** Whole-year age from DOB; null when blank/invalid. */
export const getNumericAgeFromDOB = (dob: unknown): number | null => {
	const s = String(dob ?? '').trim();
	if (!s) return null;
	const d = new Date(s);
	if (Number.isNaN(d.getTime())) return null;
	const t = new Date();
	let age = t.getFullYear() - d.getFullYear();
	const m = t.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age -= 1;
	return age >= 0 ? age : null;
};

export const resolveDOBAgeLimits = (config: {
	needAgeLimit?: unknown;
	minAge?: unknown;
	maxAge?: unknown;
}): { minAge: number; maxAge?: number } => {
	const needLimit =
		config.needAgeLimit === true ||
		config.needAgeLimit === '1' ||
		config.needAgeLimit === 1;
	if (needLimit) {
		const minParsed = parseInt(String(config.minAge ?? ''), 10);
		const maxParsed = parseInt(String(config.maxAge ?? ''), 10);
		const minAge =
			Number.isFinite(minParsed) && minParsed > 0 ? minParsed : DEFAULT_MIN_DOB_AGE;
		const maxAge =
			Number.isFinite(maxParsed) && maxParsed > 0 ? maxParsed : undefined;
		return { minAge, maxAge };
	}
	return { minAge: DEFAULT_MIN_DOB_AGE, maxAge: undefined };
};

export const getDOBAgeLimitsForRole = (
	mandConfig: Record<string, any> | null | undefined,
	role: DOBAgeRole,
): { minAge: number; maxAge?: number } => {
	if (!mandConfig) return resolveDOBAgeLimits({});
	switch (role) {
		case 'member':
			return resolveDOBAgeLimits({
				needAgeLimit: mandConfig.NeedMemberAgeLimit,
				minAge: mandConfig.MemberMinAge,
				maxAge: mandConfig.MemberMaxAge,
			});
		case 'spouse':
			return resolveDOBAgeLimits({
				needAgeLimit: mandConfig.NeedSpouseAgeLimit,
				minAge: mandConfig.SpouseMinAge,
				maxAge: mandConfig.SpouseMaxAge,
			});
		case 'nominee':
			return resolveDOBAgeLimits({
				needAgeLimit: mandConfig.NeedNomineeAgeLimit,
				minAge: mandConfig.NomineeMinAge,
				maxAge: mandConfig.NomineeMaxAge,
			});
		case 'coapplicant':
			return resolveDOBAgeLimits({
				needAgeLimit: mandConfig.NeedCoApplicantAgeLimit,
				minAge: mandConfig.CoApplicantMinAge ?? mandConfig.CoapplicantMinAge,
				maxAge: mandConfig.CoApplicantMaxAge ?? mandConfig.CoapplicantMaxAge,
			});
		default:
			return resolveDOBAgeLimits({});
	}
};

/** Submit-time DOB age check against mandatory-access limits (default min 18 when unset). */
export const validateDOBAge = (
	dob: unknown,
	mandConfig: Record<string, any> | null | undefined,
	role: DOBAgeRole,
	label?: string,
): string | undefined => {
	const age = getNumericAgeFromDOB(dob);
	if (age === null) return undefined;
	const { minAge, maxAge } = getDOBAgeLimitsForRole(mandConfig, role);
	const name =
		label ??
		(role === 'coapplicant'
			? 'Co-applicant'
			: role.charAt(0).toUpperCase() + role.slice(1));
	if (age < minAge) return `${name} must be at least ${minAge} years old`;
	if (maxAge !== undefined && age > maxAge) return `${name} must be at most ${maxAge} years old`;
	return undefined;
};

/** True when the DOB makes the person at least `minAge` (default 18). Empty -> true (let the required check handle it). */
export const isAdultDOB = (dob: unknown, minAge = DEFAULT_MIN_DOB_AGE): boolean => {
	const age = getNumericAgeFromDOB(dob);
	if (age === null) return true;
	return age >= minAge;
};

/** Monthly income derived from annual (rounded). Empty when annual is blank; '0' when annual is 0. */
export const monthlyFromAnnual = (annual: unknown): string => {
	const s = numericChars(annual, true);
	if (!s) return '';
	const n = parseFloat(s);
	if (Number.isNaN(n)) return '';
	if (n <= 0) return n === 0 ? '0' : '';
	return String(Math.round(n / 12));
};

/** Whole-year age from a DOB string (for auto-filled, read-only age fields). '' if invalid. */
export const ageFromDOB = (dob: unknown): string => {
	const age = getNumericAgeFromDOB(dob);
	return age === null ? '' : String(age);
};

/** HTML date input min/max for a role from mandatory-access config. */
export const getDOBInputBoundsForRole = (
	mandConfig: Record<string, any> | null | undefined,
	role: DOBAgeRole,
) => {
	const { minAge, maxAge } = getDOBAgeLimitsForRole(mandConfig, role);
	return getDOBInputBounds(minAge, maxAge);
};
