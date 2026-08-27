// =============================================================================
// MotionLayer — app-wide card motion controller (chat-4 design)
// -----------------------------------------------------------------------------
// Replicates the login card's parallax feel across every page WITHOUT editing
// any page markup: it auto-discovers `.card` elements inside the main content
// area and gives them
//   1. a staggered rise/fade "reveal" cascade whenever a route (or a drawer /
//      modal / tab panel) mounts, and
//   2. a pointer-driven 3D tilt + moving glare on hover.
//
// Design parity with the prototype's MotionLayer, adapted to:
//   - target the real Bootstrap `.card` class instead of data-* attributes,
//   - exclude cards that wrap a Leaflet map, a chart, or a data table (tilting
//     those reads as broken),
//   - be fail-safe: a hard timeout force-reveals everything so a card can never
//     get stuck invisible (lazy routes, Suspense, throttled tabs, etc.),
//   - fully respect prefers-reduced-motion.
//
// Mounted once near the top of the app (App.tsx). Re-runs on every route change.
// =============================================================================
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TILT_EXCLUDE = '.leaflet-container, .apexcharts-canvas, table, .ck-editor';
const REVEAL_STAGGER_MS = 45;
const REVEAL_STAGGER_CAP = 9;
const FORCE_REVEAL_AFTER_MS = 1400; // backstop: nothing stays hidden past this

const MotionLayer = (): null => {
	const location = useLocation();

	useEffect(() => {
		if (typeof document === 'undefined') return undefined;

		const scope: HTMLElement | null =
			document.getElementById('main-content') ||
			document.querySelector('main.content') ||
			document.querySelector('main');
		if (!scope) return undefined;

		const reduce =
			!!window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let revealTimer: number | null = null;
		let forceTimer: number | null = null;
		let mo: MutationObserver | null = null;
		let moTimer: number | null = null;
		const pending = new Set<HTMLElement>();

		const isTiltEligible = (card: HTMLElement): boolean =>
			!card.matches(TILT_EXCLUDE) && !card.querySelector(TILT_EXCLUDE);

		// Tag a card with the motion classes (+ inject the glare span once).
		const tag = (card: HTMLElement): void => {
			if (!card.classList.contains('sn-reveal')) {
				card.classList.add('sn-reveal');
			}
			if (isTiltEligible(card)) {
				if (!card.classList.contains('sn-tilt')) card.classList.add('sn-tilt');
				if (!card.querySelector(':scope > .sn-glare')) {
					const g = document.createElement('span');
					g.className = 'sn-glare';
					g.setAttribute('aria-hidden', 'true');
					card.appendChild(g);
				}
			}
		};

		const revealNow = (cards: HTMLElement[]): void => {
			cards.forEach((c) => {
				c.style.transitionDelay = '';
				c.classList.add('sn-reveal-in');
			});
		};

		// ---- Initial reveal cascade for the cards present right now ----
		const initial = Array.from(
			scope.querySelectorAll<HTMLElement>('.card'),
		).filter((c) => !c.closest('.sn-no-motion'));
		initial.forEach(tag);

		if (reduce) {
			revealNow(initial);
		} else {
			// commit the hidden start state before the cascade
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			scope.offsetHeight;
			revealTimer = window.setTimeout(() => {
				initial.forEach((c, i) => {
					c.style.transitionDelay =
						Math.min(i, REVEAL_STAGGER_CAP) * REVEAL_STAGGER_MS + 'ms';
					c.classList.add('sn-reveal-in');
				});
			}, 30);

			// ---- Reveal dynamically-added cards (drawers / modals / tabs) ----
			const flush = (): void => {
				moTimer = null;
				const els = Array.from(pending).filter(
					(el) => el.isConnected && !el.classList.contains('sn-reveal-in'),
				);
				pending.clear();
				els.forEach((el, i) => {
					el.style.transitionDelay = Math.min(i, 8) * 40 + 'ms';
					el.classList.add('sn-reveal-in');
				});
			};
			const queue = (el: HTMLElement): void => {
				tag(el);
				pending.add(el);
				if (moTimer === null) moTimer = window.setTimeout(flush, 20);
			};
			mo = new MutationObserver((muts) => {
				for (const m of muts) {
					m.addedNodes.forEach((n) => {
						if (!(n instanceof HTMLElement)) return;
						if (n.matches('.card')) queue(n);
						n.querySelectorAll<HTMLElement>('.card').forEach(queue);
					});
				}
			});
			mo.observe(scope, { childList: true, subtree: true });

			// ---- Fail-safe: force everything visible after a short window ----
			forceTimer = window.setTimeout(() => {
				scope
					.querySelectorAll<HTMLElement>('.card.sn-reveal:not(.sn-reveal-in)')
					.forEach((c) => c.classList.add('sn-reveal-in'));
			}, FORCE_REVEAL_AFTER_MS);
		}

		// ---- Pointer tilt + glare (purely additive — cannot break layout) ----
		let active: HTMLElement | null = null;
		let raf: number | null = null;
		let next: { el: HTMLElement | null; x: number; y: number } | null = null;

		const clear = (el: HTMLElement | null): void => {
			if (!el) return;
			el.classList.remove('sn-tilt-active');
			el.style.removeProperty('--mx');
			el.style.removeProperty('--my');
			el.style.removeProperty('--gx');
			el.style.removeProperty('--gy');
		};
		const apply = (): void => {
			raf = null;
			const p = next;
			if (!p) return;
			const el = p.el;
			if (active && active !== el) clear(active);
			if (!el) {
				active = null;
				return;
			}
			const r = el.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) return;
			const fx = (p.x - r.left) / r.width;
			const fy = (p.y - r.top) / r.height;
			el.style.setProperty('--mx', (fx * 2 - 1).toFixed(3));
			el.style.setProperty('--my', (fy * 2 - 1).toFixed(3));
			el.style.setProperty('--gx', (fx * 100).toFixed(1) + '%');
			el.style.setProperty('--gy', (fy * 100).toFixed(1) + '%');
			el.classList.add('sn-tilt-active');
			active = el;
		};
		const onMove = (e: MouseEvent): void => {
			const target = e.target as HTMLElement | null;
			const card = target ? target.closest<HTMLElement>('.card.sn-tilt') : null;
			next = { el: card, x: e.clientX, y: e.clientY };
			if (raf === null) raf = window.requestAnimationFrame(apply);
		};
		const onLeave = (): void => {
			clear(active);
			active = null;
		};

		if (!reduce) {
			document.addEventListener('mousemove', onMove, { passive: true });
			document.addEventListener('mouseleave', onLeave);
		}

		return () => {
			if (revealTimer !== null) clearTimeout(revealTimer);
			if (forceTimer !== null) clearTimeout(forceTimer);
			if (moTimer !== null) clearTimeout(moTimer);
			if (mo) mo.disconnect();
			if (raf !== null) cancelAnimationFrame(raf);
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseleave', onLeave);
			clear(active);
		};
		// Re-run the whole controller on every route change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	return null;
};

export default MotionLayer;
