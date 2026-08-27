/* eslint-disable react/react-in-jsx-scope */
import { RouteProps } from 'react-router-dom';
import { loginPages } from '../menu';
import DefaultAside from '../pages/_layout/_asides/DefaultAside';

const asides: RouteProps[] = [
	{ path: loginPages.login.path, element: null },
	{ path: loginPages.signUp.path, element: null },
	{ path: '*', element: <DefaultAside /> },
];

export default asides;
