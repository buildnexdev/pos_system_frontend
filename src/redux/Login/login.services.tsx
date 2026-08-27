// Version : 0.0.3
// Author : Vignesh
import axios from 'axios';
import { makeApiCall } from '../_common/api.utils';
import { getTokenFromRedux, resolveFinanceApiUrl } from '../_common/common.utils';
import { API_URL } from '../const';

/** ************** USER SIGNIN START *************** */

export const userSignIn = (loginData: JSON) => {
	const data = {
		userLoginDataToken: loginData,
	};
	const url = `${API_URL}userLoginVerify`;
	return makeApiCall(url, data);
};

export const userLoginVerificationService = (loginData: JSON) => {
	const data = {
		userLoginVerification: loginData,
	};
	const url = `${API_URL}userLoginCheck`;
	return makeApiCall(url, data);
};

/** ************** USER SIGNIN END *************** */

/** ************** USER AUTH CHECK START *************** */
export const authUserVerification = (authLogVerifiy: JSON) => {
	const data = {
		UserCheckAuth: authLogVerifiy,
	};
	const url = `${API_URL}userAuthVerification`;
	return makeApiCall(url, data);
};
/** ************** USER AUTH CHECK END *************** */

/** ************** FORGOT PASSWORD START *************** */
export const forgotPasswordUpdate = (forgotData: JSON) => {
	const data = {
		forgotPasswordToken: forgotData,
	};
	const url = `${API_URL}verifyForgotPassword`;
	return makeApiCall(url, data);
};
/** ************** FORGOT PASSWORD END *************** */

/** ************** UPDATE USER PASSWORD START *************** */
export const updateUserPasswordCall = (encodeData: JSON) => {
	const data = {
		UpdateUserPasswordToken: encodeData,
	};
	const url = `${API_URL}updateLoginUserPassword`;
	return makeApiCall(url, data);
};
/** ************** UPDATE USER PASSWORD END *************** */

/** ************** UPDATE COMPANY LOGIN DETAILS START *************** */
export const userCompanyLoginDetailsGet = (listData: any) => {
	const data = {
		GetCompanyLoginDetailsToken: listData,
	};
	const url = `${API_URL}fetchLoginCompanyDetails`;
	return makeApiCall(url, data);
};
/** ************** UPDATE COMPANY LOGIN DETAILS END *************** */

/** ************** FETCH USER DETAILS START *************** */
export const fetchUserDetailsCall = (userDetailsData: any) => {
	const data = {
		FetchUserDetailsToken: userDetailsData,
	};
	const url = `${API_URL}fetchUserDetails`;
	return makeApiCall(url, data);
};
/** ************** FETCH USER DETAILS END *************** */

/** ************** CREATE PASSWORD RESET REQUEST START *************** */
// No-auth: a logged-out user raises a reset request with just their mobile number.
export const createPasswordResetRequest = (requestData: any) => {
	const data = {
		CreatePasswordResetRequestToken: requestData,
	};
	const url = `${API_URL}createPasswordResetRequest`;
	return makeApiCall(url, data);
};
/** ************** CREATE PASSWORD RESET REQUEST END *************** */

/**
 * These two admin-only endpoints self-enforce auth on the server (the backend
 * AuthMiddleware is globally bypassed), so they must receive the login JWT as an
 * explicit `Authorization: Bearer <token>` header. The shared `makeApiCall` omits
 * that header (USE_AUTH_TOKEN is globally off), so these calls go through axios
 * directly — mirroring makeApiCall's config, but with the bearer token attached.
 */
const makeAuthenticatedApiCall = (url: string, data: any) => {
	const token = getTokenFromRedux();
	return axios({
		method: 'POST',
		url: resolveFinanceApiUrl(url),
		data,
		headers: {
			'Content-type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});
};

/** ************** GET PASSWORD RESET REQUESTS START *************** */
// Auth-required (super-admin only): send the login JWT explicitly.
export const getPasswordResetRequests = (listData: any) => {
	const data = {
		GetPasswordResetRequestsToken: listData,
	};
	const url = `${API_URL}getPasswordResetRequests`;
	return makeAuthenticatedApiCall(url, data);
};
/** ************** GET PASSWORD RESET REQUESTS END *************** */

/** ************** ADMIN RESET PASSWORD START *************** */
// Auth-required (super-admin only): send the login JWT explicitly.
export const adminResetPassword = (resetData: any) => {
	const data = {
		AdminResetPasswordToken: resetData,
	};
	const url = `${API_URL}adminResetPassword`;
	return makeAuthenticatedApiCall(url, data);
};
/** ************** ADMIN RESET PASSWORD END *************** */
