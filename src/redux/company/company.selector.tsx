/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: company redux selectors
 * Edit Date: 2026-11-14
 */

import { RootState } from '../store';

export const selectCompanyState = (state: RootState) => state.company;
export const selectCompanyItems = (state: RootState) => state.company.items;
export const selectCompanyCurrent = (state: RootState) => state.company.current;
export const selectCompanyLoading = (state: RootState) => state.company.loading;
export const selectCompanyError = (state: RootState) => state.company.error;
export const selectCompanyLastResponse = (state: RootState) => state.company.lastResponse;
