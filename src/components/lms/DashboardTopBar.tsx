// =============================================================================
// DashboardTopBar — the SquareNow-LMS top bar, ported from the design shell
// (shell.jsx TopBar/TopActions/BranchPicker/CommandPalette + the Tweaks panel's
// "Dashboard widgets" block) into the real React app, in the LMS visual style.
//
// Pieces, left → right:
//   • BranchPicker   — switch the active branch (wired to loginData.userAccess
//                       + updateUserAccessBranchStart).
//   • Command search — multi-level search over every navigable page, live typing,
//                       ⌘K / Ctrl-K to open, Esc to close, Enter/click to go.
//   • Language       — switch app language via i18n (EN/DE/FR/TR).
//   • Notifications  — bell with an alerts dropdown.
//   • Widgets        — opens the Dashboard-widgets panel that actually toggles
//                       which dashboard sections render (persisted by the parent).
//
// Self-contained: it only adds to the LMS dashboard; the global app header/layout
// is untouched.
// =============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from '../icon/Icon';
import { LMS } from './Charts';
import { getLoginObjDetails } from '../../redux/login/login.selector';
import { updateUserAccessBranchStart } from '../../redux/login/login.action';
import { fetchAllBranchesStart } from '../../redux/general/general.action';
import { selectFetchAllBranchesData } from '../../redux/general/general.selector';
import LANG from '../../lang';
import * as MENUS from '../../menu';
import { useWidgets, WIDGET_DEFS, WidgetDef } from '../../contexts/widgetsContext';

const DISPLAY = "'Fraunces', Georgia, serif";

// Routes where the top bar should NOT appear (login / sign-up / 404 are
// full-screen and have no branch/loginData context).
const HIDE_ON = /auth-pages|\/login|\/sign-up|\/404/i;
// Routes where the dashboard-widgets button is meaningful.
const isDashboardPath = (p: string) => p === '/' || p.startsWith('/dashboard');

// ---- helpers ---------------------------------------------------------------

const initials = (name: string) =>
	(name || '')
		.replace(/[^A-Za-z ]/g, '')
		.split(' ')
		.filter(Boolean)
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase() || 'BR';

interface NavEntry {
	text: string;
	path: string;
	group: string;
}

// Menu exports that are demo/sample content (Facit template leftovers) — never
// real routes, so they must stay out of the command palette.
const DEMO_MENU_RE = /demo|facit|example|component/i;

// Flatten every routable {text, path} LEAF out of the exported menu objects so
// the command palette can search the whole navigation tree. Parent/group nodes
// (anything carrying a `subMenu`) are skipped: their own `path` (e.g.
// "master-pages") is a non-routable prefix, and selecting it lands the user on
// "page not found". Only real leaves are indexed so every result navigates.
function buildNavIndex(): NavEntry[] {
	const out: NavEntry[] = [];
	const seen = new Set<string>();
	const walk = (node: any, group: string) => {
		if (!node || typeof node !== 'object') return;
		const isParent = !!node.subMenu && typeof node.subMenu === 'object';
		if (
			!isParent &&
			typeof node.path === 'string' &&
			typeof node.text === 'string' &&
			node.path
		) {
			const key = node.path;
			if (!seen.has(key)) {
				seen.add(key);
				out.push({ text: node.text, path: node.path, group });
			}
		}
		Object.keys(node).forEach((k) => {
			const v = (node as any)[k];
			if (v && typeof v === 'object') walk(v, node.text || group);
		});
	};
	Object.entries(MENUS as Record<string, any>).forEach(([name, m]) => {
		if (DEMO_MENU_RE.test(name)) return;
		walk(m, 'Menu');
	});
	return out;
}

const dropdownStyle: React.CSSProperties = {
	position: 'absolute',
	top: 'calc(100% + 6px)',
	background: '#fff',
	border: `1px solid ${LMS.line}`,
	borderRadius: 14,
	boxShadow: '0 18px 40px -12px rgba(26,24,20,0.22)',
	zIndex: 1200,
	padding: 6,
};

// ---- Branch picker ---------------------------------------------------------

const BranchPicker: React.FC = () => {
	const dispatch = useDispatch();
	const loginData = useSelector(getLoginObjDetails) as any;
	// All-branches list (item 11) — admin / super-admin accounts have an empty
	// loginData.userAccess (they can reach every branch), so the dropdown was
	// blank. Fetch the company-wide branch list and fall back to it.
	const allBranches = useSelector(selectFetchAllBranchesData) as any;
	const [open, setOpen] = useState(false);
	// Local selection used only for the all-branches fallback, where
	// updateUserAccessBranchStart can't update loginData.userAccessBranchName
	// (the chosen branch isn't inside userAccess).
	const [fallbackSelected, setFallbackSelected] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const userAccess: any[] = Array.isArray(loginData?.userAccess) ? loginData.userAccess : [];

	// Fetch the all-branches list once on mount (non-blocking). The saga reads
	// { companyID, userID, userRole, userLevel, databaseName, userAccessBranchID }.
	useEffect(() => {
		if (loginData) {
			dispatch(fetchAllBranchesStart(loginData));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginData?.companyID, loginData?.databaseName]);

	// Normalise both sources to { id, name, uniqueId }. Prefer the real
	// userAccess; fall back to the all-branches list (fields: BranchID,
	// BranchName, UniqueBranchID) when userAccess is empty.
	const branches: { id: string; name: string; uniqueId?: string }[] =
		userAccess.length > 0
			? userAccess.map((b: any) => ({
					id: String(b.UserAccessBranchID ?? ''),
					name: b.UserAccessBranchName ?? '—',
					uniqueId: b.UserAccessBranchUniqueID,
					// preserve selection flags for the active check below
					...b,
				}))
			: Array.isArray(allBranches)
				? allBranches.map((b: any) => ({
						id: String(b.BranchID ?? b.AreaID ?? b.areaID ?? ''),
						name: b.BranchName ?? b.AreaName ?? b.areaName ?? '—',
						uniqueId: b.UniqueBranchID ?? b.UniqueAreaID,
					}))
				: [];

	const selectedId = fallbackSelected?.id ?? (loginData?.userAccessBranchID as any);
	const selectedName =
		fallbackSelected?.name || loginData?.userAccessBranchName || 'All Branches';

	const select = (b: { id: string; name: string }) => {
		// "All Branches" sentinel — clear the local fallback selection.
		if (b.id === 'All') {
			setFallbackSelected(null);
			dispatch(
				updateUserAccessBranchStart({
					UserAccessBranchID: 'All',
					UserAccessBranchName: 'All Branches',
				}),
			);
			setOpen(false);
			return;
		}
		// Track locally so the trigger reflects the choice even for admin
		// accounts whose branch isn't inside userAccess.
		setFallbackSelected({ id: b.id, name: b.name });
		dispatch(
			updateUserAccessBranchStart({
				UserAccessBranchID: b.id,
				UserAccessBranchName: b.name,
			}),
		);
		setOpen(false);
	};

	return (
		<div style={{ position: 'relative' }}>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				style={{
					height: 42,
					padding: '0 12px',
					borderRadius: 12,
					border: `1px solid ${LMS.line}`,
					background: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					cursor: 'pointer',
					whiteSpace: 'nowrap',
				}}>
				<span
					style={{
						width: 28,
						height: 28,
						borderRadius: 8,
						background: LMS.moss,
						color: '#fff',
						fontSize: 10,
						fontWeight: 700,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}>
					{branches.length ? initials(selectedName) : 'ALL'}
				</span>
				<span style={{ textAlign: 'left', lineHeight: 1.1, minWidth: 0 }}>
					<span
						style={{
							display: 'block',
							fontSize: 9,
							textTransform: 'uppercase',
							letterSpacing: '0.08em',
							color: LMS.inkMuted,
							fontWeight: 700,
						}}>
						{loginData?.companyName || 'Branch'}
					</span>
					<span
						style={{ display: 'block', fontSize: 13, fontWeight: 600, color: LMS.ink }}>
						{selectedName}
					</span>
				</span>
				<Icon icon='ExpandMore' size='sm' />
			</button>
			{open && (
				<div
					style={{
						...dropdownStyle,
						left: 0,
						width: 300,
						maxHeight: 420,
						overflow: 'auto',
					}}>
					{/* "All Branches" sentinel — always the first option (item 11). */}
					{(() => {
						const allActive =
							!fallbackSelected &&
							(selectedId === 'All' ||
								selectedId === 0 ||
								selectedId === '0' ||
								selectedId === undefined ||
								selectedId === null);
						return (
							<button
								type='button'
								key='__all__'
								onClick={() => select({ id: 'All', name: 'All Branches' })}
								style={{
									width: '100%',
									textAlign: 'left',
									padding: '10px 12px',
									borderRadius: 10,
									border: 'none',
									background: allActive ? '#DCE8E3' : 'transparent',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: 10,
								}}>
								<span
									style={{
										width: 28,
										height: 28,
										borderRadius: 8,
										background: LMS.moss,
										color: '#fff',
										fontSize: 10,
										fontWeight: 700,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
									}}>
									ALL
								</span>
								<span
									style={{
										flex: 1,
										minWidth: 0,
										fontSize: 13,
										fontWeight: 600,
										color: LMS.ink,
									}}>
									All Branches
								</span>
								{allActive && <Icon icon='Check' size='sm' />}
							</button>
						);
					})()}
					{branches.length === 0 && (
						<div
							style={{
								padding: 14,
								fontSize: 13,
								color: LMS.inkMuted,
								textAlign: 'center',
							}}>
							No other branches available
						</div>
					)}
					{branches.map((b: any) => {
						const active =
							String(b.id) === String(selectedId) ||
							b.IsSelected === 1 ||
							b.IsSelected === '1';
						return (
							<button
								type='button'
								key={b.id}
								onClick={() => select({ id: b.id, name: b.name })}
								style={{
									width: '100%',
									textAlign: 'left',
									padding: '10px 12px',
									borderRadius: 10,
									border: 'none',
									background: active ? '#DCE8E3' : 'transparent',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: 10,
								}}>
								<span
									style={{
										width: 28,
										height: 28,
										borderRadius: 8,
										background: LMS.moss,
										color: '#fff',
										fontSize: 10,
										fontWeight: 700,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
									}}>
									{initials(b.name)}
								</span>
								<span style={{ flex: 1, minWidth: 0 }}>
									<span
										style={{
											display: 'block',
											fontSize: 13,
											fontWeight: 600,
											color: LMS.ink,
										}}>
										{b.name || '—'}
									</span>
									{b.uniqueId && (
										<span
											style={{
												display: 'block',
												fontSize: 11,
												color: LMS.inkMuted,
											}}>
											{b.uniqueId}
										</span>
									)}
								</span>
								{active && <Icon icon='Check' size='sm' />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

// ---- Command palette (multi-level page search) -----------------------------

const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
	const navigate = useNavigate();
	const [q, setQ] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const navIndex = useMemo(() => buildNavIndex(), []);

	useEffect(() => {
		if (open) {
			setQ('');
			setTimeout(() => inputRef.current?.focus(), 40);
		}
	}, [open]);

	const results = useMemo(() => {
		if (!q.trim()) return navIndex.slice(0, 8);
		const qq = q.toLowerCase();
		return navIndex
			.filter((n) => n.text.toLowerCase().includes(qq) || n.group.toLowerCase().includes(qq))
			.slice(0, 20);
	}, [q, navIndex]);

	const go = (path: string) => {
		onClose();
		navigate(path.startsWith('/') ? path : `/${path}`);
	};

	if (!open) return null;
	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 1300,
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'center',
				paddingTop: '12vh',
			}}>
			<div
				onClick={onClose}
				style={{
					position: 'absolute',
					inset: 0,
					background: 'rgba(26,24,20,0.4)',
					backdropFilter: 'blur(2px)',
				}}
			/>
			<div
				style={{
					position: 'relative',
					width: '100%',
					maxWidth: 640,
					background: '#fff',
					border: `1px solid ${LMS.line}`,
					borderRadius: 18,
					boxShadow: '0 30px 60px -15px rgba(26,24,20,0.4)',
					overflow: 'hidden',
				}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '0 16px',
						height: 56,
						borderBottom: `1px solid ${LMS.line}`,
					}}>
					<Icon icon='Search' size='lg' />
					<input
						ref={inputRef}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder='Search pages — members, masters, reports, operations…'
						style={{
							flex: 1,
							height: '100%',
							border: 'none',
							outline: 'none',
							fontSize: 14,
							background: 'transparent',
							color: LMS.ink,
						}}
					/>
					<kbd
						style={{
							fontSize: 10,
							fontFamily: 'monospace',
							background: LMS.sand,
							border: `1px solid ${LMS.line}`,
							padding: '2px 6px',
							borderRadius: 5,
						}}>
						esc
					</kbd>
				</div>
				<div style={{ maxHeight: '56vh', overflow: 'auto', padding: 8 }}>
					{results.map((it) => (
						<button
							type='button'
							key={it.path}
							onClick={() => go(it.path)}
							style={{
								width: '100%',
								textAlign: 'left',
								padding: '10px 12px',
								borderRadius: 10,
								border: 'none',
								background: 'transparent',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: 12,
							}}
							onMouseEnter={(e) => (e.currentTarget.style.background = LMS.sand)}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background = 'transparent')
							}>
							<span
								style={{
									width: 34,
									height: 34,
									borderRadius: 9,
									background: LMS.sand,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
								}}>
								<Icon icon='ChevronRight' size='sm' />
							</span>
							<span style={{ flex: 1, minWidth: 0 }}>
								<span
									style={{
										display: 'block',
										fontSize: 13,
										fontWeight: 600,
										color: LMS.ink,
									}}>
									{it.text}
								</span>
								<span
									style={{ display: 'block', fontSize: 11, color: LMS.inkMuted }}>
									{it.group}
								</span>
							</span>
						</button>
					))}
					{results.length === 0 && (
						<div
							style={{
								textAlign: 'center',
								padding: '40px 0',
								color: LMS.inkMuted,
								fontSize: 13,
							}}>
							No pages match “{q}”
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// ---- Language + Bell + Widgets ---------------------------------------------

const LangMenu: React.FC = () => {
	const { i18n } = useTranslation();
	const [open, setOpen] = useState(false);
	const current = (i18n.language || 'en').slice(0, 2);
	return (
		<div style={{ position: 'relative' }}>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				style={{
					height: 42,
					padding: '0 12px',
					borderRadius: 12,
					border: 'none',
					background: 'transparent',
					display: 'flex',
					alignItems: 'center',
					gap: 6,
					cursor: 'pointer',
					color: LMS.ink2,
					fontWeight: 600,
				}}>
				<Icon icon='Language' size='lg' />
				<span style={{ fontSize: 12, textTransform: 'uppercase' }}>{current}</span>
				<Icon icon='ExpandMore' size='sm' />
			</button>
			{open && (
				<div style={{ ...dropdownStyle, right: 0, width: 180 }}>
					{Object.values(LANG).map((l) => {
						const active = current === l.lng;
						return (
							<button
								type='button'
								key={l.lng}
								onClick={() => {
									i18n.changeLanguage(l.lng);
									setOpen(false);
								}}
								style={{
									width: '100%',
									textAlign: 'left',
									padding: '9px 12px',
									borderRadius: 9,
									border: 'none',
									background: active ? '#DCE8E3' : 'transparent',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									fontSize: 13,
									fontWeight: active ? 700 : 500,
									color: active ? LMS.moss : LMS.ink2,
								}}>
								<span>{l.text}</span>
								{active && <Icon icon='Check' size='sm' />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

const BellMenu: React.FC<{
	alerts: { id: string; title: string; msg: string; tone: string }[];
}> = ({ alerts }) => {
	const [open, setOpen] = useState(false);
	const toneColor: Record<string, string> = {
		critical: LMS.bad,
		warn: LMS.warn,
		info: LMS.info,
		good: LMS.good,
	};
	return (
		<div style={{ position: 'relative' }}>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				style={{
					position: 'relative',
					height: 42,
					width: 42,
					borderRadius: 12,
					border: 'none',
					background: 'transparent',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: LMS.ink2,
				}}>
				<Icon icon='Notifications' size='lg' />
				{alerts.length > 0 && (
					<span
						style={{
							position: 'absolute',
							top: 9,
							right: 9,
							width: 8,
							height: 8,
							borderRadius: 999,
							background: LMS.bad,
							border: '2px solid #fff',
						}}
					/>
				)}
			</button>
			{open && (
				<div style={{ ...dropdownStyle, right: 0, width: 360, padding: 0 }}>
					<div
						style={{
							padding: '12px 16px',
							borderBottom: `1px solid ${LMS.line}`,
							fontWeight: 600,
							color: LMS.ink,
							fontFamily: DISPLAY,
						}}>
						Alerts
					</div>
					<div style={{ maxHeight: 400, overflow: 'auto' }}>
						{alerts.length === 0 ? (
							<div
								style={{
									padding: '32px 16px',
									textAlign: 'center',
									color: LMS.inkMuted,
									fontSize: 13,
								}}>
								You’re all caught up.
							</div>
						) : (
							alerts.map((a) => (
								<div
									key={a.id}
									style={{
										display: 'flex',
										gap: 12,
										padding: '12px 16px',
										borderBottom: `1px solid ${LMS.line}`,
									}}>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: 999,
											marginTop: 6,
											background: toneColor[a.tone] || LMS.info,
											flexShrink: 0,
										}}
									/>
									<div>
										<div
											style={{
												fontSize: 13,
												fontWeight: 600,
												color: LMS.ink,
											}}>
											{a.title}
										</div>
										<div
											style={{
												fontSize: 12,
												color: LMS.inkMuted,
												marginTop: 2,
											}}>
											{a.msg}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
	<button
		type='button'
		onClick={() => onChange(!on)}
		aria-pressed={on}
		style={{
			width: 40,
			height: 22,
			borderRadius: 999,
			border: 'none',
			cursor: 'pointer',
			background: on ? LMS.moss : LMS.line,
			position: 'relative',
			transition: 'background 0.15s',
			flexShrink: 0,
		}}>
		<span
			style={{
				position: 'absolute',
				top: 2,
				left: on ? 20 : 2,
				width: 18,
				height: 18,
				borderRadius: 999,
				background: '#fff',
				transition: 'left 0.15s',
				boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
			}}
		/>
	</button>
);

const WidgetsPanel: React.FC<{
	open: boolean;
	onClose: () => void;
	widgets: Record<string, boolean>;
	onWidgetsChange: (w: Record<string, boolean>) => void;
	widgetDefs: WidgetDef[];
}> = ({ open, onClose, widgets, onWidgetsChange, widgetDefs }) => {
	if (!open) return null;
	return (
		<div
			style={{
				position: 'absolute',
				top: 'calc(100% + 8px)',
				right: 0,
				width: 320,
				background: '#fff',
				border: `1px solid ${LMS.line}`,
				borderRadius: 16,
				boxShadow: '0 24px 50px -15px rgba(26,24,20,0.3)',
				zIndex: 1200,
			}}>
			<div
				style={{
					padding: '12px 16px',
					borderBottom: `1px solid ${LMS.line}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<Icon icon='Tune' size='lg' />
					<span
						style={{
							fontFamily: DISPLAY,
							fontWeight: 600,
							fontSize: 15,
							color: LMS.ink,
						}}>
						Dashboard widgets
					</span>
				</span>
				<button
					type='button'
					onClick={onClose}
					style={{
						border: 'none',
						background: 'transparent',
						cursor: 'pointer',
						color: LMS.inkMuted,
					}}>
					<Icon icon='Close' size='sm' />
				</button>
			</div>
			<div style={{ padding: 12 }}>
				<div
					style={{
						fontSize: 11,
						color: LMS.inkMuted,
						padding: '2px 4px 8px',
						fontWeight: 600,
					}}>
					Show or hide sections on your dashboard. Saved to this browser.
				</div>
				{widgetDefs.map((w) => (
					<label
						key={w.key}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: '8px 4px',
							cursor: 'pointer',
						}}>
						<span style={{ fontSize: 13, color: LMS.ink2, fontWeight: 600 }}>
							{w.label}
						</span>
						<Toggle
							on={widgets[w.key] !== false}
							onChange={(v) => onWidgetsChange({ ...widgets, [w.key]: v })}
						/>
					</label>
				))}
			</div>
		</div>
	);
};

// ---- Top bar ---------------------------------------------------------------

const DashboardTopBar: React.FC = () => {
	const location = useLocation();
	const { widgets, setWidgets } = useWidgets();
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [widgetsOpen, setWidgetsOpen] = useState(false);

	// ⌘K / Ctrl-K opens search, Esc closes it.
	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setPaletteOpen((v) => !v);
			}
			if (e.key === 'Escape') setPaletteOpen(false);
		};
		window.addEventListener('keydown', h);
		return () => window.removeEventListener('keydown', h);
	}, []);

	// Hidden on auth / login / 404 (full-screen, no branch/loginData context).
	if (HIDE_ON.test(location.pathname)) return null;

	// The dashboard-widgets control only makes sense on the dashboard.
	const showWidgets = isDashboardPath(location.pathname);

	// Notifications: kept empty by default (wire to a real alert feed later).
	const alerts: { id: string; title: string; msg: string; tone: string }[] = [];

	return (
		<div
			className='sn-topbar sn-reveal'
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				padding: '6px 14px',
				background: '#fff',
				border: `1px solid ${LMS.line}`,
				borderRadius: 16,
				margin: '8px 16px 4px',
			}}>
			<BranchPicker />

			<button
				type='button'
				onClick={() => setPaletteOpen(true)}
				style={{
					flex: 1,
					minWidth: 0,
					maxWidth: 560,
					height: 42,
					padding: '0 14px',
					borderRadius: 12,
					border: 'none',
					background: LMS.sand,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					cursor: 'pointer',
					color: LMS.inkMuted,
				}}>
				<Icon icon='Search' size='lg' />
				<span
					style={{
						flex: 1,
						textAlign: 'left',
						fontSize: 13,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}>
					Search members, groups, pages…
				</span>
				<span
					style={{
						fontSize: 10,
						fontFamily: 'monospace',
						background: '#fff',
						border: `1px solid ${LMS.line}`,
						padding: '2px 6px',
						borderRadius: 5,
					}}>
					⌘K
				</span>
			</button>

			<div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
				<LangMenu />
				<BellMenu alerts={alerts} />
				{showWidgets && (
					<div style={{ position: 'relative' }}>
						<button
							type='button'
							onClick={() => setWidgetsOpen((v) => !v)}
							title='Dashboard widgets'
							style={{
								height: 42,
								width: 42,
								borderRadius: 12,
								border: 'none',
								background: widgetsOpen ? LMS.sand : 'transparent',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: LMS.ink2,
							}}>
							<Icon icon='Tune' size='lg' />
						</button>
						<WidgetsPanel
							open={widgetsOpen}
							onClose={() => setWidgetsOpen(false)}
							widgets={widgets}
							onWidgetsChange={setWidgets}
							widgetDefs={WIDGET_DEFS}
						/>
					</div>
				)}
			</div>

			<CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
		</div>
	);
};

export default DashboardTopBar;
