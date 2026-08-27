
// Author : Nandhakumar
// Version :0.0.1

const BranchActionTypes = {
	/** ***************** ADD BRANCH DETAILS START *********************** */
	ADD_BRANCH_DETAILS_START: 'add_branch_details_start',
	ADD_BRANCH_DETAILS_SUCCESS: 'add_branch_details_success',
	ADD_BRANCH_DETAILS_FAILURE: 'add_branch_details_failure',
	ADD_BRANCH_DETAILS_RESPONSE_RESET: 'add_branch_details_response_reset',
	ADD_BRANCH_DETAILS_RESPONSE_CHANGED: 'add_branch_details_response_changed',
	/** ***************** ADD BRANCH DETAILS END *********************** */

	/** ***************** UPDATE BRANCH DETAILS START *********************** */
	UPDATE_BRANCH_DETAILS_START: 'update_branch_details_start',
	UPDATE_BRANCH_DETAILS_SUCCESS: 'update_branch_details_success',
	UPDATE_BRANCH_DETAILS_FAILURE: 'update_branch_details_failure',
	UPDATE_BRANCH_DETAILS_RESPONSE_RESET: 'update_branch_details_response_reset',
	UPDATE_BRANCH_DETAILS_RESPONSE_CHANGED: 'update_branch_details_response_changed',
	/** ***************** UPDATE BRANCH DETAILS END *********************** */

	/** ***************** GET BRANCH DETAILS START *********************** */
	GET_BRANCH_LIST_START: 'get_branch_list_start',
	GET_BRANCH_LIST_SUCCESS: 'get_branch_list_success',
	GET_BRANCH_LIST_FAILURE: 'get_branch_list_failure',
	GET_BRANCH_LIST_RESPONSE_RESET: 'get_branch_list_response_reset',
	GET_BRANCH_LIST_RESPONSE_CHANGED: 'get_branch_list_response_changed',
	/** ***************** GET BRANCH DETAILS END *********************** */

	/** ***************** FETCH BRANCH DETAILS START *********************** */
	FETCH_BRANCH_DETAILS_START: 'fetch_branch_details_start',
	FETCH_BRANCH_DETAILS_SUCCESS: 'fetch_branch_details_success',
	FETCH_BRANCH_DETAILS_FAILURE: 'fetch_branch_details_failure',
	FETCH_BRANCH_DETAILS_RESPONSE_RESET: 'fetch_branch_details_response_reset',
	FETCH_BRANCH_DETAILS_RESPONSE_CHANGED: 'fetch_branch_details_response_changed',
	/** ***************** FETCH BRANCH DETAILS START *********************** */

	/** ***************** DELETE BRANCH DETAILS START *********************** */
	DELETE_BRANCH_DETAILS_START: 'delete_branch_details_start',
	DELETE_BRANCH_DETAILS_SUCCESS: 'delete_branch_details_success',
	DELETE_BRANCH_DETAILS_FAILURE: 'delete_branch_details_failure',
	DELETE_BRANCH_DETAILS_RESPONSE_RESET: 'delete_branch_details_response_reset',
	DELETE_BRANCH_DETAILS_RESPONSE_CHANGED: 'delete_branch_details_response_changed',
	/** ***************** DELETE BRANCH DETAILS END *********************** */

	/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS START *********************** */
	FETCH_SUB_BRANCH_NEXT_UID_START: 'FETCH_SUB_BRANCH_NEXT_UID_START',
	FETCH_SUB_BRANCH_NEXT_UID_SUCCESS: 'FETCH_SUB_BRANCH_NEXT_UID_SUCCESS',
	FETCH_SUB_BRANCH_NEXT_UID_FAILURE: 'FETCH_SUB_BRANCH_NEXT_UID_FAILURE',
	FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_RESET: 'FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_RESET',
	FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_CHANGED: 'FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_CHANGED',
	/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS END *********************** */

	/** ***************** BULK UPLOAD BRANCHES START *********************** */
	BULK_UPLOAD_BRANCHES_START: 'bulk_upload_branches_start',
	BULK_UPLOAD_BRANCHES_SUCCESS: 'bulk_upload_branches_success',
	BULK_UPLOAD_BRANCHES_FAILURE: 'bulk_upload_branches_failure',
	BULK_UPLOAD_BRANCHES_RESPONSE_RESET: 'bulk_upload_branches_response_reset',
	BULK_UPLOAD_BRANCHES_RESPONSE_CHANGED: 'bulk_upload_branches_response_changed',
	/** ***************** BULK UPLOAD BRANCHES END *********************** */
};
export default BranchActionTypes;
