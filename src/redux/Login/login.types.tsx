// Version : 0.0.3
// Author : Vignesh
const loginActionTypes = {
	USER_LOGIN_TIME_CHANGED: 'user_login_time_changed',
	USER_AUTH_CHECK_DONE_CHANGED: 'user_auth_check_done_changed',

	/***************  USER LOGIN START  ******************/
	USER_SIGN_IN_START: 'user_sign_in_start',
	USER_SIGN_IN_SUCCESS: 'user_sign_in_success',
	USER_SIGN_IN_FAILURE: 'user_sign_in_failure',
	USER_SIGN_IN_RESPONSE_RESET_START: 'user_sign_in_response_reset_start',
	USER_SIGN_IN_RESPONSE_CHANGED: 'user_sign_in_response_changed',
	/***************  USER LOGIN END  ******************/

	/***************  USER LOGIN VERIFICATION START  ******************/
	USER_SIGN_IN_VERIFICATION_START: 'user_sign_in_verification_start',
	USER_SIGN_IN_VERIFICATION_SUCCESS: 'user_sign_in_verification_success',
	USER_SIGN_IN_VERIFICATION_FAILURE: 'user_sign_in_verification_failure',
	USER_SIGN_IN_VERIFICATION_RESPONSE_RESET_START:
		'user_sign_in_verification_response_reset_start',
	USER_SIGN_IN_VERIFICATION_RESPONSE_CHANGED: 'user_sign_in_verification_response_changed',
	/***************  USER LOGIN VERIFICATION END  ******************/

	/***************  USER LOGIN VERIFICATION START  ******************/
	USER_SIGN_IN_SESSION_CREATION_START: 'user_sign_in_session_creation_start',
	USER_SIGN_IN_SESSION_CREATION_SUCCESS: 'user_sign_in_session_creation_success',
	USER_SIGN_IN_SESSION_CREATION_FAILURE: 'user_sign_in_session_creation_failure',
	USER_SIGN_IN_SESSION_CREATION_RESPONSE_RESET_START:
		'user_sign_in_session_creation_response_reset_start',
	USER_SIGN_IN_SESSION_CREATION_RESPONSE_CHANGED:
		'user_sign_in_session_creation_response_changed',
	/***************  USER LOGIN VERIFICATION END  ******************/

	USER_SIGN_OUT_START: 'user_sign_out_start',
	USER_SIGN_OUT: 'user_sign_out',

	/*****************  USER AUTH VERIFY START  *******************/
	USER_AUTH_VERIFY_START: 'user_auth_verify_start',
	USER_AUTH_VERIFY_SUCCESS: 'user_auth_verify_success',
	USER_AUTH_VERIFY_FAILURE: 'user_auth_verify_failure',
	USER_AUTH_VERIFY_RESPONSE_RESET_START: 'user_auth_verify_response_reset_start',
	USER_AUTH_VERIFY_RESPONSE_CHANGED: 'user_auth_verify_response_changed',
	/***************** 	USER AUTH VERIFY END  *****************/

	/*****************  FORGOT PASSWORD START  *******************/
	FETCH_FORGOT_PASSWORD_START: 'fetch_forgot_password_start',
	FETCH_FORGOT_PASSWORD_SUCCESS: 'fetch_forgot_password_success',
	FETCH_FORGOT_PASSWORD_FAILURE: 'fetch_forgot_password_failure',
	FETCH_FORGOT_PASSWORD_RESPONSE_RESET_START: 'fetch_forgot_password_response_reset_start',
	FETCH_FORGOT_PASSWORD_RESPONSE_CHANGED: 'fetch_forgot_password_response_changed',
	/***************** 	FORGOT PASSWORD END  *****************/

	/*****************  UPDATE LOGIN USER PASSWORD START  *******************/
	UPDATE_USER_PASSWORD_START: 'update_user_password_start',
	UPDATE_USER_PASSWORD_SUCCESS: 'update_user_password_success',
	UPDATE_USER_PASSWORD_FAILURE: 'update_user_password_failure',
	UPDATE_USER_PASSWORD_RESPONSE_RESET_START: 'update_user_password_response_reset_start',
	UPDATE_USER_PASSWORD_RESPONSE_CHANGED: 'update_user_password_response_changed',
	/***************** 	UPDATE LOGIN USER PASSWORD END  *****************/

	/** ***************** GET USER COMPANY DETAILS START *********************** */
	FETCH_USER_COMPANY_DETAILS_START: 'fetch_user_company_details_start',
	FETCH_USER_COMPANY_DETAILS_SUCCESS: 'fetch_user_company_details_success',
	FETCH_USER_COMPANY_DETAILS_FAILURE: 'fetch_user_company_details_failure',
	FETCH_USER_COMPANY_DETAILS_RESPONSE_RESET_START:
		'fetch_user_company_details_response_reset_start',
	FETCH_USER_COMPANY_DETAILS_RESPONSE_CHANGED: 'fetch_user_company_details_response_changed',
	/** ***************** GET USER COMPANY DETAILS END *********************** */

	/** ***************** FETCH USER DETAILS START *********************** */
	FETCH_USER_DETAILS_START: 'fetch_user_details_start',
	FETCH_USER_DETAILS_SUCCESS: 'fetch_user_details_success',
	FETCH_USER_DETAILS_FAILURE: 'fetch_user_details_failure',
	FETCH_USER_DETAILS_RESPONSE_RESET_START: 'fetch_user_details_response_reset_start',
	FETCH_USER_DETAILS_RESPONSE_CHANGED: 'fetch_user_details_response_changed',
	/** ***************** FETCH USER DETAILS END *********************** */

	/** ***************** UPDATE USER ACCESS BRANCH START *********************** */
	UPDATE_USER_ACCESS_BRANCH: 'update_user_access_branch',
	/** ***************** UPDATE USER ACCESS BRANCH END *********************** */

	/*****************  CREATE PASSWORD RESET REQUEST START  *******************/
	CREATE_PASSWORD_RESET_REQUEST_START: 'create_password_reset_request_start',
	CREATE_PASSWORD_RESET_REQUEST_SUCCESS: 'create_password_reset_request_success',
	CREATE_PASSWORD_RESET_REQUEST_FAILURE: 'create_password_reset_request_failure',
	CREATE_PASSWORD_RESET_REQUEST_RESPONSE_RESET_START:
		'create_password_reset_request_response_reset_start',
	CREATE_PASSWORD_RESET_REQUEST_RESPONSE_CHANGED:
		'create_password_reset_request_response_changed',
	/***************** 	CREATE PASSWORD RESET REQUEST END  *****************/

	/*****************  GET PASSWORD RESET REQUESTS START  *******************/
	GET_PASSWORD_RESET_REQUESTS_START: 'get_password_reset_requests_start',
	GET_PASSWORD_RESET_REQUESTS_SUCCESS: 'get_password_reset_requests_success',
	GET_PASSWORD_RESET_REQUESTS_FAILURE: 'get_password_reset_requests_failure',
	GET_PASSWORD_RESET_REQUESTS_RESPONSE_RESET_START:
		'get_password_reset_requests_response_reset_start',
	GET_PASSWORD_RESET_REQUESTS_RESPONSE_CHANGED: 'get_password_reset_requests_response_changed',
	/***************** 	GET PASSWORD RESET REQUESTS END  *****************/

	/*****************  ADMIN RESET PASSWORD START  *******************/
	ADMIN_RESET_PASSWORD_START: 'admin_reset_password_start',
	ADMIN_RESET_PASSWORD_SUCCESS: 'admin_reset_password_success',
	ADMIN_RESET_PASSWORD_FAILURE: 'admin_reset_password_failure',
	ADMIN_RESET_PASSWORD_RESPONSE_RESET_START: 'admin_reset_password_response_reset_start',
	ADMIN_RESET_PASSWORD_RESPONSE_CHANGED: 'admin_reset_password_response_changed',
	/***************** 	ADMIN RESET PASSWORD END  *****************/
};
export default loginActionTypes;
