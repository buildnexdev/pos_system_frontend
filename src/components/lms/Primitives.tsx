// =============================================================================
// LMS primitives — Badge, StatusDot, Avatar, KPI — ported 1:1 from the Claude
// Design prototype (components.jsx), converted from Tailwind to inline styles +
// LMS tokens so they render identically in the Bootstrap app.
// KPI carries `.card sn-tilt sn-reveal` so the global MotionLayer gives it the
// same pointer-tilt + glare + staggered reveal as the prototype.
// =============================================================================
import React from 'react';
import Icon from '../icon/Icon';
import { LMS } from './Charts';

const SOFT: Record<string, string> = {
	moss: '#DCE8E3',
	amber: '#FBEBD7',
	good: '#DCEEDC',
	warn: '#FAEFC9',
	bad: '#F5DAD3',
	info: '#DDE9F1',
	plum: '#E8DEF0',
	clay: '#F2DBCB',
	neutral: '#F4EFE7',
};
const FG: Record<string, string> = {
	moss: LMS.moss,
	amber: LMS.amber,
	good: LMS.good,
	warn: LMS.warn,
	bad: LMS.bad,
	info: LMS.info,
	plum: LMS.plum,
	clay: LMS.clay,
	neutral: LMS.ink2,
};
const SOLID: Record<string, string> = {
	moss: LMS.moss,
	amber: LMS.amber,
	good: LMS.good,
	warn: LMS.warn,
	bad: LMS.bad,
	info: LMS.info,
	plum: LMS.plum,
	clay: LMS.clay,
	neutral: LMS.ink2,
};

const DISPLAY = "'Fraunces', Georgia, serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

type Tone =
	| 'neutral'
	| 'moss'
	| 'amber'
	| 'good'
	| 'warn'
	| 'bad'
	| 'info'
	| 'plum'
	| 'clay';

export const Badge: React.FC<{
	tone?: Tone;
	children: React.ReactNode;
	dot?: boolean;
	size?: 'sm' | 'md';
}> = ({ tone = 'neutral', children, dot = false, size = 'md' }) => (
	<span
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 6,
			borderRadius: 999,
			border: `1px solid ${FG[tone]}33`,
			background: SOFT[tone],
			color: FG[tone],
			fontWeight: 600,
			textTransform: 'uppercase',
			letterSpacing: '0.04em',
			fontSize: size === 'sm' ? 10 : 11,
			padding: size === 'sm' ? '0 6px' : '0 8px',
			height: size === 'sm' ? 20 : 24,
			whiteSpace: 'nowrap',
		}}>
		{dot && (
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: '50%',
					background: 'currentColor',
				}}
			/>
		)}
		{children}
	</span>
);

const STATUS_MAP: Record<string, [Tone, string]> = {
	active: ['good', 'Active'],
	overdue: ['bad', 'Overdue'],
	pending: ['warn', 'Pending'],
	rejected: ['neutral', 'Rejected'],
	closed: ['neutral', 'Closed'],
	approved: ['info', 'Approved'],
	disbursed: ['good', 'Disbursed'],
	verification: ['warn', 'Verification'],
	kyc: ['plum', 'KYC'],
	ppi: ['clay', 'PPI'],
	yet: ['warn', 'Yet to do'],
	open: ['warn', 'Open'],
};

export const StatusDot: React.FC<{ status: string }> = ({ status }) => {
	const [tone, label] = STATUS_MAP[status] || (['neutral', status] as [Tone, string]);
	return (
		<Badge tone={tone} dot>
			{label}
		</Badge>
	);
};

const AVATAR_PALETTE = [
	LMS.moss,
	LMS.amber,
	LMS.clay,
	LMS.plum,
	LMS.info,
	LMS.warn,
	LMS.good,
	LMS.bad,
];

export const Avatar: React.FC<{ name?: string; size?: number; color?: string }> = ({
	name = '',
	size = 32,
	color,
}) => {
	const initials = (name || '')
		.split(' ')
		.map((s) => s[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();
	const c = color || AVATAR_PALETTE[(name || ' ').charCodeAt(0) % AVATAR_PALETTE.length];
	return (
		<div
			style={{
				width: size,
				height: size,
				background: c,
				borderRadius: '50%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#fff',
				fontWeight: 700,
				fontSize: size * 0.38,
				flexShrink: 0,
			}}>
			{initials || '·'}
		</div>
	);
};

export const KPI: React.FC<{
	label: string;
	value: React.ReactNode;
	delta?: { dir: 'up' | 'down'; val: string };
	tone?: Tone;
	icon?: string;
	sub?: React.ReactNode;
	sparkline?: React.ReactNode;
}> = ({ label, value, delta, tone = 'moss', icon = 'TrendingUp', sub, sparkline }) => (
	// `card` so MotionLayer tags it; sn-tilt/sn-reveal mirror the prototype's data-* attrs.
	<div
		className='card sn-tilt sn-reveal'
		style={{
			position: 'relative',
			background: '#fff',
			border: `1px solid ${FG[tone]}33`,
			borderRadius: 16,
			padding: 20,
			overflow: 'hidden',
		}}>
		<span className='sn-glare' aria-hidden='true' />
		<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
			<div
				style={{
					fontSize: 11,
					textTransform: 'uppercase',
					letterSpacing: '0.06em',
					fontWeight: 700,
					color: LMS.inkMuted,
				}}>
				{label}
			</div>
			<div
				style={{
					width: 36,
					height: 36,
					borderRadius: 12,
					background: SOLID[tone],
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<Icon icon={icon} size='lg' />
			</div>
		</div>
		<div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
			<div
				style={{
					fontFamily: DISPLAY,
					fontSize: 30,
					lineHeight: 1,
					fontWeight: 600,
					color: LMS.ink,
					fontVariantNumeric: 'tabular-nums',
				}}>
				{value}
			</div>
			{delta && (
				<div
					style={{
						fontSize: 12,
						fontWeight: 600,
						color: delta.dir === 'up' ? LMS.good : LMS.bad,
					}}>
					{delta.dir === 'up' ? '▲' : '▼'} {delta.val}
				</div>
			)}
		</div>
		{sub && <div style={{ fontSize: 12, color: LMS.inkMuted, marginTop: 4 }}>{sub}</div>}
		{sparkline && <div style={{ marginTop: 12 }}>{sparkline}</div>}
	</div>
);

// Small helpers reused by rebuilt pages
export const compact = (n: number): string => {
	const a = Math.abs(n);
	if (a >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
	if (a >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
	if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
	return `${n}`;
};
export const inr = (n: number): string => `₹${Math.round(n).toLocaleString('en-IN')}`;
export { MONO };
