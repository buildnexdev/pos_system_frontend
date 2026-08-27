// Version : 0.0.3
// Author : Vignesh

import loginActionTypes from './login.types';

export const userLoginTimeChangeStart = (authCheck: any) => ({
	type: loginActionTypes.USER_LOGIN_TIME_CHANGED,
	payload: authCheck,
});

export const authCheckDoneChangeStart = (authCheck: any) => ({
	type: loginActionTypes.USER_AUTH_CHECK_DONE_CHANGED,
	payload: authCheck,
});

/** ********** USER LOGIN CHECK SATRT **************** */
export const userSignInStart = (userCredentials: any) => ({
	type: loginActionTypes.USER_SIGN_IN_START,
	payload: userCredentials,
});

export const userSignInSuccess = (user: any) => ({
	type: loginActionTypes.USER_SIGN_IN_SUCCESS,
	payload: user,
});

export const userSignInFailure = (error: any) => ({
	type: loginActionTypes.USER_SIGN_IN_FAILURE,
	payload: error,
});

export const userSignInResponseResetStart = () => ({
	type: loginActionTypes.USER_SIGN_IN_RESPONSE_RESET_START,
});

export const userSignInResponseChanged = () => ({
	type: loginActionTypes.USER_SIGN_IN_RESPONSE_CHANGED,
});
/** ********** USER LOGIN CHECK END **************** */

/** ********** USER LOGIN VERIFICATION START **************** */
export const userLoginVerificationStart = (userCredentials: any) => ({
	type: loginActionTypes.USER_SIGN_IN_VERIFICATION_START,
	payload: userCredentials,
});

export const userLoginVerificationSuccess = (user: any) => ({
	type: loginActionTypes.USER_SIGN_IN_VERIFICATION_SUCCESS,
	payload: user,
});

export const userLoginVerificationFailure = (error: any) => ({
	type: loginActionTypes.USER_SIGN_IN_VERIFICATION_FAILURE,
	payload: error,
});

export const userLoginVerificationResponseResetStart = () => ({
	type: loginActionTypes.USER_SIGN_IN_VERIFICATION_RESPONSE_RESET_START,
});

export const userLoginVerificationResponseChanged = () => ({
	type: loginActionTypes.USER_SIGN_IN_VERIFICATION_RESPONSE_CHANGED,
});
/** ********** USER LOGIN VERIFICATION END **************** */

/** ********** USER LOGIN VERIFICATION START **************** */
export const userSessionCreationStart = (userCredentials: any) => ({
	type: loginActionTypes.USER_SIGN_IN_SESSION_CREATION_START,
	payload: userCredentials,
});

export const userSessionCreationSuccess = (user: any) => ({
	type: loginActionTypes.USER_SIGN_IN_SESSION_CREATION_SUCCESS,
	payload: user,
});

export const userSessionCreationFailure = (error: any) => ({
	type: loginActionTypes.USER_SIGN_IN_SESSION_CREATION_FAILURE,
	payload: error,
});

export const userSessionCreationResponseResetStart = () => ({
	type: loginActionTypes.USER_SIGN_IN_SESSION_CREATION_RESPONSE_RESET_START,
});

export const userSessionCreationResponseChanged = () => ({
	type: loginActionTypes.USER_SIGN_IN_SESSION_CREATION_RESPONSE_CHANGED,
});
/** ********** USER LOGIN VERIFICATION END **************** */

/** ********** USER LOGOUT SATRT **************** */
export const userSignInLogOutStart = () => ({
	type: loginActionTypes.USER_SIGN_OUT_START,
});

export const userSignInLogOut = () => ({
	type: loginActionTypes.USER_SIGN_OUT,
});
/** ********** USER LOGOUT SATRT **************** */

/** ********** USER AUTH CODE CHECK SATRT **************** */
export const userAuthVerifyStart = (userCredentials: any) => ({
	type: loginActionTypes.USER_AUTH_VERIFY_START,
	payload: userCredentials,
});

export const userAuthVerifySuccess = (user: any) => ({
	type: loginActionTypes.USER_AUTH_VERIFY_SUCCESS,
	payload: user,
});

export const userAuthVerifyFailure = (error: any) => ({
	type: loginActionTypes.USER_AUTH_VERIFY_FAILURE,
	payload: error,
});

export const userAuthVerifyResponseResetStart = () => ({
	type: loginActionTypes.USER_AUTH_VERIFY_RESPONSE_RESET_START,
});

export const userAuthVerifyResponseChanged = () => ({
	type: loginActionTypes.USER_AUTH_VERIFY_RESPONSE_CHANGED,
});

/** ********** USER AUTH CODE CHECK END **************** */

/*****************  FORGOT PASSWORD START  *******************/
export const forgotPasswordStart = (userCredentials: any) => ({
	type: loginActionTypes.FETCH_FORGOT_PASSWORD_START,
	payload: userCredentials,
});

export const forgotPasswordSuccess = (user: any) => ({
	type: loginActionTypes.FETCH_FORGOT_PASSWORD_SUCCESS,
	payload: user,
});

export const forgotPasswordFailure = (error: any) => ({
	type: loginActionTypes.FETCH_FORGOT_PASSWORD_FAILURE,
	payload: error,
});

export const forgotPasswordResponseResetStart = () => ({
	type: loginActionTypes.FETCH_FORGOT_PASSWORD_RESPONSE_RESET_START,
});

export const forgotPasswordResponseChanged = () => ({
	type: loginActionTypes.FETCH_FORGOT_PASSWORD_RESPONSE_CHANGED,
});
/***************** 	FORGOT PASSWORD END  *****************/

/*****************  UPDATE LOGIN USER PASSWORD START  *******************/
export const updateUserPasswordStart = (userCredentials: any) => ({
	type: loginActionTypes.UPDATE_USER_PASSWORD_START,
	payload: userCredentials,
});

export const updateUserPasswordSuccess = (user: any) => ({
	type: loginActionTypes.UPDATE_USER_PASSWORD_SUCCESS,
	payload: user,
});

export const updateUserPasswordFailure = (error: any) => ({
	type: loginActionTypes.UPDATE_USER_PASSWORD_FAILURE,
	payload: error,
});

export const updateUserPasswordResponseReset = () => ({
	type: loginActionTypes.UPDATE_USER_PASSWORD_RESPONSE_RESET_START,
});

export const updateUserPasswordResponseChanged = () => ({
	type: loginActionTypes.UPDATE_USER_PASSWORD_RESPONSE_CHANGED,
});
/***************** 	UPDATE LOGIN USER PASSWORD END  *****************/

/** ***************** GET USER COMPANY DETAILS START *********************** */
export const fetchUserCompanyDetailsStart = (getData: any) => ({
	type: loginActionTypes.FETCH_USER_COMPANY_DETAILS_START,
	payload: getData,
});

export const fetchUserCompanyDetailsSuccess = (successData: any) => ({
	type: loginActionTypes.FETCH_USER_COMPANY_DETAILS_SUCCESS,
	payload: successData,
});

export const fetchUserCompanyDetailsFailure = (failureData: any) => ({
	type: loginActionTypes.FETCH_USER_COMPANY_DETAILS_FAILURE,
	payload: failureData,
});

export const fetchUserCompanyDetailsResponseResetStart = () => ({
	type: loginActionTypes.FETCH_USER_COMPANY_DETAILS_RESPONSE_RESET_START,
});

export const fetchUserCompanyDetailsResponseChanged = () => ({
	type: loginActionTypes.FETCH_USER_COMPANY_DETAILS_RESPONSE_CHANGED,
});
/** ***************** GET USER COMPANY DETAILS END *********************** */

/** ***************** FETCH USER DETAILS START *********************** */
export const fetchUserDetailsStart = (getData: any) => ({
	type: loginActionTypes.FETCH_USER_DETAILS_START,
	payload: getData,
});

export const fetchUserDetailsSuccess = (successData: any) => ({
	type: loginActionTypes.FETCH_USER_DETAILS_SUCCESS,
	payload: successData,
});

export const fetchUserDetailsFailure = (failureData: any) => ({
	type: loginActionTypes.FETCH_USER_DETAILS_FAILURE,
	payload: failureData,
});

export const fetchUserDetailsResponseResetStart = () => ({
	type: loginActionTypes.FETCH_USER_DETAILS_RESPONSE_RESET_START,
});

export const fetchUserDetailsResponseChanged = () => ({
	type: loginActionTypes.FETCH_USER_DETAILS_RESPONSE_CHANGED,
});
/** ***************** FETCH USER DETAILS END *********************** */

/** ***************** UPDATE USER ACCESS BRANCH START *********************** */
export const updateUserAccessBranchStart = (branchData: any) => ({
	type: loginActionTypes.UPDATE_USER_ACCESS_BRANCH,
	payload: branchData,
});
/** ***************** UPDATE USER ACCESS BRANCH END *********************** */

/*****************  CREATE PASSWORD RESET REQUEST START  *******************/
export const createPasswordResetRequestStart = (requestData: any) => ({
	type: loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_START,
	payload: requestData,
});

export const createPasswordResetRequestSuccess = (successData: any) => ({
	type: loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_SUCCESS,
	payload: successData,
});

export const createPasswordResetRequestFailure = (failureData: any) => ({
	type: loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_FAILURE,
	payload: failureData,
});

export const createPasswordResetRequestResponseResetStart = () => ({
	type: loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_RESPONSE_RESET_START,
});

export const createPasswordResetRequestResponseChanged = () => ({
	type: loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_RESPONSE_CHANGED,
});
/***************** 	CREATE PASSWORD RESET REQUEST END  *****************/

/*****************  GET PASSWORD RESET REQUESTS START  *******************/
export const getPasswordResetRequestsStart = (getData?: any) => ({
	type: loginActionTypes.GET_PASSWORD_RESET_REQUESTS_START,
	payload: getData,
});

export const getPasswordResetRequestsSuccess = (successData: any) => ({
	type: loginActionTypes.GET_PASSWORD_RESET_REQUESTS_SUCCESS,
	payload: successData,
});

export const getPasswordResetRequestsFailure = (failureData: any) => ({
	type: loginActionTypes.GET_PASSWORD_RESET_REQUESTS_FAILURE,
	payload: failureData,
});

export const getPasswordResetRequestsResponseResetStart = () => ({
	type: loginActionTypes.GET_PASSWORD_RESET_REQUESTS_RESPONSE_RESET_START,
});

export const getPasswordResetRequestsResponseChanged = () => ({
	type: loginActionTypes.GET_PASSWORD_RESET_REQUESTS_RESPONSE_CHANGED,
});
/***************** 	GET PASSWORD RESET REQUESTS END  *****************/

/*****************  ADMIN RESET PASSWORD START  *******************/
export const adminResetPasswordStart = (resetData: any) => ({
	type: loginActionTypes.ADMIN_RESET_PASSWORD_START,
	payload: resetData,
});

export const adminResetPasswordSuccess = (successData: any) => ({
	type: loginActionTypes.ADMIN_RESET_PASSWORD_SUCCESS,
	payload: successData,
});

export const adminResetPasswordFailure = (failureData: any) => ({
	type: loginActionTypes.ADMIN_RESET_PASSWORD_FAILURE,
	payload: failureData,
});

export const adminResetPasswordResponseResetStart = () => ({
	type: loginActionTypes.ADMIN_RESET_PASSWORD_RESPONSE_RESET_START,
});

export const adminResetPasswordResponseChanged = () => ({
	type: loginActionTypes.ADMIN_RESET_PASSWORD_RESPONSE_CHANGED,
});
/***************** 	ADMIN RESET PASSWORD END  *****************/
