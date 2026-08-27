// Author : Vishnu
// Version :0.0.1
// MODIFIED DATE: 30/7/2025
import { put, takeLatest, call, all } from 'redux-saga/effects';
import {
	addBranchDetailsFailure,
	addBranchDetailsSuccess,
	addBranchDetailsResponseChanged,
	updateBranchDetailsFailure,
	updateBranchDetailsSuccess,
	updateBranchDetailsResponseChanged,
	getBranchListFailure,
	getBranchListSuccess,
	getBranchListResponseChanged,
	fetchBranchDetailsFailure,
	fetchBranchDetailsSuccess,
	fetchBranchDetailsResponseChanged,
	deleteBranchDetailsFailure,
	deleteBranchDetailsSuccess,
	deleteBranchDetailsResponseChanged,
	fetchSubBranchUniqueIDFailure,
	fetchSubBranchUniqueIDSuccess,
	fetchSubBranchUniqueIDResponseChanged,
	bulkUploadBranchesFailure,
	bulkUploadBranchesSuccess,
	bulkUploadBranchesResponseChanged,
} from './branch.action';
import BranchActionTypes from './branch.types';
import { encryptData } from '../_common/enode-decode';
import AlertManager from '../_common/alertManager';
import {
	branchDetailsAdd,
	branchDetailsDelete,
	branchDetailsFetch,
	branchDetailsUpdate,
	branchListGet,
	subBranchNextUuniqueIDFetch,
	bulkUploadBranches,
} from './branch.services';

/** ***************** ADD BRANCH DETAILS START *********************** */
export function* addBranchDetails({ payload }: any) {
	try {
		const key = 'AddBranchDetailsKey';
		const {
			companyID,
			branchName,
			branchStateName,
			branchCountry,
			branchDistrictName,
			nextUniqueAreaID,
			doorNo,
			branchAddress,
			branchStartDate,
			branchLocation,
			branchMapLatitude,
			branchMapLongitude,
			branchPincode,
			village,
			userID,
			userName,
			userAccessBranchID,
			infogCompanyID,
			databaseName,
			isHeadOffice,
			isSubBranch,
			getSubBranchUID,
			mainBranchID,
			isNbfcLogin,
			isPersonalLoanWithRangeProductNeeded,
			postOffice,
		} = payload;
		const jsonData = {
			CompanyID: companyID,
			BranchName: branchName,
			BranchState: branchStateName,
			BranchCountry: branchCountry,
			BranchDistrict: branchDistrictName,
			NextUniqueAreaID: nextUniqueAreaID,
			DoorNo: doorNo,
			BranchAddress: branchAddress,
			StartDate: branchStartDate,
			BranchLocation: branchLocation,
			BranchLatitude: branchMapLatitude,
			BranchLongitude: branchMapLongitude,
			BranchPinCode: branchPincode,
			Village: village,
			CreatedBy: userID,
			UserName: userName,
			UserAccessBranchID: userAccessBranchID,
			InfogCompanyID: infogCompanyID,
			DatabaseName: databaseName,
			IsHeadOffice: isHeadOffice ? 1 : 0,
			IsSubBranch: isSubBranch ? 1 : 0,
			SubBranchUID: getSubBranchUID,
			MainBranchID: mainBranchID,
			IsNbfcLogin: isNbfcLogin,
			IsPersonalLoanWithRangeProductNeeded: isPersonalLoanWithRangeProductNeeded,
			PostOffice: postOffice,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(branchDetailsAdd, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(addBranchDetailsFailure(responseData.data));
		} else {
			yield put(addBranchDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(addBranchDetailsFailure(error));
	}
}

export function* resetAddBranchResponse() {
	yield put(addBranchDetailsResponseChanged());
}

export function* onAddBranchDetails() {
	yield takeLatest(BranchActionTypes.ADD_BRANCH_DETAILS_START, addBranchDetails);
}

export function* onAddBranchDetailsResponseReset() {
	yield takeLatest(BranchActionTypes.ADD_BRANCH_DETAILS_RESPONSE_RESET, resetAddBranchResponse);
}
/** ***************** ADD BRANCH DETAILS END *********************** */

/** *********************  START UPDATE BRANCH DETAILS  ******************** */
export function* updateBranchDetails({ payload }: any) {
	try {
		const key = 'UpdateBranchDetailsKey';
		const {
			companyID,
			branchID,
			branchName,
			branchStateName,
			branchCountry,
			branchDistrictName,
			nextUniqueAreaID,
			doorNo,
			branchAddress,
			branchStartDate,
			branchLocation,
			branchMapLatitude,
			branchMapLongitude,
			branchPincode,
			village,
			userID,
			userName,
			userAccessBranchID,
			infogCompanyID,
			databaseName,
			isHeadOffice,
			isSubBranch,
			getSubBranchUID,
			mainBranchID,
			isNbfcLogin,
			postOffice,
		} = payload;
		const jsonData = {
			CompanyID: companyID,
			BranchID: branchID,
			BranchName: branchName,
			BranchState: branchStateName,
			BranchCountry: branchCountry,
			BranchDistrict: branchDistrictName,
			NextUniqueAreaID: nextUniqueAreaID,
			DoorNo: doorNo,
			BranchAddress: branchAddress,
			StartDate: branchStartDate,
			BranchLocation: branchLocation,
			BranchLatitude: branchMapLatitude,
			BranchLongitude: branchMapLongitude,
			BranchPinCode: branchPincode,
			Village: village,
			CreatedBy: userID,
			UserName: userName,
			UserAccessBranchID: userAccessBranchID,
			InfogCompanyID: infogCompanyID,
			DatabaseName: databaseName,
			IsHeadOffice: isHeadOffice ? 1 : 0,
			IsSubBranch: isSubBranch ? 1 : 0,
			SubBranchUID: getSubBranchUID,
			MainBranchID: mainBranchID,
			IsNbfcLogin: isNbfcLogin,
			PostOffice: postOffice,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(branchDetailsUpdate, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(updateBranchDetailsFailure(responseData.data));
		} else {
			yield put(updateBranchDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(updateBranchDetailsFailure(error));
	}
}

export function* resetUpdateBranchDetailsResponse() {
	yield put(updateBranchDetailsResponseChanged());
}

export function* onUpdateBranchDetails() {
	yield takeLatest(BranchActionTypes.UPDATE_BRANCH_DETAILS_START, updateBranchDetails);
}

export function* onUpdateBranchResponseReset() {
	yield takeLatest(
		BranchActionTypes.UPDATE_BRANCH_DETAILS_RESPONSE_RESET,
		resetUpdateBranchDetailsResponse,
	);
}
/** *********************  END UPDATE BRANCH DETAILS ******************** */

/** *********************  START GET BRANCH LIST  ******************** */
export function* getAllBranchList({ payload }: any) {
	try {
		const key = 'GetBranchListKey';
		const {
			companyID,
			userID,
			userRole,
			userLevel,
			databaseName,
			userAccessBranchID,
			inputSearch,
			limit,
		} = payload;
		const jsonData = {
			CompanyID: companyID,
			UserID: userID,
			UserRole: userRole,
			Level: userLevel,
			DatabaseName: databaseName,
			BranchID: userAccessBranchID,
			SearchValueSet: inputSearch,
			Limit: limit,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(branchListGet, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(getBranchListFailure(responseData.data));
		} else {
			yield put(getBranchListSuccess(responseData.data));
		}
	} catch (error) {
		yield put(getBranchListFailure(error));
	}
}

export function* resetGetBranchListResponse() {
	yield put(getBranchListResponseChanged());
}

export function* onGetBranchListDetails() {
	yield takeLatest(BranchActionTypes.GET_BRANCH_LIST_START, getAllBranchList);
}

export function* onGetBranchListResponseReset() {
	yield takeLatest(BranchActionTypes.GET_BRANCH_LIST_RESPONSE_RESET, resetGetBranchListResponse);
}
/** *********************  END GET BRANCH LIST ******************** */

/** *********************  START FETCH BRANCH DETAILS  ******************** */
export function* fetchBranchDetails({ payload }: any) {
	try {
		const key = 'FetchBranchDetailsKey';
		const { companyID, branchID, databaseName } = payload;
		const jsonData = {
			CompanyID: companyID,
			AreaID: branchID,
			DatabaseName: databaseName,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(branchDetailsFetch, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(fetchBranchDetailsFailure(responseData.data));
		} else {
			yield put(fetchBranchDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(fetchBranchDetailsFailure(error));
	}
}

export function* resetFetchBranchDetailsResponse() {
	yield put(fetchBranchDetailsResponseChanged());
}

export function* onFetchBranchDetails() {
	yield takeLatest(BranchActionTypes.FETCH_BRANCH_DETAILS_START, fetchBranchDetails);
}

export function* onFetchBranchDetailsResponseReset() {
	yield takeLatest(
		BranchActionTypes.FETCH_BRANCH_DETAILS_RESPONSE_RESET,
		resetFetchBranchDetailsResponse,
	);
}
/** *********************  END FETCH BRANCH DETAILS ******************** */

/** *********************  START DELETE BRANCH DETAILS  ******************** */
export function* deleteBranch({ payload }: any) {
	try {
		const key = 'DeleteBranchDetailsKey';
		const { companyID, branchID, databaseName, userID, userAccessBranchID, userName } = payload;
		const jsonData = {
			CompanyID: companyID,
			AreaID: branchID,
			DatabaseName: databaseName,
			UserID: userID,
			UserAccessBranchID: userAccessBranchID,
			UserName: userName,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(branchDetailsDelete, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(deleteBranchDetailsFailure(responseData.data));
		} else {
			yield put(deleteBranchDetailsSuccess(responseData.data));
		}
	} catch (error) {
		yield put(deleteBranchDetailsFailure(error));
	}
}

export function* resetDeleteBranchDetailsResponse() {
	yield put(deleteBranchDetailsResponseChanged());
}

export function* onDeleteBranchDetails() {
	yield takeLatest(BranchActionTypes.DELETE_BRANCH_DETAILS_START, deleteBranch);
}

export function* onDeleteBranchDetailsResponseReset() {
	yield takeLatest(
		BranchActionTypes.DELETE_BRANCH_DETAILS_RESPONSE_RESET,
		resetDeleteBranchDetailsResponse,
	);
}
/** *********************  END DELETE BRANCH DETAILS ******************** */

/** *********************  START FETCH SUB BRANCH NEXT UNIQUE ID DETAILS  ******************** */
export function* fetchSubBranchNextUniqueIDDetails({ payload }: any) {
	try {
		const key = 'FetchSubBranchNextUniqueIDKey';
		const { companyID, branchID, databaseName } = payload;
		const jsonData = {
			CompanyID: companyID,
			AreaID: branchID,
			DatabaseName: databaseName,
		};
		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const responseData = yield call(subBranchNextUuniqueIDFetch, encodeData);
		// Check for 401 token validation error
		if (responseData.data.statusCode === '401') {
			// Show token validation alert
			AlertManager.showTokenValidationAlert();
			return;
		} else if (responseData.data.statusCode === '100') {
			yield put(fetchSubBranchUniqueIDFailure(responseData.data));
		} else {
			yield put(fetchSubBranchUniqueIDSuccess(responseData.data));
		}
	} catch (error) {
		yield put(fetchSubBranchUniqueIDFailure(error));
	}
}

export function* resetFetchSubBranchNextUniqueIDDetailsResponse() {
	yield put(fetchSubBranchUniqueIDResponseChanged());
}

export function* onFetchSubBranchNextUniqueIDDetails() {
	yield takeLatest(
		BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_START,
		fetchSubBranchNextUniqueIDDetails,
	);
}

export function* onFetchSubBranchNextUniqueIDDetailsResponseReset() {
	yield takeLatest(
		BranchActionTypes.FETCH_SUB_BRANCH_NEXT_UID_RESPONSE_RESET,
		resetFetchSubBranchNextUniqueIDDetailsResponse,
	);
}
/** *********************  END FETCH SUB BRANCH NEXT UNIQUE ID DETAILS ******************** */

/** *********************  BULK UPLOAD BRANCHES START ******************** */
export function* bulkUploadBranchesDetails({ payload }: any) {
	try {
		const key = 'BulkUploadBranchesKey';
		const { branches, create_by } = payload;

		const jsonData = {
			branches,
			create_by: create_by || 'system',
		};

		const encodeData = encryptData(jsonData, key);
		// @ts-ignore
		const response: any = yield call(bulkUploadBranches, encodeData);

		if (response?.data?.statusCode === '01') {
			yield put(bulkUploadBranchesSuccess(response.data));
		} else {
			yield put(bulkUploadBranchesFailure(response?.data || response));
			AlertManager.showAlert('Bulk upload failed');
		}
	} catch (error) {
		yield put(bulkUploadBranchesFailure(error));
		AlertManager.showAlert('Bulk upload failed');
	}
}

export function* resetBulkUploadBranchesResponse() {
	yield put(bulkUploadBranchesResponseChanged());
}

export function* onBulkUploadBranches() {
	yield takeLatest(BranchActionTypes.BULK_UPLOAD_BRANCHES_START, bulkUploadBranchesDetails);
}

export function* onBulkUploadBranchesResponseReset() {
	yield takeLatest(BranchActionTypes.BULK_UPLOAD_BRANCHES_RESPONSE_RESET, resetBulkUploadBranchesResponse);
}
/** *********************  END BULK UPLOAD BRANCHES ******************** */

export default function* branchMasterSaga() {
	yield all([
		call(onAddBranchDetails),
		call(onAddBranchDetailsResponseReset),
		call(onUpdateBranchDetails),
		call(onUpdateBranchResponseReset),
		call(onGetBranchListDetails),
		call(onGetBranchListResponseReset),
		call(onFetchBranchDetails),
		call(onFetchBranchDetailsResponseReset),
		call(onDeleteBranchDetails),
		call(onDeleteBranchDetailsResponseReset),
		call(onFetchSubBranchNextUniqueIDDetails),
		call(onFetchSubBranchNextUniqueIDDetailsResponseReset),
		call(onBulkUploadBranches),
		call(onBulkUploadBranchesResponseReset),
	]);
}
