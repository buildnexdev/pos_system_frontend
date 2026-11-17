/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: paymentGateway redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectPaymentGatewayState = (state: RootState) => state.paymentGateway;
export const selectPaymentGatewayItems = (state: RootState) => state.paymentGateway.items;
export const selectPaymentGatewayCurrent = (state: RootState) => state.paymentGateway.current;
export const selectPaymentGatewayLoading = (state: RootState) => state.paymentGateway.loading;
export const selectPaymentGatewayError = (state: RootState) => state.paymentGateway.error;
export const selectPaymentGatewayLastResponse = (state: RootState) => state.paymentGateway.lastResponse;
