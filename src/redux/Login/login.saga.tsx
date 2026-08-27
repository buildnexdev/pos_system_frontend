// Version : 0.0.3
// Author : Vignesh
// LastEdit : Vishal
// Last ADD : GENERAL ADMIN ID ADDED IN PAYLOAD
// MODFIED DATE : 11-08-2025

import { takeLatest, put, all, call } from 'redux-saga/effects';

import loginActionTypes from './login.types';
import {
	userSignIn,
	authUserVerification,
	forgotPasswordUpdate,
	updateUserPasswordCall,
	userCompanyLoginDetailsGet,
	fetchUserDetailsCall,
	userLoginVerificationService,
	createPasswordResetRequest,
	getPasswordResetRequests,
	adminResetPassword,
} from './login.services';
import {
	userSignInSuccess,
	userSignInFailure,
	userSignInResponseChanged,
	userSignInLogOut,
	userAuthVerifySuccess,
	userAuthVerifyFailure,
	userAuthVerifyResponseChanged,
	forgotPasswordSuccess,
	forgotPasswordFailure,
	forgotPasswordResponseChanged,
	updateUserPasswordSuccess,
	updateUserPasswordFailure,
	updateUserPasswordResponseChanged,
	fetchUserCompanyDetailsSuccess,
	fetchUserCompanyDetailsFailure,
	fetchUserCompanyDetailsResponseChanged,
	fetchUserDetailsSuccess,
	fetchUserDetailsFailure,
	fetchUserDetailsResponseChanged,
	userLoginVerificationFailure,
	userLoginVerificationSuccess,
	userLoginVerificationResponseChanged,
	userSessionCreationResponseChanged,
	userSessionCreationFailure,
	userSessionCreationSuccess,
	createPasswordResetRequestSuccess,
	createPasswordResetRequestFailure,
	createPasswordResetRequestResponseChanged,
	getPasswordResetRequestsSuccess,
	getPasswordResetRequestsFailure,
	getPasswordResetRequestsResponseChanged,
	adminResetPasswordSuccess,
	adminResetPasswordFailure,
	adminResetPasswordResponseChanged,
} from './login.action';
import { encryptData } from '../_common/enode-decode';
import AlertManager from '../../utils/alertManager';
/** ********** USER LOGIN CHECK SATRT **************** */
export function* singInWithPhoneNumber({ payload }: any) {
	try {
		const key = 'UserLoginVerify';
		const { phoneNumber, password } = payload;

		const jsonData: any = {
			UserName: phoneNumber,
			UserPassword: password,
			UserTokenID: 'null',
		};
		const loginData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(userSignIn, loginData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(userSignInFailure(responseData.data));
		} else {
			yield put(userSignInSuccess(responseData.data));
		}
	} catch (error) {
		yield put(userSignInFailure(error));
	}
}

export function* makeUserLoginReset() {
	yield put(userSignInResponseChanged());
}

export function* onPhoneSignInReset() {
	yield takeLatest(loginActionTypes.USER_SIGN_IN_RESPONSE_RESET_START, makeUserLoginReset);
}

export function* onUserSignInStart() {
	yield takeLatest(loginActionTypes.USER_SIGN_IN_START, singInWithPhoneNumber);
}
/** ********** USER LOGIN CHECK END **************** */

/** ********** USER LOGIN CHECK SATRT **************** */
export function* userLoginVerification({ payload }: any) {
	try {
		const key = 'UserLoginCheck';
		const { phoneNumber, password } = payload;

		const jsonData: any = {
			UserName: phoneNumber,
			UserPassword: password,
			UserTokenID: 'null',
		};
		const loginData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(userLoginVerificationService, loginData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(userLoginVerificationFailure(responseData.data));
		} else {
			yield put(userLoginVerificationSuccess(responseData.data));
		}
	} catch (error) {
		yield put(userLoginVerificationFailure(error));
	}
}

export function* makeUserLoginVerificationReset() {
	yield put(userLoginVerificationResponseChanged());
}

export function* onUserLoginVerificationReset() {
	yield takeLatest(
		loginActionTypes.USER_SIGN_IN_VERIFICATION_RESPONSE_RESET_START,
		makeUserLoginVerificationReset,
	);
}

export function* onUserLoginVerificationStart() {
	yield takeLatest(loginActionTypes.USER_SIGN_IN_VERIFICATION_START, userLoginVerification);
}
/** ********** USER LOGIN CHECK END **************** */

/** ********** USER SESSION CREATION START **************** */
export function* userSessionCreation({ payload }: any) {
	try {
		const key = 'UserLoginCheck';
		const { phoneNumber, password } = payload;

		const jsonData: any = {
			UserName: phoneNumber,
			UserPassword: password,
			UserTokenID: 'null',
		};
		const loginData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(userSessionCreationService, loginData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(userSessionCreationFailure(responseData.data));
		} else {
			yield put(userSessionCreationSuccess(responseData.data));
		}
	} catch (error) {
		yield put(userSessionCreationFailure(error));
	}
}

export function* makeSessionCreationReset() {
	yield put(userSessionCreationResponseChanged());
}

export function* onSessionCreationReset() {
	yield takeLatest(
		loginActionTypes.USER_SIGN_IN_SESSION_CREATION_RESPONSE_RESET_START,
		makeSessionCreationReset,
	);
}

export function* onSessionCreationStart() {
	yield takeLatest(loginActionTypes.USER_SIGN_IN_SESSION_CREATION_START, userSessionCreation);
}
/** ********** USER SESSION CREATION END **************** */

/** ********** USER LOGIN AUTH VERIFY CHECK SATRT **************** */
export function* verifyGoogleAuth({ payload }: any) {
	try {
		const { secrateAuth, authKeyNumber, loginUserID, staffID } = payload;
		const key = 'LoginAuth';
		const jsonData: any = {
			secrateAuth,
			authKeyNumber,
			userID: loginUserID,
			staffID,
		};
		const authVerifyData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(authUserVerification, authVerifyData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(userAuthVerifyFailure(responseData.data));
		} else {
			yield put(userAuthVerifySuccess(responseData.data));
		}
	} catch (error) {
		yield put(userAuthVerifyFailure(error));
	}
}

export function* googleAuthVerifyReset() {
	yield put(userAuthVerifyResponseChanged());
}

export function* onAuthVerifyReset() {
	yield takeLatest(loginActionTypes.USER_AUTH_VERIFY_RESPONSE_RESET_START, googleAuthVerifyReset);
}

export function* onAuthVerifyStart() {
	yield takeLatest(loginActionTypes.USER_AUTH_VERIFY_START, verifyGoogleAuth);
}
/** ********** USER LOGIN AUTH VERIFY CHECK END **************** */

/** *********LOGOUT *************** */
export function* makeUserSignInLogout() {
	yield put(userSignInLogOut());
}

export function* userSignInLogout() {
	yield takeLatest(loginActionTypes.USER_SIGN_OUT_START, makeUserSignInLogout);
}

/** *********************  START Forgot Password DETAILS  ******************** */
export function* forgotPasswordDetails({ payload }: any) {
	try {
		const key = 'ForgotPassKey';
		const { mobileNumber } = payload;

		const jsonData: any = {
			UserName: mobileNumber,
		};
		const ForgotData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(forgotPasswordUpdate, ForgotData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(forgotPasswordFailure(responseData.data));
		} else {
			yield put(forgotPasswordSuccess(responseData.data));
		}
	} catch (error) {
		yield put(forgotPasswordFailure(error));
	}
}

export function* resetForgotPasswordResponse() {
	yield put(forgotPasswordResponseChanged());
}

export function* onForgotPasswordDetails() {
	yield takeLatest(loginActionTypes.FETCH_FORGOT_PASSWORD_START, forgotPasswordDetails);
}

export function* onForgotPasswordDetailsResponseReset() {
	yield takeLatest(
		loginActionTypes.FETCH_FORGOT_PASSWORD_RESPONSE_RESET_START,
		resetForgotPasswordResponse,
	);
}
/** *********************  END ADD Forgotpassword DETAILS ******************** */

/** *********************  START USER PASSWORD DETAILS  ******************** */
export function* updateUserPasswordDetails({ payload }: any) {
	try {
		const key = 'UPDATEUSERPASSWORDKEY';
		const {
			databaseName,
			companyID,
			userID,
			generalAdminID,
			userName,
			userPhoneNumber,
			confirmPassword,
		} = payload;
		const jsonData = {
			DatabaseName: databaseName,
			CompanyID: companyID,
			UserID: userID,
			UserName: userName,
			UserPhoneNumber: userPhoneNumber,
			GeneralUserID: generalAdminID,
			ConfirmPassword: confirmPassword,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(updateUserPasswordCall, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(updateUserPasswordFailure(responseData.data));
		} else {
			yield put(updateUserPasswordSuccess(responseData.data));
		}
	} catch (error) {
		yield put(updateUserPasswordFailure(error));
	}
}

export function* resetUpdateUserPasswordResponse() {
	yield put(updateUserPasswordResponseChanged());
}

export function* onUpdateUserPassword() {
	yield takeLatest(loginActionTypes.UPDATE_USER_PASSWORD_START, updateUserPasswordDetails);
}

export function* onUpdateUserPasswordResponseReset() {
	yield takeLatest(
		loginActionTypes.UPDATE_USER_PASSWORD_RESPONSE_RESET_START,
		resetUpdateUserPasswordResponse,
	);
}
/** *********************  END USER PASSWORD DETAILS ******************** */

/** *********************  START USER DETAILS LIST  ******************** */
export function* getUserCompanyDetails({ payload }: any) {
	try {
		const {
			databaseName,
			companyID,
			userID,
			roleID,
			roleName,
			phonenumber,
			generalCompanyID,
			generalAdminID,
		} = payload;

		const key = 'GetUserCompanyDetailsKey';
		const jsonData = {
			DatabaseName: databaseName,
			CompanyID: companyID,
			UserID: userID,
			RoleID: roleID,
			RoleName: roleName,
			PhoneNumber: phonenumber,
			GeneralCompanyID: generalCompanyID,
			GeneralAdminID: generalAdminID,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(userCompanyLoginDetailsGet, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(fetchUserCompanyDetailsFailure(responseData.data));
		} else {
			yield put(fetchUserCompanyDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(fetchUserCompanyDetailsFailure(error));
	}
}

export function* resetUserCompanyDetailsResponse() {
	yield put(fetchUserCompanyDetailsResponseChanged());
}

export function* onGetUserCompanyDetails() {
	yield takeLatest(loginActionTypes.FETCH_USER_COMPANY_DETAILS_START, getUserCompanyDetails);
}

export function* onGetUserCompanyDetailsResponseReset() {
	yield takeLatest(
		loginActionTypes.FETCH_USER_COMPANY_DETAILS_RESPONSE_RESET_START,
		resetUserCompanyDetailsResponse,
	);
}

/** *********************  END USER DETAILS LIST  ******************** */

/** *********************  START FETCH USER DETAILS  ******************** */
export function* fetchUserDetails({ payload }: any) {
	try {
		const { databaseName, userID } = payload;

		const key = 'GetUserDetailsKey';
		const jsonData = {
			DatabaseName: databaseName,
			UserID: userID,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(fetchUserDetailsCall, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(fetchUserDetailsFailure(responseData.data));
		} else {
			yield put(fetchUserDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(fetchUserDetailsFailure(error));
	}
}

export function* resetFetchUserDetailsResponse() {
	yield put(fetchUserDetailsResponseChanged());
}

export function* onFetchUserDetails() {
	yield takeLatest(loginActionTypes.FETCH_USER_DETAILS_START, fetchUserDetails);
}

export function* onFetchUserDetailsResponseReset() {
	yield takeLatest(
		loginActionTypes.FETCH_USER_DETAILS_RESPONSE_RESET_START,
		resetFetchUserDetailsResponse,
	);
}
/** *********************  END FETCH USER DETAILS  ******************** */

/** *********************  START CREATE PASSWORD RESET REQUEST  ******************** */
export function* createPasswordResetRequestDetails({ payload }: any) {
	try {
		const key = 'CreatePasswordResetRequestKey';
		const { userPhoneNumber } = payload;

		const jsonData: any = {
			UserPhoneNumber: userPhoneNumber,
		};
		const requestData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(createPasswordResetRequest, requestData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(createPasswordResetRequestFailure(responseData.data));
		} else {
			yield put(createPasswordResetRequestSuccess(responseData.data));
		}
	} catch (error) {
		yield put(createPasswordResetRequestFailure(error));
	}
}

export function* resetCreatePasswordResetRequestResponse() {
	yield put(createPasswordResetRequestResponseChanged());
}

export function* onCreatePasswordResetRequest() {
	yield takeLatest(
		loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_START,
		createPasswordResetRequestDetails,
	);
}

export function* onCreatePasswordResetRequestResponseReset() {
	yield takeLatest(
		loginActionTypes.CREATE_PASSWORD_RESET_REQUEST_RESPONSE_RESET_START,
		resetCreatePasswordResetRequestResponse,
	);
}
/** *********************  END CREATE PASSWORD RESET REQUEST  ******************** */

/** *********************  START GET PASSWORD RESET REQUESTS  ******************** */
export function* getPasswordResetRequestsDetails() {
	try {
		const key = 'GetPasswordResetRequestsKey';
		const jsonData: any = {};
		const listData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(getPasswordResetRequests, listData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(getPasswordResetRequestsFailure(responseData.data));
		} else {
			yield put(getPasswordResetRequestsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(getPasswordResetRequestsFailure(error));
	}
}

export function* resetGetPasswordResetRequestsResponse() {
	yield put(getPasswordResetRequestsResponseChanged());
}

export function* onGetPasswordResetRequests() {
	yield takeLatest(
		loginActionTypes.GET_PASSWORD_RESET_REQUESTS_START,
		getPasswordResetRequestsDetails,
	);
}

export function* onGetPasswordResetRequestsResponseReset() {
	yield takeLatest(
		loginActionTypes.GET_PASSWORD_RESET_REQUESTS_RESPONSE_RESET_START,
		resetGetPasswordResetRequestsResponse,
	);
}
/** *********************  END GET PASSWORD RESET REQUESTS  ******************** */

/** *********************  START ADMIN RESET PASSWORD  ******************** */
export function* adminResetPasswordDetails({ payload }: any) {
	try {
		const key = 'AdminResetPasswordKey';
		const { requestID, newPassword } = payload;

		const jsonData: any = {
			RequestID: requestID,
			NewPassword: newPassword,
		};
		const resetData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(adminResetPassword, resetData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(adminResetPasswordFailure(responseData.data));
		} else {
			yield put(adminResetPasswordSuccess(responseData.data));
		}
	} catch (error) {
		yield put(adminResetPasswordFailure(error));
	}
}

export function* resetAdminResetPasswordResponse() {
	yield put(adminResetPasswordResponseChanged());
}

export function* onAdminResetPassword() {
	yield takeLatest(loginActionTypes.ADMIN_RESET_PASSWORD_START, adminResetPasswordDetails);
}

export function* onAdminResetPasswordResponseReset() {
	yield takeLatest(
		loginActionTypes.ADMIN_RESET_PASSWORD_RESPONSE_RESET_START,
		resetAdminResetPasswordResponse,
	);
}
/** *********************  END ADMIN RESET PASSWORD  ******************** */

export function* loginSaga() {
	yield all([
		call(onUserSignInStart),
		call(userSignInLogout),
		call(onPhoneSignInReset),
		call(onAuthVerifyReset),
		call(onAuthVerifyStart),
		call(onForgotPasswordDetails),
		call(onForgotPasswordDetailsResponseReset),
		call(onUpdateUserPassword),
		call(onUpdateUserPasswordResponseReset),
		call(onGetUserCompanyDetails),
		call(onGetUserCompanyDetailsResponseReset),
		call(onFetchUserDetails),
		call(onFetchUserDetailsResponseReset),
		call(onUserLoginVerificationStart),
		call(onUserLoginVerificationReset),
		call(onCreatePasswordResetRequest),
		call(onCreatePasswordResetRequestResponseReset),
		call(onGetPasswordResetRequests),
		call(onGetPasswordResetRequestsResponseReset),
		call(onAdminResetPassword),
		call(onAdminResetPasswordResponseReset),
	]);
}
