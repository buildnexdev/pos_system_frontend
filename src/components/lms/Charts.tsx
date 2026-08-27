// =============================================================================
// LMS visualization primitives — ported 1:1 from the Claude Design prototype
// (squarenow-lms/project/components.jsx). Pure SVG + inline styles using the
// LMS palette, so they need no Tailwind and drop into the Bootstrap app as-is.
// These are the building blocks every rebuilt prototype page reuses.
// =============================================================================
import React from 'react';

// LMS palette (matches src/styles/squarenow-lms/_index.scss tokens)
export const LMS = {
	moss: '#2D5F4F',
	mossDeep: '#1F4538',
	amber: '#D4823A',
	ink: '#1A1814',
	ink2: '#4A463F',
	inkMuted: '#8B867D',
	line: '#EBE3D5',
	sand: '#F4EFE7',
	good: '#2F8757',
	warn: '#B7791F',
	bad: '#B33A2E',
	info: '#2A6F97',
	clay: '#B85C38',
	plum: '#7A5A8C',
	white: '#FFFFFF',
};

const DISPLAY_FONT = "'Fraunces', Georgia, serif";

interface BarDatum {
	[k: string]: any;
}

interface BarChartProps {
	data: BarDatum[];
	height?: number;
	barWidth?: number;
	getValue?: (d: BarDatum) => number;
	getLabel?: (d: BarDatum) => string;
	color?: string;
	secondary?: boolean;
	getSecondary?: (d: BarDatum) => number;
	secondaryColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
	data,
	height = 180,
	barWidth = 14,
	getValue = (d) => d.value,
	getLabel = (d) => d.label,
	color = LMS.moss,
	secondary = false,
	getSecondary = (d) => d.value,
	secondaryColor = LMS.amber,
}) => {
	const max = Math.max(
		1,
		...data.map((d) => Math.max(getValue(d), secondary ? getSecondary(d) : 0)),
	);
	const gap = secondary ? 4 : 0;
	const groupW = barWidth + (secondary ? barWidth + gap : 0);
	const padX = 24;
	const width = Math.max(360, padX * 2 + data.length * (groupW + 22));
	const chartH = height - 32;
	return (
		<svg width='100%' viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
			{[0, 0.5, 1].map((p, i) => (
				<line
					key={i}
					x1={padX}
					x2={width - padX}
					y1={chartH * (1 - p) + 8}
					y2={chartH * (1 - p) + 8}
					stroke={LMS.line}
					strokeWidth='1'
					strokeDasharray={p === 0 ? '' : '2 3'}
				/>
			))}
			{data.map((d, i) => {
				const x0 = padX + i * (groupW + 22) + 11;
				const v = getValue(d);
				const h1 = (v / max) * (chartH - 8);
				const y1 = chartH - h1 + 8;
				return (
					<g key={i}>
						<rect x={x0} y={y1} width={barWidth} height={h1} rx='3' fill={color} opacity={v ? 1 : 0.2} />
						{secondary &&
							(() => {
								const v2 = getSecondary(d);
								const h2 = (v2 / max) * (chartH - 8);
								const y2 = chartH - h2 + 8;
								return (
									<rect
										x={x0 + barWidth + gap}
										y={y2}
										width={barWidth}
										height={h2}
										rx='3'
										fill={secondaryColor}
										opacity={v2 ? 1 : 0.2}
									/>
								);
							})()}
						<text
							x={x0 + (secondary ? groupW / 2 : barWidth / 2)}
							y={height - 6}
							textAnchor='middle'
							fontSize='10'
							fill={LMS.inkMuted}
							fontWeight='600'>
							{getLabel(d)}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

interface LineAreaProps {
	data: BarDatum[];
	height?: number;
	color?: string;
	getValue?: (d: BarDatum) => number;
}

export const LineArea: React.FC<LineAreaProps> = ({
	data,
	height = 140,
	color = LMS.moss,
	getValue = (d) => d.value,
}) => {
	const w = 600;
	const padX = 24;
	const padY = 12;
	const h = height;
	const max = Math.max(1, ...data.map(getValue));
	const stepX = (w - padX * 2) / Math.max(1, data.length - 1);
	const points = data.map((d, i) => [
		padX + i * stepX,
		padY + (h - padY * 2) * (1 - getValue(d) / max),
	]);
	if (points.length === 0) return null;
	const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
	const area = `${path} L${points[points.length - 1][0]},${h - padY} L${padX},${h - padY} Z`;
	const gradId = `lineGrad-${color.replace('#', '')}`;
	return (
		<svg width='100%' viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
			<defs>
				<linearGradient id={gradId} x1='0' x2='0' y1='0' y2='1'>
					<stop offset='0%' stopColor={color} stopOpacity='0.25' />
					<stop offset='100%' stopColor={color} stopOpacity='0' />
				</linearGradient>
			</defs>
			<path d={area} fill={`url(#${gradId})`} />
			<path
				d={path}
				fill='none'
				stroke={color}
				strokeWidth='2.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			{points.map((p, i) => (
				<circle key={i} cx={p[0]} cy={p[1]} r='3' fill={LMS.white} stroke={color} strokeWidth='2' />
			))}
		</svg>
	);
};

interface DonutDatum {
	value: number;
	color: string;
	name?: string;
}
interface DonutProps {
	data: DonutDatum[];
	size?: number;
	thickness?: number;
	centerLabel?: string | number;
	centerValue?: string | number;
}

export const Donut: React.FC<DonutProps> = ({
	data,
	size = 160,
	thickness = 22,
	centerLabel,
	centerValue,
}) => {
	const r = size / 2 - thickness / 2;
	const cx = size / 2;
	const cy = size / 2;
	const total = data.reduce((s, d) => s + d.value, 0) || 1;
	let acc = 0;
	const circ = 2 * Math.PI * r;
	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
			<circle cx={cx} cy={cy} r={r} fill='none' stroke={LMS.line} strokeWidth={thickness} />
			{data.map((d, i) => {
				const frac = d.value / total;
				const dash = frac * circ;
				const gap = circ - dash;
				const offset = -acc * circ;
				acc += frac;
				return (
					<circle
						key={i}
						cx={cx}
						cy={cy}
						r={r}
						fill='none'
						stroke={d.color}
						strokeWidth={thickness}
						strokeDasharray={`${dash} ${gap}`}
						strokeDashoffset={offset}
						transform={`rotate(-90 ${cx} ${cy})`}
					/>
				);
			})}
			{centerValue !== undefined && (
				<text
					x={cx}
					y={cy - 2}
					textAnchor='middle'
					fontSize='22'
					fontWeight='700'
					fill={LMS.ink}
					fontFamily={DISPLAY_FONT}>
					{centerValue}
				</text>
			)}
			{centerLabel !== undefined && (
				<text
					x={cx}
					y={cy + 16}
					textAnchor='middle'
					fontSize='10'
					fill={LMS.inkMuted}
					letterSpacing='1'
					fontWeight='700'>
					{centerLabel}
				</text>
			)}
		</svg>
	);
};

interface ProgressProps {
	value: number;
	max?: number;
	color?: string;
	track?: string;
	height?: number;
}

export const Progress: React.FC<ProgressProps> = ({
	value,
	max = 100,
	color = LMS.moss,
	track = LMS.line,
	height = 8,
}) => {
	const pct = Math.min(100, Math.max(0, (value / max) * 100));
	return (
		<div
			style={{
				width: '100%',
				height,
				background: track,
				borderRadius: 999,
				overflow: 'hidden',
			}}>
			<div
				style={{
					height: '100%',
					width: `${pct}%`,
					background: color,
					borderRadius: 999,
					transition: 'width .4s ease',
				}}
			/>
		</div>
	);
};

interface StackItem {
	label: string;
	value: number;
	color: string;
}
export const StackProgress: React.FC<{ items: StackItem[]; height?: number }> = ({
	items,
	height = 10,
}) => {
	const total = items.reduce((s, i) => s + i.value, 0) || 1;
	return (
		<div
			style={{
				display: 'flex',
				width: '100%',
				height,
				background: LMS.line,
				borderRadius: 999,
				overflow: 'hidden',
			}}>
			{items.map((it, i) => (
				<div
					key={i}
					title={`${it.label}: ${it.value}`}
					style={{ width: `${(it.value / total) * 100}%`, background: it.color }}
				/>
			))}
		</div>
	);
};

export const Spark: React.FC<{
	data: number[];
	color?: string;
	height?: number;
	width?: number;
}> = ({ data, color = LMS.moss, height = 28, width = 80 }) => {
	const max = Math.max(1, ...data);
	const step = width / Math.max(1, data.length - 1);
	const points = data.map((v, i) => [i * step, height - (v / max) * height]);
	const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
			<path
				d={path}
				fill='none'
				stroke={color}
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};
