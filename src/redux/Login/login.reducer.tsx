/* eslint-disable no-case-declarations */
// Version : 0.0.3
// Author : Vignesh

import loginActionTypes from './login.types';
import { docodeHexResponse } from '../_common/common.utils';

const INITIAL_STATE: any = {
	loginResponse: null,
	loginDateTime: null,
	authCheckDone: 0,
	loginDeocodedResponse: [],
	userAuthVerifyResponse: null,
	loginVerificationResponse: null,
	currencySymbols: '',
	forgotPasswordResponse: null,
	forgotPasswordDeocodedResponse: null,
	updateUserPasswordStatus: null,
	updateUserPasswordResponse: [],
	getUserLoginDetailsResponse: null,
	getUserLoginDetailsArr: [],
	fetchUserDetailsResponse: null,
	fetchUserDetailsArr: [],
	createPasswordResetRequestResponse: null,
	getPasswordResetRequestsResponse: null,
	getPasswordResetRequestsArr: [],
	adminResetPasswordResponse: null,
};

const loginReducer = (state = INITIAL_STATE, action: any) => {
	switch (action.type) {
		/***************  USER LOGIN START  ******************/
		case loginActionTypes.USER_SIGN_IN_SUCCESS:
			const decodedResponse = docodeHexResponse(action.payload, 'UserLoginVerify');
			return {
				...state,
				loginResponse: action.payload,
				loginDeocodedResponse: decodedResponse || [],
			};

		case loginActionTypes.USER_SIGN_IN_FAILURE:
			return {
				...state,
				loginResponse: action.payload,
				loginDeocodedResponse: null,
			};

		case loginActionTypes.USER_SIGN_IN_RESPONSE_CHANGED:
			return {
				...state,
				loginResponse: null,
				loginDeocodedResponse: null,
			};
		/***************  USER LOGIN END  ******************/

		case loginActionTypes.USER_SIGN_IN_VERIFICATION_SUCCESS:
			return {
				...state,
				loginVerificationResponse: action.payload,
			};

		case loginActionTypes.USER_SIGN_IN_VERIFICATION_FAILURE:
			return {
				...state,
				loginVerificationResponse: action.payload,
			};

		case loginActionTypes.USER_SIGN_IN_VERIFICATION_RESPONSE_CHANGED:
			return {
				...state,
				loginVerificationResponse: null,
			};
		/***************  USER SESSION CREATION START  ******************/

		case loginActionTypes.USER_SIGN_IN_SESSION_CREATION_SUCCESS:
			return {
				...state,
				loginVerificationResponse: action.payload,
			};

		case loginActionTypes.USER_SIGN_IN_SESSION_CREATION_FAILURE:
			return {
				...state,
				loginVerificationResponse: action.payload,
			};

		case loginActionTypes.USER_SIGN_IN_SESSION_CREATION_RESPONSE_CHANGED:
			return {
				...state,
				loginVerificationResponse: null,
			};
		/***************  USER SESSION CREATION END  ******************/

		case loginActionTypes.USER_SIGN_OUT:
			return {
				...state,
				authCheckDone: 0,
				loginDateTime: null,
				loginResponse: null,
				loginDeocodedResponse: [],
				getUserLoginDetailsResponse: null,
				getUserLoginDetailsArr: [],
			};

		case loginActionTypes.USER_AUTH_CHECK_DONE_CHANGED:
			return {
				...state,
				authCheckDone: action.payload,
			};

		case loginActionTypes.USER_LOGIN_TIME_CHANGED:
			return {
				...state,
				loginDateTime: action.payload,
			};
		/***************  USER LOGIN END  ******************/

		/*****************  USER AUTH VERIFY START  *******************/
		case loginActionTypes.USER_AUTH_VERIFY_SUCCESS:
			return {
				...state,
				userAuthVerifyResponse: action.payload,
			};

		case loginActionTypes.USER_AUTH_VERIFY_FAILURE:
			return {
				...state,
				userAuthVerifyResponse: action.payload,
			};

		case loginActionTypes.USER_AUTH_VERIFY_RESPONSE_CHANGED:
			return {
				...state,
				userAuthVerifyResponse: null,
			};

		/***************** 	USER AUTH VERIFY END  *****************/

		/*****************  FORGOT PASSWORD START  *******************/
		case loginActionTypes.FETCH_FORGOT_PASSWORD_SUCCESS:
			const forgotPasswordDecoded = docodeHexResponse(action.payload, 'ForgotPassKey');
			return {
				...state,
				forgotPasswordResponse: action.payload,
				forgotPasswordDeocodedResponse: forgotPasswordDecoded || null,
			};

		case loginActionTypes.FETCH_FORGOT_PASSWORD_FAILURE:
			const forgotPasswordDecodedFailure = docodeHexResponse(action.payload, 'ForgotPassKey');
			return {
				...state,
				forgotPasswordResponse: action.payload,
				forgotPasswordDeocodedResponse: forgotPasswordDecodedFailure || null,
			};

		case loginActionTypes.FETCH_FORGOT_PASSWORD_RESPONSE_CHANGED:
			return {
				...state,
				forgotPasswordResponse: null,
				forgotPasswordDeocodedResponse: null,
			};

		/***************** 	FORGOT PASSWORD END  *****************/

		/*****************  UPDATE LOGIN USER PASSWORD START  *******************/
		case loginActionTypes.UPDATE_USER_PASSWORD_SUCCESS:
			const updatePasswordDecoded = docodeHexResponse(
				action.payload,
				'UPDATEUSERPASSWORDKEY',
			);
			return {
				...state,
				updateUserPasswordStatus: action.payload,
				updateUserPasswordResponse: updatePasswordDecoded || [],
			};

		case loginActionTypes.UPDATE_USER_PASSWORD_FAILURE:
			return {
				...state,
				updateUserPasswordStatus: action.payload,
			};

		case loginActionTypes.UPDATE_USER_PASSWORD_RESPONSE_CHANGED:
			return {
				...state,
				updateUserPasswordStatus: null,
			};

		/***************** 	UPDATE LOGIN USER PASSWORD END  *****************/
		/** ***************** GET USER COMPANY DETAILS START *********************** */
		case loginActionTypes.FETCH_USER_COMPANY_DETAILS_SUCCESS:
			const userCompanyDetailsDecoded = docodeHexResponse(
				action.payload,
				'GetUserCompanyDetailsKey',
			);
			return {
				...state,
				getUserLoginDetailsResponse: action.payload,
				getUserLoginDetailsArr: userCompanyDetailsDecoded || [],
			};

		case loginActionTypes.FETCH_USER_COMPANY_DETAILS_FAILURE:
			return {
				...state,
				getUserLoginDetailsResponse: action.payload,
				getUserLoginDetailsArr: [],
			};

		case loginActionTypes.FETCH_USER_COMPANY_DETAILS_RESPONSE_CHANGED:
			return { ...state, getUserLoginDetailsResponse: null };

		/** ***************** GET USER COMPANY DETAILS END *********************** */

		/** ***************** FETCH USER DETAILS START *********************** */
		case loginActionTypes.FETCH_USER_DETAILS_SUCCESS:
			const userDetailsDecoded = docodeHexResponse(action.payload, 'GetUserDetailsKey');
			return {
				...state,
				fetchUserDetailsResponse: action.payload,
				fetchUserDetailsArr: userDetailsDecoded || [],
			};

		case loginActionTypes.FETCH_USER_DETAILS_FAILURE:
			return {
				...state,
				fetchUserDetailsResponse: action.payload,
				fetchUserDetailsArr: [],
			};

		case loginActionTypes.FETCH_USER_DETAILS_RESPONSE_CHANGED:
			return { ...state, fetchUserDetailsResponse: null };
		/** ***************** FETCH USER DETAILS END *********************** */

		/*****************  CREATE PASSWORD RESET REQUEST START  *******************/
		case loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_SUCCESS:
		case loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_FAILURE:
			return {
				...state,
				createPasswordResetRequestResponse: action.payload,
			};

		case loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_RESPONSE_CHANGED:
			return {
				...state,
				createPasswordResetRequestResponse: null,
			};
		/***************** 	CREATE PASSWORD RESET REQUEST END  *****************/

		/*****************  GET PASSWORD RESET REQUESTS START  *******************/
		case loginActionTypes.GET_PASSWORD_RESET_REQUESTS_SUCCESS:
			// The backend returns the list under `response`. Support both an
			// encrypted-hex `response` (decoded with the request key, like other
			// list endpoints) and a plain array `response`.
			const passwordResetDecoded =
				docodeHexResponse(action.payload, 'GetPasswordResetRequestsKey') ||
				(Array.isArray(action.payload?.response) ? action.payload.response : []);
			return {
				...state,
				getPasswordResetRequestsResponse: action.payload,
				getPasswordResetRequestsArr: passwordResetDecoded || [],
			};

		case loginActionTypes.GET_PASSWORD_RESET_REQUESTS_FAILURE:
			return {
				...state,
				getPasswordResetRequestsResponse: action.payload,
				getPasswordResetRequestsArr: [],
			};

		case loginActionTypes.GET_PASSWORD_RESET_REQUESTS_RESPONSE_CHANGED:
			return {
				...state,
				getPasswordResetRequestsResponse: null,
			};
		/***************** 	GET PASSWORD RESET REQUESTS END  *****************/

		/*****************  ADMIN RESET PASSWORD START  *******************/
		case loginActionTypes.ADMIN_RESET_PASSWORD_SUCCESS:
		case loginActionTypes.ADMIN_RESET_PASSWORD_FAILURE:
			return {
				...state,
				adminResetPasswordResponse: action.payload,
			};

		case loginActionTypes.ADMIN_RESET_PASSWORD_RESPONSE_CHANGED:
			return {
				...state,
				adminResetPasswordResponse: null,
			};
		/***************** 	ADMIN RESET PASSWORD END  *****************/

		/** ***************** UPDATE USER ACCESS BRANCH START *********************** */
		case loginActionTypes.UPDATE_USER_ACCESS_BRANCH: {
			const payloadId = String(action.payload?.UserAccessBranchID ?? '');
			const payloadName = String(action.payload?.UserAccessBranchName ?? '');
			// USC #5: "All Branches" sentinel. Previously any payloadId that
			// matched no UserAccess row (e.g. 'All' or 0 for admins) cleared
			// every IsSelected flag; the login-selector then fell back to
			// UserAccess[0] (the first branch) — silently narrowing the
			// dashboard to that branch instead of showing company-wide data.
			// Track the sentinel on the top-level object so the selector can
			// short-circuit before the .find() fallback.
			const isAllScope = payloadId === 'All' || payloadId === '0' || payloadId === '';
			const mapUserAccess = (list: any[]) =>
				list.map((ua: any) => ({
					...ua,
					IsSelected: String(ua.UserAccessBranchID ?? '') === payloadId ? 1 : 0,
				}));

			const updatedLoginDetails =
				state.getUserLoginDetailsArr.length > 0 &&
				state.getUserLoginDetailsArr[0].UserAccess
					? [
							{
								...state.getUserLoginDetailsArr[0],
								UserAccess: mapUserAccess(
									state.getUserLoginDetailsArr[0].UserAccess,
								),
								__allBranchScope: isAllScope,
								__allBranchName: isAllScope ? payloadName || 'All Branches' : '',
							},
							...state.getUserLoginDetailsArr.slice(1),
						]
					: state.getUserLoginDetailsArr;

			const updatedUserDetails =
				state.fetchUserDetailsArr.length > 0 && state.fetchUserDetailsArr[0].UserAccess
					? [
							{
								...state.fetchUserDetailsArr[0],
								UserAccess: mapUserAccess(state.fetchUserDetailsArr[0].UserAccess),
								__allBranchScope: isAllScope,
								__allBranchName: isAllScope ? payloadName || 'All Branches' : '',
							},
							...state.fetchUserDetailsArr.slice(1),
						]
					: state.fetchUserDetailsArr;

			return {
				...state,
				getUserLoginDetailsArr: updatedLoginDetails,
				fetchUserDetailsArr: updatedUserDetails,
			};
		}
		/** ***************** UPDATE USER ACCESS BRANCH END *********************** */

		default:
			return state;
	}
};

export default loginReducer;
