// Version : 0.0.1
// Author : Vignesh
// LastEdit : Vignesh
// Last ADD : Show User Control Access tab only to the ADMIN - Level100 Access
// MODFIED DATE : 31-07-2025

/* eslint-disable react/react-in-jsx-scope */
import { Fragment, ReactNode, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../../layout/Navigation/Navigation';
import User from '../../../layout/User/User';
import ThemeContext from '../../../contexts/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import Search from '../../../components/Search';
import {
	financePageMenu,
	masterPageMenu,
	operationsPageMenu,
	userControlAccessPageMenu,
	reportsPageMenu,
	companyPageMenu,
	companyCreationRequestsMenu,
	passwordResetRequestsMenu,
	commonUpdatePageMenu,
	schemaSyncPageMenu,
	dashboardPagesMenu,
	// autoLoanPageMenu,
} from '../../../menu';
import { getLoginObjDetails } from '../../../redux/login/login.selector';
import {
	applyMenuAccessControl,
	buildMenuAccessMap,
	cloneMenuDefinition,
} from '../../../utils/menuAccess';
import { useLoanTypeToggles } from '../../../utils/loanTypeToggles';

const hasMenuItems = (menu: Record<string, unknown> | undefined): boolean =>
	Boolean(menu && Object.keys(menu).length > 0);

const DefaultAside = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const loginData = useSelector(getLoginObjDetails);
	console.log('sds', loginData);

	const accessMap = useMemo(
		() => buildMenuAccessMap(loginData.userAccessData),
		[loginData.userAccessData],
	);

	// Client-only loan-type toggles (Profile → Business). When a loan type is
	// switched off we OR the existing backend-flag guard with this toggle so
	// the item hides even if the backend flag says the tenant has that product.
	const [loanTypeToggles] = useLoanTypeToggles(loginData.companyID, {
		isAutoLoan: loginData.isAutoLoan,
		isGoldLoanAvailed: loginData.isGoldLoanAvailed,
		isIndividualLoanNeeded: loginData.isIndividualLoanNeeded,
	});

	// The company / common-update menu blocks are rendered only for SuperAdmin, so they
	// should not be filtered by per-user access data (these pages won't exist in that
	// dataset and would otherwise be hidden). SuperAdmin sees all of these pages.
	const companyMenu = useMemo(() => cloneMenuDefinition(companyPageMenu), []);
	const companyRequestsMenu = useMemo(() => cloneMenuDefinition(companyCreationRequestsMenu), []);
	const passwordResetRequestsMenuClone = useMemo(
		() => cloneMenuDefinition(passwordResetRequestsMenu),
		[],
	);

	const commonUpdateMenu = useMemo(() => cloneMenuDefinition(commonUpdatePageMenu), []);

	const schemaSyncMenu = useMemo(() => cloneMenuDefinition(schemaSyncPageMenu), []);

	const userAccessMenuPrePared = useMemo(() => {
		const menuClone = cloneMenuDefinition(userControlAccessPageMenu);
		const subMenu = menuClone.userControlAccessPages?.subMenu as
			| Record<string, any>
			| undefined;

		if (subMenu?.workFlowManagement) {
			subMenu.workFlowManagement.hide = loginData.isWorkFlowNeeded != '1';
		}
		return menuClone;
	}, [loginData.isWorkFlowNeeded]);

	const userControlMenu = useMemo(
		() => applyMenuAccessControl(userAccessMenuPrePared, accessMap),
		[userAccessMenuPrePared, accessMap],
	);

	const mastersMenuPrepared = useMemo(() => {
		const menuClone = cloneMenuDefinition(masterPageMenu);
		const subMenu = menuClone.masterPages?.subMenu as Record<string, any> | undefined;

		if (subMenu?.dealer) {
			subMenu.dealer.hide = loginData.isAutoLoan != '1' || !loanTypeToggles.autoLoan;
		}
		if (subMenu?.business) {
			subMenu.business.hide = loginData.showBusinessLoan != '1' || !loanTypeToggles.business;
		}
		if (subMenu?.savingsPage) {
			subMenu.savingsPage.hide = loginData.isThrift != '1';
		}
		return menuClone;
	}, [
		loginData.isThrift,
		loginData.showBusinessLoan,
		loginData.isAutoLoan,
		loanTypeToggles.autoLoan,
		loanTypeToggles.business,
	]);

	const masterMenu = useMemo(
		() => applyMenuAccessControl(mastersMenuPrepared, accessMap),
		[accessMap, mastersMenuPrepared],
	);

	const operationsMenuPrepared = useMemo(() => {
		const menuClone = cloneMenuDefinition(operationsPageMenu);
		const subMenu = menuClone.operationPages?.subMenu as Record<string, any> | undefined;

		// Gold — backend gate OR client toggle
		const goldHide = loginData.isGoldLoanAvailed != '1' || !loanTypeToggles.goldLoan;
		if (subMenu?.GoldLoanProposal) subMenu.GoldLoanProposal.hide = goldHide;
		// SN Report R29/R30: Gold Loan (LMS) + Gold Loan Approval (LMS) share the
		// same "Gold loan proposals" switch (isGoldLoanAvailed) as the classic pages.
		if (subMenu?.GoldLoanProposalLMS) subMenu.GoldLoanProposalLMS.hide = goldHide;
		if (subMenu?.GoldLoanApprovalLMS) subMenu.GoldLoanApprovalLMS.hide = goldHide;
		if (subMenu?.goldCollectionPage) subMenu.goldCollectionPage.hide = goldHide;
		if (subMenu?.goldLoanDisbursementPage) subMenu.goldLoanDisbursementPage.hide = goldHide;
		if (subMenu?.goldCloseLoanPage) subMenu.goldCloseLoanPage.hide = goldHide;

		// Business — backend gate OR client toggle
		const bizHide = loginData.showBusinessLoan != '1' || !loanTypeToggles.business;
		if (subMenu?.BusinessLoanProposal) subMenu.BusinessLoanProposal.hide = bizHide;
		if (subMenu?.businessLoanDisbursementPage) subMenu.businessLoanDisbursementPage.hide = bizHide;
		if (subMenu?.businessCollectionPage) subMenu.businessCollectionPage.hide = bizHide;

		// Auto Loan — backend gate OR client toggle
		const autoHide = loginData.isAutoLoan != '1' || !loanTypeToggles.autoLoan;
		if (subMenu?.autoLoanDisbursemetPage) subMenu.autoLoanDisbursemetPage.hide = autoHide;
		if (subMenu?.autoLoanProposalPage) subMenu.autoLoanProposalPage.hide = autoHide;
		if (subMenu?.autoLoanCollectionPage) subMenu.autoLoanCollectionPage.hide = autoHide;

		// RD — existing thrift gate OR client RD toggle
		if (subMenu?.RDProposal) {
			subMenu.RDProposal.hide = loginData.isThrift != '1' || !loanTypeToggles.rd;
		}

		// Individual — backend gate OR client toggle
		if (subMenu?.IndividualLoanProposal) {
			subMenu.IndividualLoanProposal.hide =
				loginData.isIndividualLoanNeeded != '1' || !loanTypeToggles.individual;
		}

		// MFI — no backend gate today; hide the three group/center flows when the
		// client MFI toggle is off. When ON, existing per-user access rights still apply.
		if (subMenu?.CenterWiseLoanProposal) {
			subMenu.CenterWiseLoanProposal.hide = !loanTypeToggles.mfi;
		}
		if (subMenu?.GroupWiseLoanProposal) {
			subMenu.GroupWiseLoanProposal.hide = !loanTypeToggles.mfi;
		}
		if (subMenu?.RangeLoanProposal) {
			subMenu.RangeLoanProposal.hide = !loanTypeToggles.mfi;
		}

		if (subMenu?.closeLoanAdvancePage) {
			subMenu.closeLoanAdvancePage.hide = loginData.isThrift != '1';
		}
		return menuClone;
	}, [
		loginData.isGoldLoanAvailed,
		loginData.isThrift,
		loginData.showBusinessLoan,
		loginData.isAutoLoan,
		loginData.isIndividualLoanNeeded,
		loanTypeToggles.mfi,
		loanTypeToggles.individual,
		loanTypeToggles.business,
		loanTypeToggles.autoLoan,
		loanTypeToggles.goldLoan,
		loanTypeToggles.rd,
	]);

	const operationsMenu = useMemo(
		() => applyMenuAccessControl(operationsMenuPrepared, accessMap),
		[operationsMenuPrepared, accessMap],
	);

	const reportsMenuPrepared = useMemo(() => {
		const menuClone = cloneMenuDefinition(reportsPageMenu);
		const subMenu = menuClone.reportsPages?.subMenu as Record<string, any> | undefined;

		const goldHide = loginData.isGoldLoanAvailed != '1' || !loanTypeToggles.goldLoan;
		const autoHide = loginData.isAutoLoan != '1' || !loanTypeToggles.autoLoan;

		if (subMenu?.goldLoanCollectionReport) subMenu.goldLoanCollectionReport.hide = goldHide;
		if (subMenu?.goldLoanStockReport) subMenu.goldLoanStockReport.hide = goldHide;
		if (subMenu?.goldDashboardReport) subMenu.goldDashboardReport.hide = goldHide;
		if (subMenu?.goldLoanInterestReminderReport) subMenu.goldLoanInterestReminderReport.hide = goldHide;
		if (subMenu?.goldPriceReport) subMenu.goldPriceReport.hide = goldHide;
		if (subMenu?.goldArrearReport) subMenu.goldArrearReport.hide = goldHide;
		if (subMenu?.attendanceReport) {
			subMenu.attendanceReport.hide = loginData.isOfficerAttendanceNeeded != '1';
		}
		if (subMenu?.qrReport) {
			subMenu.qrReport.hide = loginData.showQRPayment != '1';
		}
		if (subMenu?.AutoCollectionPageReport) subMenu.AutoCollectionPageReport.hide = autoHide;
		// R72: Dealer Report only for auto-loan-using companies
		if (subMenu?.DealerReport) subMenu.DealerReport.hide = autoHide;
		if (subMenu?.mandateReport) {
			subMenu.mandateReport.hide = loginData.enachVia == '' || loginData.enachVia == null;
		}
		if (subMenu?.enachReport) {
			subMenu.enachReport.hide = loginData.enachVia == '' || loginData.enachVia == null;
		}
		if (subMenu?.savingsFollowupReport) {
			subMenu.savingsFollowupReport.hide = loginData.isIndividualSavings != '1';
		}
		if (subMenu?.memberAccountReport) {
			subMenu.memberAccountReport.hide = loginData.isIndividualSavings != '1';
		}
		return menuClone;
	}, [
		loginData.isGoldLoanAvailed,
		loginData.isAutoLoan,
		loginData.showQRPayment,
		loginData.enachVia,
		loginData.isOfficerAttendanceNeeded,
		loginData.isIndividualSavings,
		loanTypeToggles.autoLoan,
		loanTypeToggles.goldLoan,
	]);

	const reportsMenu = useMemo(
		() => applyMenuAccessControl(reportsMenuPrepared, accessMap),
		[accessMap, reportsMenuPrepared],
	);

	const financeMenu = useMemo(
		() => applyMenuAccessControl(financePageMenu, accessMap),
		[accessMap],
	);

	// Dashboard analytics group — sub-pages live at /dashboard/* and are
	// surfaced via this menu since the root dashboard entry is hidden.
	const dashboardMenu = useMemo(
		() => applyMenuAccessControl(dashboardPagesMenu, accessMap),
		[accessMap],
	);

	const renderMenuBlocks = (blocks: ReactNode[]) =>
		blocks.map((block, index) => (
			<Fragment key={`aside-menu-block-${index}`}>
				{block}
				{index < blocks.length - 1 && <NavigationLine />}
			</Fragment>
		));

	const superAdminMenuBlocks: ReactNode[] = [];
	if (hasMenuItems(companyMenu)) {
		superAdminMenuBlocks.push(<Navigation menu={companyMenu} id='aside-company-page' />);
	}
	if (hasMenuItems(companyRequestsMenu)) {
		superAdminMenuBlocks.push(<Navigation menu={companyRequestsMenu} id='aside-company-creation-requests' />);
	}
	if (hasMenuItems(passwordResetRequestsMenuClone)) {
		superAdminMenuBlocks.push(
			<Navigation
				menu={passwordResetRequestsMenuClone}
				id='aside-password-reset-requests'
			/>,
		);
	}
	if (hasMenuItems(commonUpdateMenu)) {
		superAdminMenuBlocks.push(
			<Navigation menu={commonUpdateMenu} id='aside-common-update-page' />,
		);
	}
	// Schema Sync is super-admin-only (level100). Even within the SuperAdmin aside
	// this stays gated on userLevel so the entry never renders for any lower level.
	if (loginData.userLevel === 'level100' && hasMenuItems(schemaSyncMenu)) {
		superAdminMenuBlocks.push(
			<Navigation menu={schemaSyncMenu} id='aside-schema-sync-page' />,
		);
	}

	const regularMenuBlocks: ReactNode[] = [];

	if (hasMenuItems(dashboardMenu)) {
		regularMenuBlocks.push(<Navigation menu={dashboardMenu} id='aside-dashboard-pages' />);
	}
	if (
		loginData.userLevel === 'level100' &&
		loginData.userLevel !== 'level4' &&
		loginData.userLevel !== 'level5' &&
		hasMenuItems(userControlMenu)
	) {
		regularMenuBlocks.push(
			<Navigation menu={userControlMenu} id='aside-userControlAccess-pages' />,
		);
	}
	if (hasMenuItems(masterMenu)) {
		regularMenuBlocks.push(<Navigation menu={masterMenu} id='aside-master-pages' />);
	}
	if (hasMenuItems(operationsMenu)) {
		regularMenuBlocks.push(<Navigation menu={operationsMenu} id='aside-operation-pages' />);
	}
	if (loginData.companyIsActive == 1 && hasMenuItems(reportsMenu)) {
		regularMenuBlocks.push(<Navigation menu={reportsMenu} id='aside-report-pages' />);
	}
	if (hasMenuItems(financeMenu)) {
		regularMenuBlocks.push(<Navigation menu={financeMenu} id='aside-finance-pages' />);
	}

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>

			<AsideBody>
				<>
					<div className="aside-search-wrapper" style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
						<Search menus={
							loginData.userType === 'SuperAdmin'
								? [companyMenu, companyRequestsMenu, passwordResetRequestsMenuClone, commonUpdateMenu, schemaSyncMenu]
								: [dashboardMenu, userControlMenu, masterMenu, operationsMenu, reportsMenu, financeMenu]
						} />
					</div>
					{loginData.userType === 'SuperAdmin'
						? renderMenuBlocks(superAdminMenuBlocks)
						: renderMenuBlocks(regularMenuBlocks)}
				</>
			</AsideBody>
			<AsideFoot>
				<User />
			</AsideFoot>
		</Aside>
	);
};
export default DefaultAside;
