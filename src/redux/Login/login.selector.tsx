// Version : 0.0.3
// Author : Vignesh
// LastEdit : Vignesh
// Last ADD : GENERAL ADMIN ID ADDED IN SELECTOR
// MODFIED DATE : 11-08-2025

import { createSelector } from 'reselect';

const selectUser = (state: any) => state.base_login;

/***************  USER LOGIN START  ******************/
export const selectCurrentUser = createSelector(
	[selectUser],
	(base_login) => base_login.loginResponse,
);
export const selectCurrentDecodedUser = createSelector(
	[selectUser],
	(base_login) => base_login.loginDeocodedResponse,
);
/***************  USER LOGIN END  ******************/

/***************  USER LOGIN VERIFICATION START  ******************/
export const selectLoginVerificationResponse = createSelector(
	[selectUser],
	(base_login) => base_login.loginVerificationResponse,
);
/***************  USER LOGIN VERIFICATION END  ******************/

// UPDATE LOGIN DATE TIME
export const selectLoginDateTime = createSelector(
	[selectUser],
	(base_login) => base_login.loginDateTime,
);

/*****************  USER AUTH VERIFY START  *******************/
export const selectAuthVerifyResponse = createSelector(
	[selectUser],
	(base_login) => base_login.userAuthVerifyResponse,
);

export const selectAuthCheck = createSelector(
	[selectUser],
	(base_login) => base_login.authCheckDone,
);
/***************** 	USER AUTH VERIFY END  *****************/

/*****************  FORGOT PASSWORD START  *******************/
export const selectForgotPasswordResp = createSelector(
	[selectUser],
	(base_login) => base_login.forgotPasswordResponse,
);

export const selectForgotPasswordRespDetails = createSelector(
	[selectUser],
	(base_login) => base_login.forgotPasswordDeocodedResponse,
);
/***************** 	FORGOT PASSWORD END  *****************/

/*****************  UPDATE LOGIN USER PASSWORD START  *******************/
export const selectUpdateUserPasswordStatus = createSelector(
	[selectUser],
	(base_login) => base_login.updateUserPasswordStatus,
);

export const selectUpdateUserPasswordResp = createSelector(
	[selectUser],
	(base_login) => base_login.updateUserPasswordResponse,
);
/***************** 	UPDATE LOGIN USER PASSWORD END  *****************/

export const selectIsAdminUser = createSelector([selectUser], (base_login) => {
	const { loginDeocodedResponse } = base_login;
	let isUserAdmin = '0';
	if (
		loginDeocodedResponse !== null &&
		loginDeocodedResponse !== undefined &&
		loginDeocodedResponse.length > 0
	) {
		const { isAdmin } = loginDeocodedResponse[0];
		isUserAdmin = isAdmin;
	}
	return isUserAdmin;
});

/** ***************** GET USER COMPANY DETAILS START *********************** */
export const selectUserCompanyDetailsResponse = createSelector(
	[selectUser],
	(base_login) => base_login.getUserLoginDetailsResponse,
);

export const selectUserCompanyDetailsData = createSelector(
	[selectUser],
	(base_login) => base_login.getUserLoginDetailsArr,
);
/** ***************** GET USER COMPANY DETAILS END *********************** */

export const getLoginObjDetails = createSelector([selectUser], (base_login) => {
	const { getUserLoginDetailsArr } = base_login;
	let loginObj: any = {
		userID: '',
		userType: '',
		userName: '',
		databaseName: '',
		userAccessBranchID: 0,
		userAccessBranchName: '',
		userRoleID: '',
		userRole: '',
		userLevel: '',
		generalCompanyID: '',
		generalAdminID: '',
		userPhoneNumber: '',
		userAddress: '',
		userEmailID: '',
		userPhoto: '',
		isAadharMaskingNeeded: '',
		limit: '',
		branchIDs: '',
		isAuthenticationNeeded: '',
		companyPhoneNumber: '',
		isNbfcLogin: '',
		companyID: '',
		companyName: '',
		companyEmail: '',
		companyLogo: '',
		infogCompanyID: '',
		isWorkFlowManagementNeeded: '',
		isHighMarkCheck: '',
		isEquifaxCheck: '',
		isThrift: '',
		isTenureClosedArrearsinDemandCollectionReport: '',
		isActiveLoanArrearsinDemandCollectionReport: '',
		currency: '',
		provisionType: '',
		isHavingConsumer: '',
		companyModal: '',
		isGoldLoanAvailed: '',
		isIndividualLoanNeeded: '',
		percentageOnSellingPrice: '',
		isProductConfigNeed: '',
		isIndividualSavings: '',
		cityVersion: '',
		stateVersion: '',
		countryVersion: '',
		branchVersion: '',
		centerVersion: '',
		groupVersion: '',
		isExperianCheck: '',
		isTopupLoanNeeded: '',
		isKYCNeed: '',
		userApplicationAmount: '',
		isSubGroupNeeded: '',
		userAccessData: '',
		isTrainingMandatoryForLoan: '',
		isNomineeLoanApproval: '',
		isRestrictLoanAlreadyExist: '',
		secrateAuth: '',
		userAccess: '',
		isDailyEODNeeded: '',
		isFinanceApproveNeededforEOD: '',
		isAutoEODNeeded: '',
		IsEquifaxCheck: '',
		isAutoEODNeededSat: '',
		defaultPreferredLanguage: '',
		enachVia: '',
		isPaisanowVerificationNecessary: '',
		isPaisanowLink: '',
		aadharNormal: '',
		aadharOTP: '',
		panNormal: '',
		panDetailed: '',
		voterID: '',
		drivingLicense: '',
		isAutoLoan: '',
		isShowLoanAdvance1: '',
		isShowLoanAdvance2: '',
		jwtToken: '',
		companyCity: '',
		isExistingAadharCheck: '',
		isExistingNomineeAadharCheck: '',
		isExistingCoApplicantAadharCheck: '',
		isOTPNeededForCoApplicantAadhar: '',
		isOTPNeededForMemberAadhar: '',
		isOTPNeededForNomineeAadhar: '',
		isLocationNeed: '',
		isNachCollectionNeeded: '',
		companyApplicationAmount: '',
		showQRPayment: '',
		showBusinessLoan: '',
		isWorkFlowNeeded: '',
		isOfficerAttendanceNeeded: '',
		isBusinessPhoneNoExist: '',
		isBusinessPhoneNoOTPExist: '',
		isBusinessAadharExist: '',
		isBusinessAadharOTPExist: '',
		isBusinessBorrowPhoneNoExist: '',
		isBusinessBarrowPhoneOTPExist: '',
		isBusinessBorrowAadharExist: '',
		isBusinessPartnerPhoneNoExist: '',
		isBusinessBarrowAadharOTPExist: '',
		isBusinessPartnerPhoneNoOTPExist: '',
		moveAutoLoanCollectionToNextDateIfEodDone: false,
		userAccessBranchUniqueID: '',
		nextUniqueCenterID: '',
		branchLatitude: '',
		branchLongitude: '',
		isSelected: '',
		needJournalEntryAfterEOD: '',
		travelAllowance: '',
		isAuditNotMandatoryForSecondLoan: '',
		isSMSAvailed: '',
		isLevel1CanInstantGoldApproval: false,
		isLevel2CanInstantGoldApproval: false,
		isLevel3CanInstantGoldApproval: false,
		isLevel4CanInstantGoldApproval: false,
		isLevel5CanInstantGoldApproval: false,
		isLevel6CanInstantGoldApproval: false,
		isLevel7CanInstantGoldApproval: false,
		isEditActiveLoanMember: false,
	};

	if (
		getUserLoginDetailsArr !== null &&
		getUserLoginDetailsArr !== undefined &&
		getUserLoginDetailsArr !== ''
	) {
		if (getUserLoginDetailsArr.length > 0) {
			const {
				UserID,
				UserName,
				UserType,
				DatabaseName,
				UserRoleID,
				UserRoleName,
				UserLevel,
				GeneralCompanyID,
				GeneralAdminID,
				UserPhoneNumber,
				UserAddress,
				UserEmailID,
				UserPhoto,
				BranchAccessIDs,
				UserApplicationAmount,
				UserAccessData,
				SecrateAuth,
				UserAccess,
				AuthenticationToken,
			} = getUserLoginDetailsArr[0];

			loginObj.userID = UserID || '';
			loginObj.userName = UserName || '';
			loginObj.userType = UserType || '';
			loginObj.databaseName = DatabaseName || '';
			loginObj.userRoleID = UserRoleID || '';
			loginObj.userRole = UserRoleName || '';
			loginObj.userLevel = UserLevel || '';
			loginObj.generalCompanyID = GeneralCompanyID || '';
			loginObj.generalAdminID = GeneralAdminID || '';
			loginObj.userPhoneNumber = UserPhoneNumber || '';
			loginObj.userAddress = UserAddress || '';
			loginObj.userEmailID = UserEmailID || '';
			loginObj.userPhoto = UserPhoto || '';
			loginObj.userApplicationAmount = UserApplicationAmount || '';
			loginObj.secrateAuth = SecrateAuth || '';
			loginObj.userAccessData = UserAccessData ? UserAccessData : [];
			loginObj.userAccess = UserAccess || [];
			loginObj.jwtToken = AuthenticationToken || '';

			// Convert BranchAccessIDs array to comma-separated string
			if (BranchAccessIDs !== undefined && BranchAccessIDs !== null) {
				if (Array.isArray(BranchAccessIDs) && BranchAccessIDs.length > 0) {
					loginObj.branchIDs = BranchAccessIDs.join(',');
				} else if (typeof BranchAccessIDs === 'string' && BranchAccessIDs.length > 0) {
					loginObj.branchIDs = BranchAccessIDs;
				} else {
					loginObj.branchIDs = 'All';
				}
			} else {
				loginObj.branchIDs = 'All';
			}

			if (getUserLoginDetailsArr[0].Company?.length > 0) {
				const {
					IsAadharMaskingNeeded,
					isAuthenticationNeeded,
					CompanyIsActive,
					CompanyPhoneNumber,
					ProvisionType,
					CompanyID,
					CompanyName,
					companyCity,
					CompanyEmail,
					CompanyLogo,
					InfogID,
					isWorkFlowManagementNeeded,
					ISHighMarkCheck,
					isEquifaxCheck,
					isThrift,
					IsTenureClosedArrearsinDemandCollectionReport,
					IsActiveLoanArrearsinDemandCollectionReport,
					isPersonalLoanWithRangeProductNeeded,
					isHavingConsumer,
					IsEquifaxCheck,
					companyModal,
					isGoldLoanAvailed,
					isIndividualLoanNeeded,
					PercentageOnSellingPrice,
					IsProductConfigNeed,
					isIndividualSavings,
					CityVersion,
					StateVersion,
					CountryVersion,
					BranchVersion,
					CenterVersion,
					GroupVersion,
					IsExperianCheck,
					IsTopupLoanNeeded,
					IsKYCNeed,
					isSubGroupNeeded,
					isTrainingMandatoryForLoan,
					isNomineeLoanApproval,
					IsRestrictLoanAlreadyExist,
					isDailyEODNeeded,
					IsFinanceApproveNeededforEOD,
					isAutoEODNeeded,
					isAutoEODNeededSat,
					DefaultPreferredLanguage,
					enachVia,
					isPaisanowVerificationNecessary,
					isPaisanowLink,
					isAutoLoan,
					IsShowLoanAdvance1,
					IsShowLoanAdvance2,
					CurrencySymbol,
					isExistingAadharCheck,
					isExistingNomineeAadharCheck,
					isExistingCoApplicantAadharCheck,
					isOTPNeededForCoApplicantAadhar,
					isOTPNeededForMemberAadhar,
					isOTPNeededForNomineeAadhar,
					isLocationNeed,
					isNachCollectionNeeded,
					CompanyApplicationAmount,
					showQRPayment,
					showBusinessLoan,
					isOfficerAttendanceNeeded,
					isBusinessPhoneNoExist,
					isBusinessPhoneNoOTPExist,
					isBusinessAadharExist,
					isBusinessAadharOTPExist,
					isBusinessBorrowPhoneNoExist,
					isBusinessBarrowPhoneOTPExist,
					isBusinessBorrowAadharExist,
					isBusinessBarrowAadharOTPExist,
					isBusinessPartnerPhoneNoExist,
					isBusinessPartnerPhoneNoOTPExist,
					needJournalEntryAfterEOD,
					TravelAllowance,
					IsAuditNotMandatoryForSecondLoan,
					isonAutoMemberAddSms,
					IsLevel1AllowedWalletCollection,
					IsLevel2AllowedWalletCollection,
					IsLevel3AllowedWalletCollection,
					IsLevel4AllowedWalletCollection,
					IsLevel5AllowedWalletCollection,
					IsLevel6AllowedWalletCollection,
					IsLevel7AllowedWalletCollection,
					isLevel1CanInstantGoldApproval,
					isLevel2CanInstantGoldApproval,
					isLevel3CanInstantGoldApproval,
					isLevel4CanInstantGoldApproval,
					isLevel5CanInstantGoldApproval,
					isLevel6CanInstantGoldApproval,
					isLevel7CanInstantGoldApproval,
					IsNextFollowUpNeeded,
					moveAutoLoanCollectionToNextDateIfEodDone,
					QRPaymentGateway,
					IsSMS,
				} = getUserLoginDetailsArr[0].Company[0];
				loginObj = {
					...loginObj,
					userRoleID: UserRoleID,
					userRole: UserRoleName,
					isAadharMaskingNeeded: IsAadharMaskingNeeded,
					limit: 0,
					isAuthenticationNeeded: isAuthenticationNeeded,
					companyIsActive: CompanyIsActive,
					companyPhoneNumber: CompanyPhoneNumber,
					isNbfcLogin: ProvisionType === 'NBFC' ? 1 : 0,
					companyID: CompanyID,
					companyName: CompanyName,
					companyCity,
					companyEmail: CompanyEmail,
					companyLogo: CompanyLogo,
					infogCompanyID: InfogID,
					isWorkFlowManagementNeeded: isWorkFlowManagementNeeded,
					isHighMarkCheck: ISHighMarkCheck,
					isEquifaxCheck: isEquifaxCheck,
					isThrift: isThrift,
					isTenureClosedArrearsinDemandCollectionReport:
						IsTenureClosedArrearsinDemandCollectionReport,
					isActiveLoanArrearsinDemandCollectionReport:
						IsActiveLoanArrearsinDemandCollectionReport,
					isPersonalLoanWithRangeProductNeeded: isPersonalLoanWithRangeProductNeeded,
					currency: CurrencySymbol,
					provisionType: ProvisionType,
					isHavingConsumer: isHavingConsumer ? isHavingConsumer : 0,
					IsEquifaxCheck: IsEquifaxCheck ? IsEquifaxCheck : 0,
					companyModal: companyModal,
					isGoldLoanAvailed: isGoldLoanAvailed,
					isIndividualLoanNeeded: isIndividualLoanNeeded,
					percentageOnSellingPrice: PercentageOnSellingPrice,
					isProductConfigNeed: IsProductConfigNeed,
					isIndividualSavings: isIndividualSavings,
					cityVersion: CityVersion,
					stateVersion: StateVersion,
					countryVersion: CountryVersion,
					branchVersion: BranchVersion,
					centerVersion: CenterVersion,
					groupVersion: GroupVersion,
					isExperianCheck: IsExperianCheck,
					isTopupLoanNeeded: IsTopupLoanNeeded,
					isKYCNeed: IsKYCNeed,
					userApplicationAmount:
						parseFloat(UserApplicationAmount) > 0 ? UserApplicationAmount : 0,
					isSubGroupNeeded: isSubGroupNeeded,
					userAccessData: UserAccessData ? UserAccessData : [],
					isTrainingMandatoryForLoan: isTrainingMandatoryForLoan,
					isNomineeLoanApproval: isNomineeLoanApproval,
					isRestrictLoanAlreadyExist: IsRestrictLoanAlreadyExist,
					secrateAuth: SecrateAuth,
					userAccess: UserAccess,
					isDailyEODNeeded: isDailyEODNeeded,
					isFinanceApproveNeededforEOD: IsFinanceApproveNeededforEOD,
					isAutoEODNeeded: isAutoEODNeeded,
					isAutoEODNeededSat: isAutoEODNeededSat,
					defaultPreferredLanguage: DefaultPreferredLanguage,
					enachVia: enachVia,
					isPaisanowVerificationNecessary: isPaisanowVerificationNecessary,
					isPaisanowLink: isPaisanowLink,
					isAutoLoan: isAutoLoan,
					isShowLoanAdvance1: IsShowLoanAdvance1,
					isShowLoanAdvance2: IsShowLoanAdvance2,
					jwtToken: AuthenticationToken,
					isExistingAadharCheck,
					isExistingNomineeAadharCheck,
					isExistingCoApplicantAadharCheck,
					isOTPNeededForCoApplicantAadhar,
					isOTPNeededForMemberAadhar,
					isOTPNeededForNomineeAadhar,
					isLocationNeed,
					isNachCollectionNeeded,
					companyApplicationAmount: CompanyApplicationAmount,
					isWorkFlowNeeded: isWorkFlowManagementNeeded,
					showQRPayment,
					showBusinessLoan,
					isOfficerAttendanceNeeded,
					isBusinessPhoneNoExist,
					isBusinessPhoneNoOTPExist,
					isBusinessAadharExist,
					isBusinessAadharOTPExist,
					isBusinessBorrowPhoneNoExist,
					isBusinessBarrowPhoneOTPExist,
					isBusinessBorrowAadharExist,
					isBusinessBarrowAadharOTPExist,
					isBusinessPartnerPhoneNoExist,
					isBusinessPartnerPhoneNoOTPExist,
					needJournalEntryAfterEOD,
					travelAllowance: TravelAllowance,
					isAuditNotMandatoryForSecondLoan: IsAuditNotMandatoryForSecondLoan,
					isonAutoMemberAddSms: isonAutoMemberAddSms,
					isLevel1AllowedWalletCollection: !!IsLevel1AllowedWalletCollection,
					isLevel2AllowedWalletCollection: !!IsLevel2AllowedWalletCollection,
					isLevel3AllowedWalletCollection: !!IsLevel3AllowedWalletCollection,
					isLevel4AllowedWalletCollection: !!IsLevel4AllowedWalletCollection,
					isLevel5AllowedWalletCollection: !!IsLevel5AllowedWalletCollection,
					isLevel6AllowedWalletCollection: !!IsLevel6AllowedWalletCollection,
					isLevel7AllowedWalletCollection: !!IsLevel7AllowedWalletCollection,
					isLevel1CanInstantGoldApproval: !!isLevel1CanInstantGoldApproval,
					isLevel2CanInstantGoldApproval: !!isLevel2CanInstantGoldApproval,
					isLevel3CanInstantGoldApproval: !!isLevel3CanInstantGoldApproval,
					isLevel4CanInstantGoldApproval: !!isLevel4CanInstantGoldApproval,
					isLevel5CanInstantGoldApproval: !!isLevel5CanInstantGoldApproval,
					isLevel6CanInstantGoldApproval: !!isLevel6CanInstantGoldApproval,
					isLevel7CanInstantGoldApproval: !!isLevel7CanInstantGoldApproval,
					isNextFollowUpNeeded: !!IsNextFollowUpNeeded,
					moveAutoLoanCollectionToNextDateIfEodDone:
						!!moveAutoLoanCollectionToNextDateIfEodDone,
					QRPaymentGateway: QRPaymentGateway,
					isSMSAvailed: IsSMS,
				};

				// Company setting: allow editing details of members with an active (disbursed) loan.
				// Server field name may vary; accept the known variants and coerce to a strict boolean.
				const companyData = getUserLoginDetailsArr[0].Company[0];
				const rawEditActiveLoanMember =
					companyData?.editActiveLoanMemberDetails ??
					companyData?.IsEditActiveLoanMember ??
					companyData?.EditActiveLoanMemberDetails;
				loginObj.isEditActiveLoanMember =
					rawEditActiveLoanMember === true ||
					rawEditActiveLoanMember === 1 ||
					rawEditActiveLoanMember === '1';
			}
			if (getUserLoginDetailsArr[0].UserAccess?.length > 0) {
				// USC #5: honor the "All Branches" sentinel set by the reducer.
				// Without this, when no UserAccess row matches the payload the
				// .find() fallback returned UserAccess[0] — narrowing the
				// dashboard silently to the first branch instead of showing the
				// full company-wide aggregate the user actually asked for.
				if (getUserLoginDetailsArr[0].__allBranchScope) {
					loginObj.userAccessBranchID = 'All';
					loginObj.userAccessBranchName =
						getUserLoginDetailsArr[0].__allBranchName || 'All Branches';
					loginObj.userAccessBranchUniqueID = '';
					loginObj.nextUniqueCenterID = '';
					loginObj.branchLatitude = '';
					loginObj.branchLongitude = '';
					loginObj.isSelected = 0;
				} else {
					// Find the selected branch (IsSelected === 1 or "1"), otherwise use the first one
					const selectedBranch =
						getUserLoginDetailsArr[0].UserAccess.find(
							(ua: any) => ua.IsSelected === 1 || ua.IsSelected === '1',
						) || getUserLoginDetailsArr[0].UserAccess[0];
					const ua = selectedBranch;
					// Set userAccessBranchID to 0 if it's empty, null, undefined, or "0"
					const branchID = ua.UserAccessBranchID;
					loginObj.userAccessBranchID =
						branchID !== null &&
						branchID !== undefined &&
						branchID !== '' &&
						branchID !== '0' &&
						branchID !== 0
							? branchID
							: 0;
					loginObj.userAccessBranchName = ua.UserAccessBranchName || '';
					loginObj.userAccessBranchUniqueID = ua.UserAccessBranchUniqueID || '';
					loginObj.nextUniqueCenterID = ua.NextUniqueCenterID || '';
					loginObj.branchLatitude = ua.BranchLatitude || '';
					loginObj.branchLongitude = ua.BranchLongitude || '';
					loginObj.isSelected = ua.IsSelected || 0;
				}
			} else {
				// No UserAccess array, ensure userAccessBranchID is 0 (for admin users)
				loginObj.userAccessBranchID = '0';
			}
		}
	}
	return loginObj;
});

/** ***************** FETCH USER DETAILS START *********************** */
export const selectFetchUserDetailsResponse = createSelector(
	[selectUser],
	(base_login) => base_login.fetchUserDetailsResponse,
);

export const selectFetchUserDetailsArr = createSelector(
	[selectUser],
	(base_login) => base_login.fetchUserDetailsArr,
);
/** ***************** FETCH USER DETAILS END *********************** */

/*****************  CREATE PASSWORD RESET REQUEST START  *******************/
export const selectCreatePasswordResetRequestResp = createSelector(
	[selectUser],
	(base_login) => base_login.createPasswordResetRequestResponse,
);
/***************** 	CREATE PASSWORD RESET REQUEST END  *****************/

/*****************  GET PASSWORD RESET REQUESTS START  *******************/
export const selectGetPasswordResetRequestsResp = createSelector(
	[selectUser],
	(base_login) => base_login.getPasswordResetRequestsResponse,
);

export const selectGetPasswordResetRequestsArr = createSelector(
	[selectUser],
	(base_login) => base_login.getPasswordResetRequestsArr,
);
/***************** 	GET PASSWORD RESET REQUESTS END  *****************/

/*****************  ADMIN RESET PASSWORD START  *******************/
export const selectAdminResetPasswordResp = createSelector(
	[selectUser],
	(base_login) => base_login.adminResetPasswordResponse,
);
/***************** 	ADMIN RESET PASSWORD END  *****************/
