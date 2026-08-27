import React, { lazy } from 'react';
import { RouteProps } from 'react-router-dom';
import {
	loginPages,
	
} from '../menu';
import Login from '../pages/Auth/Login';

const LANDING = {
	DASHBOARD: lazy(() => import('../pages/Dashboard/Dashboard')),
	
};

const AUTH = {
	PAGE_404: lazy(() => import('../pages/Auth/Page404')),
};


const MASTER = {
	BRANCH_PAGE: lazy(() => import('../pages/Branch/BranchList')),
	
};




const presentation: RouteProps[] = [
	/**
	 * Landing
	 */
	{
		// Primary dashboard — the LMS dashboard is now what loads at "/" (post-login
		// landing + the Dashboard tab). The classic dashboard stays at /dashboard-classic.
		path: loginPages.dashboard.path,
		element: <LANDING.DASHBOARD />,
	},
	{
		// Previous (classic) dashboard, kept reachable for reference/fallback.
		path: 'dashboard-classic',
		element: <LANDING.DASHBOARD />,
	},
	/** ************************************************** */

	/** ********************* LOGIN START ***************************** */
	{
		path: loginPages.page404.path,
		element: <AUTH.PAGE_404 />,
	},
	{
		path: loginPages.login.path,
		element: <Login />,
	},
	// {
	// 	path: loginPages.signUp.path,
	// 	element: <Login isSignUp />,
	// },
	/** ********************* LOGIN END ***************************** */

	/**
	 * App > CRM
	 */
	// {
	// 	path: demoPagesMenu.crm.subMenu.customersList.path,
	// 	element: <APP.CRM.CUSTOMERS />,
	// },
	/**
	 * END - App
	 */

	/** ************************************************** */




	/** ********************* MASTER START ***************************** */

	{
		path: '/master-pages/branchClassic',
		element: <MASTER.BRANCH_PAGE />,
	},
];
	
const contents = [...presentation];

export default contents;
