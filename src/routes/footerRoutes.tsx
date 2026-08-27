import React from 'react';
import { RouteProps } from 'react-router-dom';
import { loginPages } from '../menu';
import DefaultFooter from '../pages/_layout/_footers/DefaultFooter';

const footers: RouteProps[] = [
	{ path: loginPages.login.path, element: null },
	{ path: '*', element: <DefaultFooter /> },
];

export default footers;
