// Author : Vishnu
// Version :0.0.1
// MODIFIED DATE: 30/7/2025
import { createSelector } from 'reselect';

const selectBranch = (state: any) => state.branch;

// Add Branch
export const selectAddBranch = createSelector(
	[selectBranch],
	(branch_master) => branch_master.addBranchDetailsResponse,
);

// Update Branch
export const selectUpdateBranch = createSelector(
	[selectBranch],
	(branch_master) => branch_master.updateBranchDetailsResponse,
);

// Get Branch List
export const selectGetBranchListResponse = createSelector(
	[selectBranch],
	(branch_master) => branch_master.getBranchListResponse,
);

export const selectBranchListData = createSelector(
	[selectBranch],
	(branch_master) => branch_master.getBranchListArr,
);

// Fetch Branch Details
export const selectFetchBranchDetails = createSelector(
	[selectBranch],
	(branch_master) => branch_master.fetchBranchDetailsResponse,
);

export const selectFetchBranchData = createSelector(
	[selectBranch],
	(branch_master) => branch_master.fetchBranchDetailsArr,
);

// Delete Branch Details
export const selectDeleteBranch = createSelector(
	[selectBranch],
	(branch_master) => branch_master.deleteBranchDetailsResponse,
);

// Fetch Sub Branch Next UniqueID Details
export const selectFetchSubBranchNextUniqueID = createSelector(
	[selectBranch],
	(branch_master) => branch_master.fetchSubBranchNextUniqueIDResponse,
);
