/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: paymentGateway redux actions
 * Edit Date: 2026-11-12
 */

import { PaymentGatewayActionTypes } from './paymentGateway.types';

export const fetchPaymentGatewayListRequest = (params?: any) => ({ type: PaymentGatewayActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchPaymentGatewayListSuccess = (payload: any[]) => ({ type: PaymentGatewayActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchPaymentGatewayListFailure = (payload: string) => ({ type: PaymentGatewayActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchPaymentGatewayOneRequest = (id: string | number) => ({ type: PaymentGatewayActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchPaymentGatewayOneSuccess = (payload: any) => ({ type: PaymentGatewayActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchPaymentGatewayOneFailure = (payload: string) => ({ type: PaymentGatewayActionTypes.FETCH_ONE_FAILURE, payload });

export const savePaymentGatewayRequest = (payload: any) => ({ type: PaymentGatewayActionTypes.SAVE_REQUEST, payload });
export const savePaymentGatewaySuccess = (payload: any) => ({ type: PaymentGatewayActionTypes.SAVE_SUCCESS, payload });
export const savePaymentGatewayFailure = (payload: string) => ({ type: PaymentGatewayActionTypes.SAVE_FAILURE, payload });

export const deletePaymentGatewayRequest = (id: string | number) => ({ type: PaymentGatewayActionTypes.DELETE_REQUEST, payload: id });
export const deletePaymentGatewaySuccess = (payload: any) => ({ type: PaymentGatewayActionTypes.DELETE_SUCCESS, payload });
export const deletePaymentGatewayFailure = (payload: string) => ({ type: PaymentGatewayActionTypes.DELETE_FAILURE, payload });

export const resetPaymentGatewayResponse = () => ({ type: PaymentGatewayActionTypes.RESET_RESPONSE });
