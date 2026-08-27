/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'react-jss';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ReactNotifications } from 'react-notifications-component';
import { useFullscreen } from 'react-use';
import { TourProvider } from '@reactour/tour';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ToastContainer } from 'react-toastify';
import ThemeContext from '../contexts/themeContext';
import Wrapper from '../layout/Wrapper/Wrapper';
import Portal from '../layout/Portal/Portal';
import useDarkMode from '../hooks/useDarkMode';
import COLORS from '../common/data/enumColors';
import { getOS } from '../helpers/helpers';
import steps, { styles } from '../steps';
import AsideRoutes from '../layout/Aside/AsideRoutes';
import { ToastCloseButton } from '../components/bootstrap/Toasts';
import SimpleAlert from '../components/common/SimpleAlert';
import AlertManager from '../redux/_common/alertManager';
import SquareNowSplash from '../components/SquareNowSplash';
import SquareNowScreenLock from '../components/SquareNowScreenLock';
import MotionLayer from '../components/MotionLayer';
import { WidgetsProvider } from '../contexts/widgetsContext';
import { selectUserCompanyDetailsData } from '../redux/login/login.selector';
import { loginPages } from '../menu';
import { userSignInLogOutStart } from '../redux/login/login.action';
import { useLocation } from 'react-router-dom';


const App = () => {
	getOS();

	dayjs.extend(localizedFormat);
	dayjs.extend(relativeTime);
	const location = useLocation();

	const navigate = useNavigate();
	const [showAlert, setShowAlert] = useState(false);
	const dispatch = useDispatch();
	// const loginRespsArr = useSelector(selectCurrentDecodedUser);

	const loginRespsArr = useSelector(selectUserCompanyDetailsData);
	// const handleOnClick = useCallback(() => navigate('/'), [navigate]);
	/**
	 * Dark Mode
	 */
	const { themeStatus, darkModeStatus } = useDarkMode();
	const loginPath = `/${loginPages.login.path.replace(/^\//, '')}`;
	const currentPath = location.pathname;
	const theme = {
		theme: themeStatus,
		primary: COLORS.PRIMARY.code,
		secondary: COLORS.SECONDARY.code,
		success: COLORS.SUCCESS.code,
		info: COLORS.INFO.code,
		warning: COLORS.WARNING.code,
		danger: COLORS.DANGER.code,
		dark: COLORS.DARK.code,
		light: COLORS.LIGHT.code,
	};

	useEffect(() => {
		if (loginRespsArr === null || loginRespsArr === undefined || loginRespsArr.length === 0) {
			navigate(`../${loginPages.login.path}`, { replace: true });
		}
		if (currentPath === loginPath) {
			// Clear storage
			localStorage.clear();
			dispatch(userSignInLogOutStart());
			if (currentPath !== loginPath) {
				navigate(loginPath);
			}
		}
	}, [navigate, currentPath]);

	// Set up AlertManager
	useEffect(() => {
		AlertManager.setShowAlertFunction(setShowAlert);
	}, []);

	// Restore body/html scroll before paint on every route change (fixes layout/scrollbar wrong until reload after visiting pages that lock scroll e.g. modals)
	useLayoutEffect(() => {
		document.body.classList.remove('modal-open');
		document.body.style.removeProperty('overflow');
		document.body.style.removeProperty('overflow-x');
		document.body.style.removeProperty('overflow-y');
		document.body.style.removeProperty('position');
		document.body.style.removeProperty('width');
		document.body.style.removeProperty('padding-right');
		document.documentElement.style.removeProperty('overflow');
		document.documentElement.style.removeProperty('overflow-x');
		document.documentElement.style.removeProperty('overflow-y');
	}, [location.pathname]);

	// Force layout recalculation for all pages on route change (fixes scrollbar overlap / extra margin until reload across the app)
	useEffect(() => {
		const id = requestAnimationFrame(() => {
			window.dispatchEvent(new Event('resize'));
		});
		return () => cancelAnimationFrame(id);
	}, [location.pathname]);

	useEffect(() => {
		if (darkModeStatus) {
			document.documentElement.setAttribute('theme', 'dark');
			document.documentElement.setAttribute('data-bs-theme', 'dark');
		}
		return () => {
			document.documentElement.removeAttribute('theme');
			document.documentElement.removeAttribute('data-bs-theme');
		};
	}, [darkModeStatus]);

	/**
	 * Full Screen
	 */
	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);
	const ref = useRef(null);
	useFullscreen(ref, fullScreenStatus, {
		onClose: () => setFullScreenStatus(false),
	});

	const ReactNotificationsComponent = ReactNotifications as unknown as React.ComponentType<any>;

	/**
	 * Modern Design
	 */
	useLayoutEffect(() => {
		// if (process.env.REACT_APP_MODERN_DESGIN === 'true') {
		// 	document.body.classList.add('modern-design');
		// } else {
		// 	document.body.classList.remove('modern-design');
		// }
		document.body.classList.remove('modern-design');
	});

	return (
		<ThemeProvider theme={theme}>
			{/*
			 * Skip-to-main-content link — first focusable element in the
			 * document so keyboard / screen-reader users can bypass the
			 * sidebar and topbar in one keystroke. The link only appears
			 * once it receives focus (see .skip-link in the LMS theme).
			 */}
			<a className='skip-link' href='#main-content'>
				Skip to main content
			</a>
			{/* App-wide card parallax/tilt + reveal motion (login-card feel
			    replicated across every page). Renders nothing; drives motion
			    on .card elements, re-runs per route, reduced-motion safe. */}
			<MotionLayer />
			<SquareNowSplash />
			{/* App-wide inactivity lock — fires after 30s of no user activity and
			    requires a Google Authenticator code to unlock. Suppressed on the
			    login screen. */}
			<SquareNowScreenLock />
			<TourProvider steps={steps} styles={styles} showNavigation={false} showBadge={false}>
				<WidgetsProvider>
					<div
						ref={ref}
						className='app'
						style={{
							backgroundColor: fullScreenStatus ? 'var(--bs-body-bg)' : undefined,
							zIndex: fullScreenStatus ? 1 : undefined,
							overflow: fullScreenStatus ? 'scroll' : undefined,
						}}>
						<AsideRoutes />
						<Wrapper />
					</div>
				</WidgetsProvider>
				<Portal id='portal-notification'>
					<ReactNotificationsComponent />
				</Portal>
				<ToastContainer closeButton={ToastCloseButton} toastClassName='toast show' />

				{/* Simple Alert Modal for 401 errors */}
				<SimpleAlert show={showAlert} onClose={() => setShowAlert(false)} />
			</TourProvider>
		</ThemeProvider>
	);
};

export default App;
