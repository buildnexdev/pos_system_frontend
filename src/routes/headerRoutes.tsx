import React from 'react';
import { RouteProps } from 'react-router-dom';
// import { loginPages } from '../menu';

import ProfilePageHeader from '../_layout/_headers/ProfilePageHeader';

const headers: RouteProps[] = [
	// { path: loginPages.dashboard.path, element: <DashboardHeader /> },
	{
		// path: demoPagesMenu.crm.subMenu.customersList.path,
		element: <ProfilePageHeader />,
	},
	{
		path: `*`,
	},
];

export default headers;
