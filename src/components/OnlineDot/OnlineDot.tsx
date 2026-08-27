import React from 'react';

/**
 * OnlineDot — small presence indicator next to a staff name.
 *
 * Three states matching the server's bucket (Operations/OfficerStatus):
 *   - 'online'  → green   (≤10 min since last location ping)
 *   - 'idle'    → amber   (10-30 min)
 *   - 'offline' → grey    (>30 min OR no ping today)
 *
 * Defaults to 'offline' so a missing/loading entry never falsely shows green.
 * Pure render — no effects, no state, no animations.
 */

type OnlineStatus = 'online' | 'idle' | 'offline';

interface OnlineDotProps {
	status?: OnlineStatus | string;
	size?: number;
	title?: string;
}

const PALETTE: Record<OnlineStatus, { bg: string; border: string }> = {
	online: { bg: '#22C55E', border: 'transparent' },
	idle: { bg: '#F59E0B', border: 'transparent' },
	offline: { bg: '#D1D5DB', border: '#9CA3AF' },
};

const labelFor = (status: string): string => {
	if (status === 'online') return 'Online — pinged in the last 10 min';
	if (status === 'idle') return 'Idle — last ping 10-30 min ago';
	return 'Offline — no recent ping';
};

const OnlineDot: React.FC<OnlineDotProps> = ({ status, size = 10, title }) => {
	const key: OnlineStatus =
		status === 'online' || status === 'idle' || status === 'offline'
			? (status as OnlineStatus)
			: 'offline';
	const palette = PALETTE[key];
	return (
		<span
			role='img'
			aria-label={title ?? labelFor(key)}
			title={title ?? labelFor(key)}
			style={{
				display: 'inline-block',
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: palette.bg,
				border: palette.border === 'transparent' ? 'none' : `1px solid ${palette.border}`,
				marginRight: 6,
				verticalAlign: 'middle',
				flexShrink: 0,
			}}
		/>
	);
};

export default OnlineDot;
