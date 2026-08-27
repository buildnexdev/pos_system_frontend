// =============================================================================
// SquareNowSplash — the branded boot/loading experience, shown on every refresh.
// Replicates the Claude Design "BootSplash": a full-screen moss-gradient veil
// with the logo, a rotating "What's new" spotlight card, and a progress bar that
// fills while the workspace prepares, then fades away. Replaces the old plain
// logo splash. Self-contained (inline styles + one scoped <style>) so it needs
// no global SCSS changes.
// =============================================================================
import React, { useEffect, useRef, useState } from 'react';
import logoSrc from '../assets/logos/SQlogo.png';
import Icon from './icon/Icon';

const DISPLAY = "'Fraunces', Georgia, serif";

// Warm spotlight tones (soft tile bg + icon colour), matching the LMS palette.
const TONES: Record<string, { bg: string; fg: string }> = {
	moss: { bg: '#DCE8E3', fg: '#2D5F4F' },
	good: { bg: '#DCEEDC', fg: '#2F8757' },
	info: { bg: '#DDE9F1', fg: '#2A6F97' },
	clay: { bg: '#F2DBCB', fg: '#B85C38' },
	amber: { bg: '#FBEBD7', fg: '#D4823A' },
	plum: { bg: '#E8DEF0', fg: '#7A5A8C' },
};

interface Feature {
	id: string;
	tag: string;
	icon: string;
	tone: keyof typeof TONES;
	date: string;
	title: string;
	desc: string;
}

const WHATS_NEW: Feature[] = [
	{
		id: 'offline',
		tag: 'Operations',
		icon: 'Refresh',
		tone: 'moss',
		date: 'May 2026',
		title: 'Offline-first Demand Collection',
		desc: 'Mark collections at the center with no signal — entries queue on the device and sync automatically the moment you’re back online.',
	},
	{
		id: 'par',
		tag: 'Reports',
		icon: 'BarChart',
		tone: 'good',
		date: 'May 2026',
		title: 'PAR & Aging Heatmap',
		desc: 'A new branch-by-branch aging heatmap surfaces portfolio risk at a glance, with one-click drill-down to the loan level.',
	},
	{
		id: 'ekyc',
		tag: 'Onboarding',
		icon: 'Shield',
		tone: 'info',
		date: 'Apr 2026',
		title: 'Paperless Aadhaar e-KYC',
		desc: 'Verify and onboard members in seconds with built-in e-KYC — no scanned documents, no double data entry.',
	},
	{
		id: 'eod',
		tag: 'Finance',
		icon: 'Payments',
		tone: 'clay',
		date: 'Apr 2026',
		title: 'Smart Cash Reconciliation',
		desc: 'EOD closing now auto-matches cash and bank movements and flags only the differences that actually need you.',
	},
	{
		id: 'bulk',
		tag: 'Disbursement',
		icon: 'PlaylistAddCheck',
		tone: 'amber',
		date: 'Mar 2026',
		title: 'Bulk Disbursement Approvals',
		desc: 'Approve an entire center’s sanctioned loans in a single review — every decision recorded to the audit trail automatically.',
	},
	{
		id: 'lang',
		tag: 'Platform',
		icon: 'Translate',
		tone: 'plum',
		date: 'Mar 2026',
		title: 'Tamil & हिन्दी, end to end',
		desc: 'The whole interface — labels, reports and printed receipts — now speaks Tamil and Hindi alongside English.',
	},
];

// Rotate to the next announcement on each refresh, persisted across reloads.
const nextSpotlightIndex = (): number => {
	try {
		const prev = parseInt(localStorage.getItem('sn_whatsnew_idx') || '-1', 10);
		const i = (Number.isNaN(prev) ? -1 : prev + 1) % WHATS_NEW.length;
		localStorage.setItem('sn_whatsnew_idx', String(i));
		return i;
	} catch (e) {
		return 0;
	}
};

const DURATION = 2000;

const SquareNowSplash: React.FC = () => {
	const idxRef = useRef<number>(nextSpotlightIndex());
	const feat = WHATS_NEW[idxRef.current];
	const tone = TONES[feat.tone];

	const [pct, setPct] = useState(0);
	const [leaving, setLeaving] = useState(false);
	const [gone, setGone] = useState(false);
	const doneRef = useRef(false);

	const finish = () => {
		if (doneRef.current) return;
		doneRef.current = true;
		setLeaving(true);
		setTimeout(() => setGone(true), 440);
	};

	useEffect(() => {
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			setPct(100);
			const t = setTimeout(finish, 600);
			return () => clearTimeout(t);
		}
		const start = performance.now();
		let raf = 0;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / DURATION);
			const eased = 1 - Math.pow(1 - t, 2.2); // decelerate near the end
			setPct(Math.round(eased * 100));
			if (t < 1) raf = requestAnimationFrame(tick);
			else finish();
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (gone) return null;

	return (
		<div
			role='status'
			aria-label='Loading SquareNow'
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 99999,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 24px',
				background:
					'radial-gradient(125% 120% at 50% -10%, #234035 0%, #16261F 52%, #101B16 100%)',
				opacity: leaving ? 0 : 1,
				transition: 'opacity 400ms ease',
			}}>
			<style>{`
				@keyframes snw-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
				.snw-dot { animation: snw-pulse 1.6s ease-in-out infinite; }
				.snw-spot { transition: background-color .2s ease; }
				.snw-spot:hover { background: rgba(255,255,255,.085) !important; }
			`}</style>

			{/* texture + warm glow */}
			<div
				aria-hidden
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					opacity: 0.5,
					backgroundImage: 'radial-gradient(rgba(255,255,255,.10) 1px, transparent 1px)',
					backgroundSize: '18px 18px',
				}}
			/>
			<div
				aria-hidden
				style={{
					position: 'absolute',
					top: -96,
					right: -96,
					width: 420,
					height: 420,
					borderRadius: '50%',
					pointerEvents: 'none',
					background: 'radial-gradient(circle, rgba(212,130,58,0.18), transparent 65%)',
				}}
			/>

			{/* skip */}
			<button
				type='button'
				onClick={finish}
				style={{
					position: 'absolute',
					top: 24,
					right: 28,
					display: 'inline-flex',
					alignItems: 'center',
					gap: 6,
					border: 'none',
					background: 'transparent',
					cursor: 'pointer',
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: '0.02em',
					color: 'rgba(255,255,255,.6)',
				}}>
				Skip <Icon icon='ArrowForward' style={{ fontSize: 13 }} />
			</button>

			<div
				style={{
					position: 'relative',
					width: '100%',
					maxWidth: 460,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}>
				{/* logo */}
				<img
					src={logoSrc}
					alt='SquareNow'
					draggable={false}
					style={{
						height: 48,
						width: 'auto',
						userSelect: 'none',
						filter: 'drop-shadow(0 6px 22px rgba(0,0,0,0.35))',
					}}
				/>
				<div
					style={{
						marginTop: 12,
						fontSize: 10.5,
						textTransform: 'uppercase',
						letterSpacing: '0.34em',
						fontWeight: 700,
						color: 'rgba(255,255,255,.45)',
					}}>
					Loan Management Platform
				</div>

				{/* spotlight card */}
				<div
					className='snw-spot'
					style={{
						marginTop: 36,
						width: '100%',
						textAlign: 'left',
						borderRadius: 16,
						border: '1px solid rgba(255,255,255,.12)',
						background: 'rgba(255,255,255,.055)',
						backdropFilter: 'blur(6px)',
						padding: 20,
					}}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 14,
						}}>
						<span
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 6,
								height: 24,
								padding: '0 10px',
								borderRadius: 999,
								background: '#D4823A',
								color: '#fff',
								fontSize: 10.5,
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '0.04em',
							}}>
							<span
								className='snw-dot'
								style={{
									width: 6,
									height: 6,
									borderRadius: '50%',
									background: '#fff',
								}}
							/>
							New
						</span>
						<span
							style={{
								fontSize: 11,
								fontWeight: 600,
								color: 'rgba(255,255,255,.45)',
							}}>
							{feat.tag} · {feat.date}
						</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
						<span
							style={{
								flexShrink: 0,
								width: 44,
								height: 44,
								borderRadius: 12,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: tone.bg,
								color: tone.fg,
							}}>
							<Icon icon={feat.icon as any} style={{ fontSize: 21 }} />
						</span>
						<div style={{ minWidth: 0 }}>
							<div
								style={{
									fontFamily: DISPLAY,
									fontSize: 19,
									lineHeight: 1.3,
									fontWeight: 600,
									color: '#F4EFE7',
								}}>
								{feat.title}
							</div>
						</div>
					</div>
					<p
						style={{
							marginTop: 12,
							marginBottom: 0,
							fontSize: 13,
							lineHeight: 1.6,
							color: 'rgba(255,255,255,.65)',
						}}>
						{feat.desc}
					</p>
				</div>

				{/* progress */}
				<div style={{ marginTop: 32, width: '100%' }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: 8,
							fontSize: 11,
							fontWeight: 600,
							color: 'rgba(255,255,255,.45)',
						}}>
						<span>Preparing your workspace…</span>
						<span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
					</div>
					<div
						style={{
							height: 6,
							width: '100%',
							borderRadius: 999,
							background: 'rgba(255,255,255,.1)',
							overflow: 'hidden',
						}}>
						<div
							style={{
								height: '100%',
								width: `${pct}%`,
								borderRadius: 999,
								background: 'linear-gradient(90deg, #2D5F4F, #4F9E84 55%, #D4823A)',
								transition: 'width 150ms ease-out',
							}}
						/>
					</div>
				</div>
			</div>

			<div
				style={{
					position: 'absolute',
					bottom: 24,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontSize: 10.5,
					fontWeight: 500,
					color: 'rgba(255,255,255,.3)',
				}}>
				© 2026 SquareNow · Loan Management Platform · v1.0.0
			</div>
		</div>
	);
};

export default SquareNowSplash;
