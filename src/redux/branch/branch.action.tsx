// Author : Vishnu
// Version :0.0.1
// MODIFIED DATE: 30/7/2025
import BranchActionTypes from './branch.types';

/** ***************** ADD BRANCH DETAILS START *********************** */
export const addBranchDetailsStart = (addData: any) => ({
	type: BranchActionTypes.ADD_BRANCH_DETAILS_START,
	payload: addData,
});

export const addBranchDetailsSuccess = (successData: any) => ({
	type: BranchActionTypes.ADD_BRANCH_DETAILS_SUCCESS,
	payload: successData,
});

export const addBranchDetailsFailure = (failureData: any) => ({
	type: BranchActionTypes.ADD_BRANCH_DETAILS_FAILURE,
	payload: failureData,
});

export const addBranchDetailsResponseResetStart = () => ({
	type: BranchActionTypes.ADD_BRANCH_DETAILS_RESPONSE_RESET,
});

export const addBranchDetailsResponseChanged = () => ({
	type: BranchActionTypes.ADD_BRANCH_DETAILS_RESPONSE_CHANGED,
});
/** ***************** ADD BRANCH DETAILS END *********************** */

/** ***************** UPDATE BRANCH DETAILS START *********************** */
export const updateBranchDetailsStart = (updateData: any) => ({
	type: BranchActionTypes.UPDATE_BRANCH_DETAILS_START,
	payload: updateData,
});

export const updateBranchDetailsSuccess = (successData: any) => ({
	type: BranchActionTypes.UPDATE_BRANCH_DETAILS_SUCCESS,
	payload: successData,
});

export const updateBranchDetailsFailure = (failureData: any) => ({
	type: BranchActionTypes.UPDATE_BRANCH_DETAILS_FAILURE,
	payload: failureData,
});

export const updateBranchDetailsResponseResetStart = () => ({
	type: BranchActionTypes.UPDATE_BRANCH_DETAILS_RESPONSE_RESET,
});

export const updateBranchDetailsResponseChanged = () => ({
	type: BranchActionTypes.UPDATE_BRANCH_DETAILS_RESPONSE_CHANGED,
});
/** ***************** UPDATE BRANCH DETAILS END *********************** */

/** ***************** GET BRANCH DETAILS START *********************** */
export const getBranchListStart = (getData: any) => ({
	type: BranchActionTypes.GET_BRANCH_LIST_START,
	payload: getData,
});

export const getBranchListSuccess = (successData: any) => ({
	type: BranchActionTypes.GET_BRANCH_LIST_SUCCESS,
	payload: successData,
});

export const getBranchListFailure = (failureData: any) => ({
	type: BranchActionTypes.GET_BRANCH_LIST_FAILURE,
	payload: failureData,
});

export const getBranchListResponseResetStart = () => ({
	type: BranchActionTypes.GET_BRANCH_LIST_RESPONSE_RESET,
});

export const getBranchListResponseChanged = () => ({
	type: BranchActionTypes.GET_BRANCH_LIST_RESPONSE_CHANGED,
});
/** ***************** GET BRANCH DETAILS END *********************** */

/** ***************** FETCH BRANCH DETAILS START *********************** */
export const fetchBranchDetailsStart = (fetchData: any) => ({
	type: BranchActionTypes.FETCH_BRANCH_DETAILS_START,
	payload: fetchData,
});

export const fetchBranchDetailsSuccess = (successData: any) => ({
	type: BranchActionTypes.FETCH_BRANCH_DETAILS_SUCCESS,
	payload: successData,
});

export const fetchBranchDetailsFailure = (failureData: any) => ({
	type: BranchActionTypes.FETCH_BRANCH_DETAILS_FAILURE,
	payload: failureData,
});

export const fetchBranchDetailsResponseResetStart = () => ({
	type: BranchActionTypes.FETCH_BRANCH_DETAILS_RESPONSE_RESET,
});

export const fetchBranchDetailsResponseChanged = () => ({
	type: BranchActionTypes.FETCH_BRANCH_DETAILS_RESPONSE_CHANGED,
});
/** ***************** FETCH BRANCH DETAILS END *********************** */

/** ***************** DELETE BRANCH DETAILS START *********************** */
export const deleteBranchDetailsStart = (deleteData: any) => ({
	type: BranchActionTypes.DELETE_BRANCH_DETAILS_START,
	payload: deleteData,
});

export const deleteBranchDetailsSuccess = (successData: any) => ({
	type: BranchActionTypes.DELETE_BRANCH_DETAILS_SUCCESS,
	payload: successData,
});

export const deleteBranchDetailsFailure = (failureData: any) => ({
	type: BranchActionTypes.DELETE_BRANCH_DETAILS_FAILURE,
	payload: failureData,
});

export const deleteBranchDetailsResponseResetStart = () => ({
	type: BranchActionTypes.DELETE_BRANCH_DETAILS_RESPONSE_RESET,
});

export const deleteBranchDetailsResponseChanged = () => ({
	type: BranchActionTypes.DELETE_BRANCH_DETAILS_RESPONSE_CHANGED,
});
/** ***************** DELETE BRANCH DETAILS END *********************** */

/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS START *********************** */
export const fetchSubBranchUniqueIDStart = (fetchData: any) => ({
	type: BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_START,
	payload: fetchData,
});

export const fetchSubBranchUniqueIDSuccess = (successData: any) => ({
	type: BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_SUCCESS,
	payload: successData,
});

export const fetchSubBranchUniqueIDFailure = (failureData: any) => ({
	type: BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_FAILURE,
	payload: failureData,
});

export const fetchSubBranchUniqueIDResponseResetStart = () => ({
	type: BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_RESET,
});

export const fetchSubBranchUniqueIDResponseChanged = () => ({
	type: BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_CHANGED,
});
/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS END *********************** */

/** ***************** BULK UPLOAD BRANCHES START *********************** */
export const bulkUploadBranchesStart = (uploadData: any) => ({
	type: BranchActionTypes.BULK_UPLOAD_BRANCHES_START,
	payload: uploadData,
});

export const bulkUploadBranchesSuccess = (successData: any) => ({
	type: BranchActionTypes.BULK_UPLOAD_BRANCHES_SUCCESS,
	payload: successData,
});

export const bulkUploadBranchesFailure = (failureData: any) => ({
	type: BranchActionTypes.BULK_UPLOAD_BRANCHES_FAILURE,
	payload: failureData,
});

export const bulkUploadBranchesResponseResetStart = () => ({
	type: BranchActionTypes.BULK_UPLOAD_BRANCHES_RESPONSE_RESET,
});

export const bulkUploadBranchesResponseChanged = () => ({
	type: BranchActionTypes.BULK_UPLOAD_BRANCHES_RESPONSE_CHANGED,
});
/** ***************** BULK UPLOAD BRANCHES END *********************** */
