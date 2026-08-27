// =============================================================================
// Widgets context — shared state for the dashboard-widgets toggles so the global
// top bar (mounted in the app shell, visible on every page) and the dashboard
// (which reads the toggles to show/hide sections) stay in sync. Persisted to
// localStorage so choices survive reloads.
// =============================================================================
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface WidgetDef {
	key: string;
	label: string;
}

// Dashboard sections the panel can toggle. Keys map 1:1 to DashboardLMS sections.
export const WIDGET_DEFS: WidgetDef[] = [
	{ key: 'kpis', label: 'Key metrics' },
	{ key: 'collectionDetails', label: 'Collection Details' },
	{ key: 'portfolio', label: 'Portfolio summary' },
	{ key: 'eod', label: 'EOD Status' },
	{ key: 'loanIndex', label: 'Loan Index Status' },
	{ key: 'branchDemand', label: 'Branch-wise Demand' },
	{ key: 'par', label: 'PAR & Aging' },
	{ key: 'leaderboard', label: 'Officer Leaderboard' },
	{ key: 'pipeline', label: 'Loan Pipeline' },
	{ key: 'alerts', label: 'Action Items' },
	{ key: 'sectors', label: 'Sectors / Activity' },
	{ key: 'growth', label: 'Member Growth' },
];

const STORE = 'sn_lms_widgets';

interface WidgetsContextValue {
	widgets: Record<string, boolean>;
	setWidgets: (w: Record<string, boolean>) => void;
	/** A section shows unless explicitly toggled off. */
	show: (key: string) => boolean;
}

const WidgetsContext = createContext<WidgetsContextValue>({
	widgets: {},
	setWidgets: () => {},
	show: () => true,
});

export const WidgetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [widgets, setWidgets] = useState<Record<string, boolean>>(() => {
		try {
			return JSON.parse(localStorage.getItem(STORE) || '{}');
		} catch {
			return {};
		}
	});
	useEffect(() => {
		try {
			localStorage.setItem(STORE, JSON.stringify(widgets));
		} catch {
			/* ignore quota / private-mode errors */
		}
	}, [widgets]);
	const show = (key: string) => widgets[key] !== false;
	return (
		<WidgetsContext.Provider value={{ widgets, setWidgets, show }}>
			{children}
		</WidgetsContext.Provider>
	);
};

export const useWidgets = () => useContext(WidgetsContext);
