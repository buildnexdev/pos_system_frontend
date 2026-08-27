// =============================================================================
// SquareNowScreenLock — app-wide inactivity lock + Google Authenticator (TOTP)
// unlock. After SCREEN_LOCK_TIMEOUT_MS of no user activity the entire app is
// covered by a full-viewport overlay. To unlock, the user must enter the 6-digit
// code from their authenticator app.
//
// If the user has NOT yet enrolled (loginData.secrateAuth / SecrateAuth is
// empty), the lock screen shows an enrollment step first: dispatch
// generateSecreteAuthKeyStart to mint a per-user secret + QR (returned as a
// base64 PNG by the backend), the user scans with Google Authenticator, types
// the first code, and we validate it via the same checkGoogleAuthenticationStart
// endpoint the rest of the app uses.
//
// Mounted globally in App.tsx so it runs everywhere except the login route.
// =============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
	checkGoogleAuthenticationStart,
	checkGoogleAuthenticationResponseResetStart,
} from '../redux/general/general.action';
import { selectCheckAuthenticationResp } from '../redux/general/general.selector';
import { getLoginObjDetails } from '../redux/login/login.selector';
import {
	generateSecreteAuthKeyStart,
	generateSecreteAuthKeyResponseResetStart,
} from '../redux/profile/profile.action';
import {
	selectGenerateSecreteAuthKeyResponse,
	selectGenerateSecreteAuthKeyData,
} from '../redux/profile/profile.selector';
import { userSignInLogOutStart } from '../redux/login/login.action';
import logoSrc from '../assets/logos/SQlogo.png';

// 5 minutes of inactivity — was 30s in the original spec, but the LMS has many
// reading-heavy surfaces (customer dossiers, EOD review, design iframes) where
// a 30s lock fires while the user is genuinely working.
const SCREEN_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

/** 6-box auto-advancing TOTP input. */
const TotpBoxes: React.FC<{
	value: string;
	onChange: (v: string) => void;
	error?: boolean;
	dark?: boolean;
	autoFocus?: boolean;
	onComplete?: (v: string) => void;
}> = ({ value, onChange, error, dark, autoFocus = true, onComplete }) => {
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	useEffect(() => {
		if (autoFocus) setTimeout(() => refs.current[0]?.focus(), 60);
	}, [autoFocus]);
	useEffect(() => {
		if (error) {
			onChange('');
			setTimeout(() => refs.current[0]?.focus(), 60);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);
	const digits = (value + '      ').slice(0, 6).split('');
	const set = (i: number, raw: string) => {
		const v = raw.replace(/[^0-9]/g, '').slice(-1);
		const arr = (value + '      ').slice(0, 6).split('');
		arr[i] = v;
		const next = arr.join('').replace(/ /g, '');
		onChange(next);
		if (v && i < 5) refs.current[i + 1]?.focus();
		if (next.length === 6 && onComplete) onComplete(next);
	};
	const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus();
		if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
		if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
	};
	const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const t = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 6);
		if (!t) return;
		e.preventDefault();
		onChange(t);
		refs.current[Math.min(t.length, 5)]?.focus();
		if (t.length === 6 && onComplete) onComplete(t);
	};
	const box =
		(dark
			? 'bg-white/10 text-white border-white/20 focus:border-[#8CCBAC] focus:ring-2 focus:ring-[#8CCBAC]/30'
			: 'bg-white text-ink border-line-strong focus:border-moss focus:ring-2 focus:ring-moss/20') +
		(error ? (dark ? ' !border-[#F0A89E] bg-[#B33A2E]/30' : ' !border-bad bg-bad-soft') : '');
	return (
		<div className={'d-flex justify-content-center align-items-center gap-2 ' + (error ? 'sn-shake' : '')}>
			{digits.map((v, i) => (
				<React.Fragment key={i}>
					<input
						ref={(el) => {
							refs.current[i] = el;
						}}
						// Test report #16: mask each entered digit as a dot for visual
						// feedback without a password field (keeps the numeric keypad).
						// The real digit stays in `value`/`code` state; only the box's
						// displayed character is masked. Typing into an empty box still
						// yields the digit via onChange (set() strips non-digits), and
						// Backspace navigation uses `digits[]` (the true code), not this.
						value={v.trim() ? '•' : ''}
						onChange={(e) => set(i, e.target.value)}
						onKeyDown={(e) => onKey(i, e)}
						onPaste={onPaste}
						inputMode='numeric'
						maxLength={1}
						aria-label={`Digit ${i + 1}`}
						style={{
							width: 48,
							height: 56,
							textAlign: 'center',
							fontSize: 24,
							fontFamily: '"JetBrains Mono", ui-monospace, monospace',
							fontWeight: 700,
							borderRadius: 12,
							borderWidth: 2,
							outline: 'none',
							transition: 'border-color .15s ease, box-shadow .15s ease',
						}}
						className={box}
					/>
					{i === 2 && (
						<span
							style={{ fontWeight: 700, opacity: dark ? 0.3 : 0.4, color: dark ? '#fff' : '#1A1814' }}>
							·
						</span>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

const SquareNowScreenLock: React.FC = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const loginData: any = useSelector(getLoginObjDetails);
	const authResp: any = useSelector(selectCheckAuthenticationResp);
	const enrolResp: any = useSelector(selectGenerateSecreteAuthKeyResponse);
	const enrolArr: any[] = useSelector(selectGenerateSecreteAuthKeyData) || [];

	// We honour either SecrateAuth (URL) or secrateAuth (lowercase). Some logins
	// surface it as the URL; others surface the raw secret. Both mean "enrolled".
	const initialSecrate: string =
		String(loginData?.SecrateAuth ?? loginData?.secrateAuth ?? loginData?.secrateAuthURL ?? '');
	const [secrateAuth, setSecrateAuth] = useState<string>(initialSecrate);
	useEffect(() => {
		if (initialSecrate) setSecrateAuth(initialSecrate);
	}, [initialSecrate]);

	// Test report #41: the lock used to be plain useState(false), so a browser
	// refresh (or a new tab) reset it to false and dropped the user straight
	// back into the app WITHOUT re-entering the TOTP code — a full bypass of the
	// screen lock. Persist the locked flag so a reload keeps the app locked.
	// sessionStorage (not localStorage) so it clears when the tab is closed and
	// on sign-out; it survives F5/reload, which is exactly the bypass window.
	const LOCK_STORAGE_KEY = 'sn_screen_locked';
	const [locked, setLocked] = useState<boolean>(() => {
		try {
			return sessionStorage.getItem(LOCK_STORAGE_KEY) === '1';
		} catch (e) {
			return false;
		}
	});
	// Mirror the locked flag into sessionStorage on every change.
	useEffect(() => {
		try {
			if (locked) sessionStorage.setItem(LOCK_STORAGE_KEY, '1');
			else sessionStorage.removeItem(LOCK_STORAGE_KEY);
		} catch (e) {
			/* ignore */
		}
	}, [locked]);
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState(false);
	const [errCount, setErrCount] = useState(0);
	const [now, setNow] = useState(() => new Date());
	const [enrollMode, setEnrollMode] = useState(false);
	const [enrollQr, setEnrollQr] = useState<string>('');
	const enrollDispatchedRef = useRef(false);
	const lastRespRef = useRef<any>(null);
	const lastEnrolRespRef = useRef<any>(null);

	const path = (location.pathname || '').toLowerCase();
	const isLoginPath = path.includes('/login') || path.includes('/sign-up') || path === '/';
	const isSignedIn = !!loginData?.companyID && !!loginData?.userID;
	const lockEnabled = isSignedIn && !isLoginPath;

	// A persisted lock must never strand the login page: if we restored
	// locked=1 but the session is gone / we're on an auth route, release it.
	useEffect(() => {
		if (locked && !lockEnabled) setLocked(false);
	}, [locked, lockEnabled]);

	// Inactivity tracking — reset the timer on any user activity. Stop tracking
	// while already locked (we don't want a typo on the lock screen to extend
	// inactivity counters for the underlying app).
	useEffect(() => {
		if (!lockEnabled) return;
		if (locked) return;
		const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
		let timer: any = null;
		const arm = () => {
			if (timer) window.clearTimeout(timer);
			timer = window.setTimeout(() => setLocked(true), SCREEN_LOCK_TIMEOUT_MS);
		};
		const onActivity = () => arm();
		events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
		// iframe activity bridge — events inside <iframe> (the sn-design hosted
		// pages) don't bubble to the parent window. The iframes already postMessage
		// for the live-data bridge (sn-search-member, sn-upload-photo, sn-bootstrap…);
		// any such message implies the user is interacting, so reset the timer too.
		const onMessage = (e: MessageEvent) => {
			const t = e?.data?.type ?? e?.data;
			if (typeof t === 'string' && t.startsWith('sn-')) arm();
		};
		window.addEventListener('message', onMessage);
		const onLockNow = () => setLocked(true);
		window.addEventListener('sn-lock', onLockNow);
		arm();
		return () => {
			if (timer) window.clearTimeout(timer);
			events.forEach((e) => window.removeEventListener(e, onActivity));
			window.removeEventListener('message', onMessage);
			window.removeEventListener('sn-lock', onLockNow);
		};
	}, [lockEnabled, locked]);

	// Clock ticking while locked.
	useEffect(() => {
		if (!locked) return;
		setErrCount(0);
		const t = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(t);
	}, [locked]);

	// Watch the TOTP verify response.
	useEffect(() => {
		if (!authResp) return;
		if (lastRespRef.current === authResp) return;
		lastRespRef.current = authResp;
		const status = String(authResp?.statusCode ?? '');
		if (status === '01') {
			// Verified — unlock.
			setLocked(false);
			setEnrollMode(false);
			setCode('');
			setBusy(false);
		} else {
			setErrCount((c) => c + 1);
			setBusy(false);
		}
		dispatch(checkGoogleAuthenticationResponseResetStart());
	}, [authResp, dispatch]);

	// Watch the enrollment response — pick up the QR image (base64 PNG).
	useEffect(() => {
		if (!enrolResp) return;
		if (lastEnrolRespRef.current === enrolResp) return;
		lastEnrolRespRef.current = enrolResp;
		const status = String(enrolResp?.statusCode ?? '');
		if (status === '01' && Array.isArray(enrolArr) && enrolArr.length > 0) {
			const row = enrolArr[0] || {};
			const qr = String(row.SecrateURL ?? row.secrateURL ?? '');
			if (qr) {
				setEnrollQr(qr);
				// The new secret URL also becomes the verifier seed — keep it.
				const newSecrate = String(row.SecrateAuth ?? row.secrateAuth ?? row.secrateAuthURL ?? '');
				if (newSecrate) setSecrateAuth(newSecrate);
			}
		}
		dispatch(generateSecreteAuthKeyResponseResetStart());
	}, [enrolResp, enrolArr, dispatch]);

	// When the lock opens and the user has no secret yet, kick off enrollment.
	useEffect(() => {
		if (!locked) return;
		if (secrateAuth) return; // already enrolled
		if (enrollDispatchedRef.current) return;
		if (!loginData?.userID || !loginData?.companyID) return;
		enrollDispatchedRef.current = true;
		setEnrollMode(true);
		dispatch(
			generateSecreteAuthKeyStart({
				userID: loginData.userID,
				companyID: loginData.companyID,
				userPhoneNumber: loginData.userPhoneNumber || loginData.userPhone || '',
				databaseName: loginData.databaseName || 'General',
			} as any),
		);
	}, [locked, secrateAuth, loginData, dispatch]);

	const submit = (typed?: string) => {
		const c = String(typed ?? code).trim();
		if (c.length !== 6 || !/^\d{6}$/.test(c)) return;
		setBusy(true);
		dispatch(
			checkGoogleAuthenticationStart({
				AuthenticationCode: c,
				SecrateAuth: secrateAuth,
			} as any),
		);
	};

	const signOut = () => {
		try {
			localStorage.clear();
			sessionStorage.removeItem(LOCK_STORAGE_KEY);
		} catch (e) {
			/* ignore */
		}
		dispatch(userSignInLogOutStart());
		setLocked(false);
		window.location.href = '/login';
	};

	if (!locked) return null;

	const hh = String(now.getHours()).padStart(2, '0');
	const mm = String(now.getMinutes()).padStart(2, '0');
	const dateStr = now.toLocaleDateString('en-IN', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});
	const userName = String(loginData?.userName || loginData?.UserName || 'User');

	return (
		<>
			<style>{`
				@keyframes sn-shake { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)} 30%,70%{transform:translateX(-6px)} 40%,60%{transform:translateX(6px)} 50%{transform:translateX(-4px)} }
				.sn-shake { animation: sn-shake .45s ease both; }
				@keyframes sn-fade { from { opacity: 0; } to { opacity: 1; } }
				.sn-lock-overlay { animation: sn-fade .25s ease-out both; }
			`}</style>
			<div
				className='sn-lock-overlay'
				style={{
					position: 'fixed',
					inset: 0,
					zIndex: 100000,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '24px',
					background:
						'radial-gradient(125% 120% at 50% -10%, #234035 0%, #16261F 52%, #101B16 100%)',
					backdropFilter: 'blur(16px)',
				}}>
				{/* Logo + clock */}
				<img
					src={logoSrc}
					alt='SquareNow'
					draggable={false}
					style={{ height: 36, opacity: 0.85, marginBottom: 24 }}
				/>
				<div style={{ textAlign: 'center', marginBottom: 28 }}>
					<div
						style={{
							fontFamily: '"Fraunces", Georgia, serif',
							fontSize: 64,
							lineHeight: 1,
							color: '#fff',
							fontWeight: 600,
							letterSpacing: '-1px',
						}}>
						{hh}:{mm}
					</div>
					<div style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, marginTop: 6 }}>{dateStr}</div>
				</div>

				{/* Main card */}
				<div
					style={{
						width: '100%',
						maxWidth: 460,
						background: 'rgba(27,42,35,.92)',
						border: '1px solid rgba(255,255,255,.12)',
						borderRadius: 24,
						padding: 28,
						boxShadow: '0 30px 60px rgba(0,0,0,.45)',
					}}>
					{/* Heading */}
					<div style={{ textAlign: 'center', marginBottom: 24 }}>
						<span
							style={{
								display: 'inline-flex',
								width: 56,
								height: 56,
								borderRadius: 16,
								background: '#2D5F4F',
								color: '#fff',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 12,
								boxShadow: '0 10px 28px rgba(45,95,79,.5)',
							}}>
							<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><rect x='4' y='11' width='16' height='10' rx='2'/><path d='M8 11V8a4 4 0 018 0v3'/></svg>
						</span>
						<div
							style={{
								fontFamily: '"Fraunces", Georgia, serif',
								fontSize: 24,
								fontWeight: 600,
								color: '#fff',
							}}>
							{enrollMode ? 'Set up Authenticator' : 'Screen locked'}
						</div>
						<div style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, marginTop: 6 }}>
							{enrollMode
								? 'Scan the QR with Google Authenticator (or any TOTP app), then enter the 6-digit code to finish setup.'
								: 'Locked after 5 minutes of inactivity. Enter the 6-digit code from your authenticator app to resume.'}
						</div>
					</div>

					{/* Enrollment — QR */}
					{enrollMode && (
						<div style={{ marginBottom: 18, textAlign: 'center' }}>
							{enrollQr ? (
								<div
									style={{
										display: 'inline-block',
										padding: 12,
										background: '#fff',
										borderRadius: 16,
										border: '1px solid rgba(255,255,255,.2)',
									}}>
									<img
										src={enrollQr}
										alt='Scan with your authenticator app'
										style={{ width: 192, height: 192, display: 'block' }}
									/>
								</div>
							) : (
								<div
									style={{
										color: 'rgba(255,255,255,.5)',
										fontSize: 13,
										padding: '24px 0',
									}}>
									Generating your secret…
								</div>
							)}
							<div
								style={{
									color: 'rgba(255,255,255,.45)',
									fontSize: 11,
									marginTop: 8,
									fontFamily: '"JetBrains Mono", ui-monospace, monospace',
								}}>
								Use Google Authenticator · 6-digit code
							</div>
						</div>
					)}

					{/* Code */}
					<div style={{ marginTop: 4 }}>
						<div
							style={{
								fontSize: 11,
								textTransform: 'uppercase',
								letterSpacing: '.06em',
								fontWeight: 700,
								color: 'rgba(255,255,255,.45)',
								marginBottom: 8,
							}}>
							Authenticator code
						</div>
						<TotpBoxes
							value={code}
							onChange={(v) => {
								setCode(v);
								// auto-submit when 6 digits typed
								if (v.length === 6 && !busy) submit(v);
							}}
							onComplete={(v) => { if (!busy) submit(v); }}
							error={errCount > 0}
							dark
						/>
						{errCount > 0 && (
							<div
								style={{
									color: '#F0A89E',
									fontSize: 12,
									marginTop: 10,
									textAlign: 'center',
								}}>
								⚠ Incorrect code — check your authenticator and try again.
							</div>
						)}
						{busy && (
							<div
								style={{
									color: 'rgba(255,255,255,.55)',
									fontSize: 12,
									marginTop: 10,
									textAlign: 'center',
								}}>
								Verifying…
							</div>
						)}
					</div>

					{/* User chip + sign out */}
					<div
						style={{
							marginTop: 22,
							paddingTop: 16,
							borderTop: '1px solid rgba(255,255,255,.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 12,
						}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span
								style={{
									width: 32,
									height: 32,
									borderRadius: '50%',
									background: '#D4823A',
									color: '#fff',
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 12,
									fontWeight: 700,
								}}>
								{userName
									.split(' ')
									.map((s) => s[0])
									.slice(0, 2)
									.join('')
									.toUpperCase() || 'U'}
							</span>
							<div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{userName}</div>
						</div>
						<button
							onClick={signOut}
							style={{
								background: 'transparent',
								border: 0,
								color: 'rgba(255,255,255,.65)',
								fontSize: 13,
								fontWeight: 600,
								cursor: 'pointer',
								padding: '4px 8px',
							}}>
							Sign out →
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default SquareNowScreenLock;
