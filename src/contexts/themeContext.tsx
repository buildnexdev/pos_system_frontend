import React, { createContext, useLayoutEffect, useState, useMemo, FC, ReactNode } from 'react';
import useDeviceScreen from '../hooks/useDeviceScreen';

export interface IThemeContextProps {
	asideStatus: boolean;
	darkModeStatus: boolean;
	fullScreenStatus: boolean;
	leftMenuStatus: boolean;
	mobileDesign: boolean;
	rightMenuStatus: boolean;
	rightPanel: boolean;
	activeMenu: string | null;
	activeNavigationMenu: string | null;
	setAsideStatus: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setDarkModeStatus: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setFullScreenStatus: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setLeftMenuStatus: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setRightMenuStatus: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setRightPanel: (value: ((prevState: boolean) => boolean) | boolean) => void;
	setActiveMenu: (value: string | null) => void;
	setActiveNavigationMenu: (value: string | null) => void;
	showLoading: boolean;
	setShowLoading: (value: boolean) => void;
}
const ThemeContext = createContext<IThemeContextProps>({} as IThemeContextProps);

interface IThemeContextProviderProps {
	children: ReactNode;
}
export const ThemeContextProvider: FC<IThemeContextProviderProps> = ({ children }) => {
	const deviceScreen = useDeviceScreen();
	// @ts-ignore
	const mobileDesign = deviceScreen?.width <= process.env.REACT_APP_MOBILE_BREAKPOINT_SIZE;

	const [darkModeStatus, setDarkModeStatus] = useState(
		localStorage.getItem('facit_darkModeStatus')
			? localStorage.getItem('facit_darkModeStatus') === 'true'
			: process.env.REACT_APP_DARK_MODE === 'true',
	);

	useLayoutEffect(() => {
		localStorage.setItem('facit_darkModeStatus', darkModeStatus.toString());
	}, [darkModeStatus]);

	const [fullScreenStatus, setFullScreenStatus] = useState(false);

	const [leftMenuStatus, setLeftMenuStatus] = useState(false);
	const [rightMenuStatus, setRightMenuStatus] = useState(false);
	const [asideStatus, setAsideStatus] = useState(
		localStorage.getItem('facit_asideStatus')
			? localStorage.getItem('facit_asideStatus') === 'true'
			: // @ts-ignore
				deviceScreen?.width >= process.env.REACT_APP_ASIDE_MINIMIZE_BREAKPOINT_SIZE,
	);
	useLayoutEffect(() => {
		localStorage.setItem('facit_asideStatus', asideStatus?.toString());
	}, [asideStatus]);

	const [rightPanel, setRightPanel] = useState(false);
	const [showLoading, setShowLoading] = useState(false);

	// Add active menu state
	const [activeMenu, setActiveMenu] = useState<string | null>(() => {
		const saved = localStorage.getItem('facit_activeMenu');
		return saved ? JSON.parse(saved) : null;
	});

	// Add active navigation menu state for managing which navigation menu is open
	const [activeNavigationMenu, setActiveNavigationMenu] = useState<string | null>(() => {
		const saved = localStorage.getItem('facit_activeNavigationMenu');
		return saved ? JSON.parse(saved) : null;
	});

	useLayoutEffect(() => {
		if (activeMenu === null) {
			localStorage.removeItem('facit_activeMenu');
		} else {
			localStorage.setItem('facit_activeMenu', JSON.stringify(activeMenu));
		}
	}, [activeMenu]);

	useLayoutEffect(() => {
		if (activeNavigationMenu === null) {
			localStorage.removeItem('facit_activeNavigationMenu');
		} else {
			localStorage.setItem('facit_activeNavigationMenu', JSON.stringify(activeNavigationMenu));
		}
	}, [activeNavigationMenu]);

	useLayoutEffect(() => {
		// @ts-ignore
		if (deviceScreen?.width >= process.env.REACT_APP_ASIDE_MINIMIZE_BREAKPOINT_SIZE) {
			if (localStorage.getItem('facit_asideStatus') === 'true') setAsideStatus(true);
			setLeftMenuStatus(false);
			setRightMenuStatus(false);
		}
		return () => {
			setAsideStatus(false);
		};
	}, [deviceScreen.width]);

	const values: IThemeContextProps = useMemo(
		() => ({
			mobileDesign,
			darkModeStatus,
			setDarkModeStatus,
			fullScreenStatus,
			setFullScreenStatus,
			asideStatus,
			setAsideStatus,
			leftMenuStatus,
			setLeftMenuStatus,
			rightMenuStatus,
			setRightMenuStatus,
			rightPanel,
			setRightPanel,
			activeMenu,
			setActiveMenu,
			activeNavigationMenu,
			setActiveNavigationMenu,
			setShowLoading,
			showLoading,
		}),
		[
			asideStatus,
			darkModeStatus,
			fullScreenStatus,
			leftMenuStatus,
			mobileDesign,
			rightMenuStatus,
			rightPanel,
			activeMenu,
			activeNavigationMenu,
			showLoading,
		],
	);

	return <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
