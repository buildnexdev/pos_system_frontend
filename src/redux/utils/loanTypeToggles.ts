// =============================================================================
// Per-tenant, client-only loan-type toggles.
//
// Six switches — MFI, Individual, Business, Auto, Gold, RD — that hide loan-type
// UI (Loan Mandatory tabs, Add Member loan-type buttons, sidebar menu items)
// across the app. Purely local: nothing is sent to the backend. Storage is
// keyed on companyID so switching tenants keeps its own set.
//
// Seed: on first read we prime from the flags already on the login object
// (isAutoLoan / isGoldLoanAvailed / isIndividualLoanNeeded). MFI / Business /
// RD default ON so nothing disappears the first time a user opens the page.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';

export type LoanTypeKey = 'mfi' | 'individual' | 'business' | 'autoLoan' | 'goldLoan' | 'rd';
export type LoanTypeToggles = Record<LoanTypeKey, boolean>;

const STORAGE_PREFIX = 'sn_loan_types_';
const EVT = 'sn:loanTypeTogglesChanged';

const storageKey = (companyID: any) => `${STORAGE_PREFIX}${String(companyID || 'guest')}`;

const truthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

const ALL_ON: LoanTypeToggles = {
	mfi: true, individual: true, business: true, autoLoan: true, goldLoan: true, rd: true,
};

const normalise = (raw: any): LoanTypeToggles => ({
	mfi: raw?.mfi !== false,
	individual: raw?.individual !== false,
	business: raw?.business !== false,
	autoLoan: raw?.autoLoan !== false,
	goldLoan: raw?.goldLoan !== false,
	rd: raw?.rd !== false,
});

export type LoginSeed = {
	isAutoLoan?: unknown;
	isGoldLoanAvailed?: unknown;
	isIndividualLoanNeeded?: unknown;
};

export function readLoanTypeToggles(companyID: any, seed: LoginSeed = {}): LoanTypeToggles {
	if (!companyID) return { ...ALL_ON };
	try {
		const raw = localStorage.getItem(storageKey(companyID));
		if (raw) return normalise(JSON.parse(raw));
	} catch {
		// ponytail: swallow parse errors — corrupt entry falls through to seed defaults.
	}
	return {
		mfi: true,
		individual: truthy(seed.isIndividualLoanNeeded),
		business: true,
		autoLoan: truthy(seed.isAutoLoan),
		goldLoan: truthy(seed.isGoldLoanAvailed),
		rd: true,
	};
}

export function writeLoanTypeToggles(companyID: any, next: LoanTypeToggles) {
	if (!companyID) return;
	try {
		localStorage.setItem(storageKey(companyID), JSON.stringify(next));
	} catch {
		return;
	}
	try {
		window.dispatchEvent(new CustomEvent(EVT, { detail: { companyID } }));
	} catch {
		// noop
	}
}

// React hook — subscribes to same-tab changes (custom event) + cross-tab
// changes (storage event) so every consumer stays in sync without prop drilling.
export function useLoanTypeToggles(
	companyID: any,
	seed: LoginSeed = {},
): [LoanTypeToggles, (key: LoanTypeKey, value: boolean) => void] {
	const [toggles, setToggles] = useState<LoanTypeToggles>(() =>
		readLoanTypeToggles(companyID, seed),
	);

	const seedAuto = seed.isAutoLoan;
	const seedGold = seed.isGoldLoanAvailed;
	const seedInd = seed.isIndividualLoanNeeded;

	useEffect(() => {
		setToggles(readLoanTypeToggles(companyID, seed));
		const refresh = () => setToggles(readLoanTypeToggles(companyID, seed));
		const onStorage = (e: StorageEvent) => {
			if (!e.key || e.key === storageKey(companyID)) refresh();
		};
		window.addEventListener(EVT, refresh as EventListener);
		window.addEventListener('storage', onStorage);
		return () => {
			window.removeEventListener(EVT, refresh as EventListener);
			window.removeEventListener('storage', onStorage);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [companyID, seedAuto, seedGold, seedInd]);

	const setToggle = useCallback(
		(key: LoanTypeKey, value: boolean) => {
			setToggles((prev) => {
				const next = { ...prev, [key]: value };
				writeLoanTypeToggles(companyID, next);
				return next;
			});
		},
		[companyID],
	);

	return [toggles, setToggle];
}

// Runnable self-check — asserts seed + persistence + normalise contracts.
// Run via `node --loader tsx utils/loanTypeToggles.ts` or inline import.
export function __selfCheck() {
	const store: Record<string, string> = {};
	const g: any = (globalThis as any);
	g.localStorage = {
		getItem: (k: string) => (k in store ? store[k] : null),
		setItem: (k: string, v: string) => { store[k] = v; },
		removeItem: (k: string) => { delete store[k]; },
	};
	g.window = g.window || {};
	g.window.dispatchEvent = () => true;

	// Fresh tenant — Auto/Gold/Ind seeded from login, others default ON.
	const seeded = readLoanTypeToggles('C1', { isAutoLoan: '1', isGoldLoanAvailed: 0, isIndividualLoanNeeded: 1 });
	if (!(seeded.autoLoan && !seeded.goldLoan && seeded.individual && seeded.mfi && seeded.business && seeded.rd)) {
		throw new Error('seed contract broken: ' + JSON.stringify(seeded));
	}
	// After a write, we read back exactly what was written.
	writeLoanTypeToggles('C1', { ...seeded, business: false, rd: false });
	const round = readLoanTypeToggles('C1', {});
	if (round.business !== false || round.rd !== false || round.autoLoan !== true) {
		throw new Error('round-trip contract broken: ' + JSON.stringify(round));
	}
	// eslint-disable-next-line no-console
	console.log('loanTypeToggles ok');
}
