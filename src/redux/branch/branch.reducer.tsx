// Author : Vishnu
// Version :0.0.1
// MODIFIED DATE: 30/7/2025
import { docodeHexResponse } from '../_common/common.utils';
import BranchActionTypes from './branch.types';

const INITIAL_STATE = {
	addBranchDetailsResponse: null,
	updateBranchDetailsResponse: null,
	getBranchListResponse: null,
	getBranchListArr: [],
	fetchBranchDetailsResponse: null,
	fetchBranchDetailsArr: [],
	deleteBranchDetailsResponse: null,
	fetchSubBranchNextUniqueIDResponse: null,
	bulkUploadBranchesResponse: null,
};

const branchReducer = (state = INITIAL_STATE, action: any) => {
	switch (action.type) {
		/** ***************** ADD BRANCH DETAILS START *********************** */
		case BranchActionTypes.ADD_BRANCH_DETAILS_SUCCESS:
			return { ...state, addBranchDetailsResponse: action.payload };

		case BranchActionTypes.ADD_BRANCH_DETAILS_FAILURE:
			return { ...state, addBranchDetailsResponse: action.payload };

		case BranchActionTypes.ADD_BRANCH_DETAILS_RESPONSE_CHANGED:
			return { ...state, addBranchDetailsResponse: null };
		/** ***************** ADD BRANCH DETAILS END *********************** */

		/** ***************** UPDATE BRANCH DETAILS START *********************** */
		case BranchActionTypes.UPDATE_BRANCH_DETAILS_SUCCESS:
			return { ...state, updateBranchDetailsResponse: action.payload };

		case BranchActionTypes.UPDATE_BRANCH_DETAILS_FAILURE:
			return { ...state, updateBranchDetailsResponse: action.payload };

		case BranchActionTypes.UPDATE_BRANCH_DETAILS_RESPONSE_CHANGED:
			return { ...state, updateBranchDetailsResponse: null };
		/** ***************** UPDATE BRANCH DETAILS END *********************** */

		/** ***************** GET BRANCH DETAILS START *********************** */
		case BranchActionTypes.GET_BRANCH_LIST_SUCCESS:
			return {
				...state,
				getBranchListResponse: action.payload,
				getBranchListArr: docodeHexResponse(action.payload, 'GetBranchListKey'),
			};
		case BranchActionTypes.GET_BRANCH_LIST_FAILURE:
			return { ...state, getBranchListResponse: action.payload, getBranchListArr: [] };

		case BranchActionTypes.GET_BRANCH_LIST_RESPONSE_CHANGED:
			return { ...state, getBranchListResponse: null };
		/** ***************** GET BRANCH DETAILS END *********************** */

		/** ***************** FETCH BRANCH DETAILS START *********************** */
		case BranchActionTypes.FETCH_BRANCH_DETAILS_SUCCESS:
			return {
				...state,
				fetchBranchDetailsResponse: action.payload,
				fetchBranchDetailsArr: docodeHexResponse(action.payload, 'FetchBranchDetailsKey'),
			};
		case BranchActionTypes.FETCH_BRANCH_DETAILS_FAILURE:
			return { ...state, fetchBranchDetailsResponse: action.payload };

		case BranchActionTypes.FETCH_BRANCH_DETAILS_RESPONSE_CHANGED:
			return { ...state, fetchBranchDetailsResponse: null, fetchBranchDetailsArr: [] };
		/** ***************** FETCH BRANCH DETAILS END *********************** */

		/** ***************** DELETE BRANCH DETAILS START *********************** */
		case BranchActionTypes.DELETE_BRANCH_DETAILS_SUCCESS:
			return { ...state, deleteBranchDetailsResponse: action.payload };

		case BranchActionTypes.DELETE_BRANCH_DETAILS_FAILURE:
			return { ...state, deleteBranchDetailsResponse: action.payload };

		case BranchActionTypes.DELETE_BRANCH_DETAILS_RESPONSE_CHANGED:
			return { ...state, deleteBranchDetailsResponse: null };
		/** ***************** DELETE BRANCH DETAILS END *********************** */

		/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS START *********************** */
		case BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_SUCCESS:
			return {
				...state,
				fetchSubBranchNextUniqueIDResponse: action.payload,
			};

		case BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_FAILURE:
			return { ...state, fetchSubBranchNextUniqueIDResponse: action.payload };

		case BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_CHANGED:
			return {
				...state,
				fetchSubBranchNextUniqueIDResponse: null,
			};
		/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS END *********************** */

		/** ***************** BULK UPLOAD BRANCHES START *********************** */
		case BranchActionTypes.BULK_UPLOAD_BRANCHES_SUCCESS:
			return {
				...state,
				bulkUploadBranchesResponse: action.payload,
			};

		case BranchActionTypes.BULK_UPLOAD_BRANCHES_FAILURE:
			return { ...state, bulkUploadBranchesResponse: action.payload };

		case BranchActionTypes.BULK_UPLOAD_BRANCHES_RESPONSE_CHANGED:
			return {
				...state,
				bulkUploadBranchesResponse: null,
			};
		/** ***************** BULK UPLOAD BRANCHES END *********************** */
		default:
			return state;
	}
};
export default branchReducer;
