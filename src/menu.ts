

/**************** MASTER PAGE MENU START *********************** */
export const masterPageMenu = {
	masterPages: {
		id: 'masterPages',
		text: 'Master',
		path: 'master-pages',
		icon: 'AutoStories',
		subMenu: {
			rdbranchPage: {
				id: 'rdbranchPage',
				text: 'RD Branch',
				path: 'master-pages/rdbranch',
				icon: 'AddBusiness',
			},
			rdZone: {
				id: 'rdZone',
				text: 'RD Zone',
				path: '/master-pages/rdZone',
				icon: 'LocalActivity',
			},
			rdAgent:{
				id:'rdAgent',
				text:'RD Agent',
				path:'/master-pages/rdAgent',
				icon:'LocalActivity',
			}
		},
	},
};
/**************** MASTER PAGE MENU END *********************** */

/**************** OPEARTION PAGE MENU START *********************** */
export const operationsPageMenu = {
	operationPages: {
		id: 'operations',
		text: 'Operations',
		path: '/operations',
		icon: 'Inbox',
		isView: true,
		subMenu: {
			rdAgentBusiness: {
				id: 'rdAgentBusiness',
				text: 'RD Agent Business',
				path: '/operations/rdAgentBusiness',
				icon: 'DoneAll',
			},
		},
	},
};
/**************** OPEARTION PAGE MENU END *********************** */

/**************** REPORT PAGE MENU START *********************** */
export const reportsPageMenu = {
	reportsPages: {
		id: 'reports',
		text: 'Reports',
		path: '/reports',
		icon: 'ReportProblem',
		isView: true,
		subMenu: {
			rdAgentBusinessReport: {
				id: 'rdAgentBusinessReport',
				text: 'RD Agent Business Report',
				path: '/reports/rdAgentBusinessReport',
				icon: 'ReportProblem',
			},
		},	
    },
};
/**************** REPORT PAGE MENU END *********************** */

/**************** PROFILE PAGE MENU START *********************** */
export const profilePageMenu = {
	profile: {
		id: 'profile',
		text: 'Profile',
		path: 'profile/profilePage',
		icon: 'profile',
	},
};
/**************** PROFILE PAGE MENU END *********************** */

/**************** LOGIN PAGE MENU START *********************** */
export const loginPages = {
	login: {
		id: 'login',
		text: 'Login',
		path: 'auth-pages/login',
		icon: 'Login',
		hide: true,
	},
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		hide: true,
	},
	signUp: {
		id: 'signUp',
		text: 'Sign Up',
		path: 'auth-pages/sign-up',
		icon: 'PersonAdd',
		hide: true,
	},
	page404: {
		id: 'Page404',
		text: '404 Page',
		path: 'auth-pages/404',
		icon: 'ReportGmailerrorred',
		hide: true,
	},
};
/**************** LOGIN PAGE MENU END *********************** */

