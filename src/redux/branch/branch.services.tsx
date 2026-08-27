// Author : Nandhakumar
// Version :0.0.1

import { makeApiCall } from '../_common/api.utils';
import { API_URL } from '../const';
/** ***************** ADD BRANCH DETAILS START *********************** */
export const branchDetailsAdd = (addData: JSON) => {
	const data = {
		AddBranchDetailsToken: addData,
	};
	const url = `${API_URL}RDBranchMaster/addBranchDetails`;
	return makeApiCall(url, data);
};
/** ***************** ADD BRANCH DETAILS END *********************** */

/** ***************** UPDATE BRANCH DETAILS START *********************** */
export const branchDetailsUpdate = (updateData: JSON) => {
	const data = {
		UpdateBranchDetailsToken: updateData,
	};
	const url = `${API_URL}RDBranchMaster/updateBranchDetails`;
	return makeApiCall(url, data);
};
/** ***************** UPDATE BRANCH DETAILS END *********************** */

/** ***************** GET BRANCH DETAILS START *********************** */
export const branchListGet = (listData: any) => {
	const data = {
		GetBranchListToken: listData,
	};
	const url = `${API_URL}RDBranchMaster/getBranchList`;
	return makeApiCall(url, data);
};
/** ***************** GET BRANCH DETAILS END *********************** */

/** ***************** FETCH BRANCH DETAILS START *********************** */
export const branchDetailsFetch = (fetchData: any) => {
	const data = {
		FetchBranchToken: fetchData,
	};
	const url = `${API_URL}RDBranchMaster/fetchBranchDetails`;
	return makeApiCall(url, data);
};
/** ***************** FETCH BRANCH DETAILS END *********************** */

/** ***************** DELETE BRANCH DETAILS START *********************** */
export const branchDetailsDelete = (deleteData: any) => {
	const data = {
		DeleteBranchDetailsToken: deleteData,
	};
	const url = `${API_URL}RDBranchMaster/deleteBranchDetails`;
	return makeApiCall(url, data);
};
/** ***************** DELETE BRANCH DETAILS END *********************** */

/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS START *********************** */
export const subBranchNextUuniqueIDFetch = (fetchData: any) => {
	const data = {
		FetchSubBranchToken: fetchData,
	};
	const url = `${API_URL}fetchSubBranchNextUniqueID`;
	return makeApiCall(url, data);
};
/** ***************** FETCH SUB BRANCH NEXT UNIQUE ID DETAILS END *********************** */

/** ***************** BULK UPLOAD BRANCHES START *********************** */
export const bulkUploadBranches = (uploadData: any) => {
	const data = {
		BulkUploadBranchesToken: uploadData,
	};
	const url = `${API_URL}RDBranchMaster/bulk-upload`;
	return makeApiCall(url, data);
};
/** ***************** BULK UPLOAD BRANCHES END *********************** */
