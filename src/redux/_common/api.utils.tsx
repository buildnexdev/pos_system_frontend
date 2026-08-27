import axios, { type AxiosRequestConfig } from 'axios';
import { getTokenFromRedux, resolveFinanceApiUrl } from './common.utils';
import AlertManager from './alertManager';

// Protected API routes expect the JWT issued during login.
const USE_AUTH_TOKEN = false;

// Global response interceptor.
//
// Contract:
//   * ONLY genuine `401 Unauthorized` (HTTP status or app-level statusCode)
//     triggers the "session expired" alert -> logout flow.
//   * HTTP 5xx (server error) is NEVER interpreted as auth failure -- the
//     Elanthalir 2026-07-13 outage was a PHP fatal on an undefined property
//     that returned 500, and every FE saga's catch(error) needs to receive
//     the raw rejection so it can surface a generic failure toast instead of
//     kicking the user back to /login.
//   * Any other 4xx (403 rights, 404, 422 validation, ...) is left for the
//     calling saga to interpret.
axios.interceptors.response.use(
	(response) => {
		const statusCode = response?.data?.statusCode;
		if (statusCode === '401' || statusCode === 401 || response?.status === 401) {
			AlertManager.showTokenValidationAlert();
			// Test report #21: tell any open off-canvas panel to close on session expiry.
			try { window.dispatchEvent(new Event('sn-session-expired')); } catch (e) { /* ignore */ }
			return Promise.reject(new Error('Token not found or expired'));
		}
		return response;
	},
	(error) => {
		const status = error?.response?.status;
		const statusCode = error?.response?.data?.statusCode;
		// Only real 401 -> logout. Every other status (including 5xx) just rejects.
		if (status === 401 || statusCode === '401' || statusCode === 401) {
			AlertManager.showTokenValidationAlert();
			// Test report #21: close any open off-canvas panel on session expiry.
			try { window.dispatchEvent(new Event('sn-session-expired')); } catch (e) { /* ignore */ }
		} else if (typeof status === 'number' && status >= 500) {
			// Server error. Log so we can find the trace; NEVER logout the user.
			try { console.error('[api] 5xx from', error?.config?.url, status); } catch (e) { /* ignore */ }
		}
		return Promise.reject(error);
	},
);
/**
 * Centralized API call function for all Redux service calls
 * @param url - The API endpoint URL
 * @param data - The payload data to send
 * @param method - HTTP method (default: 'POST')
 * @returns Promise with axios response
 */
export const makeApiCall = async (
	url: string,
	data: any,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
) => {
	const token = getTokenFromRedux();

	const config: AxiosRequestConfig = {
		method,
		url: resolveFinanceApiUrl(url),
		data,
		headers: {
			'Content-type': 'application/json',
			...(USE_AUTH_TOKEN && token ? { Authorization: `Bearer ${token}` } : {}),
		},
	};

	return axios(config);
};

/**
 * Always attaches the JWT (regardless of the global USE_AUTH_TOKEN flag). Use for
 * endpoints that enforce per-role rights server-side (the AccessRights guard) — e.g.
 * collection-approve write actions — so the backend can resolve the real caller.
 * A 401 (no/invalid token) still triggers the global re-login; a 403 (valid token,
 * no rights) is left for the caller to surface as "insufficient rights".
 */
export const makeAuthenticatedApiCall = async (
	url: string,
	data: any,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
) => {
	const token = getTokenFromRedux();

	const config: AxiosRequestConfig = {
		method,
		url: resolveFinanceApiUrl(url),
		data,
		headers: {
			'Content-type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	};

	return axios(config);
};

/**
 * Centralized API call function for form-encoded data (URLSearchParams)
 * @param url - The API endpoint URL
 * @param params - URLSearchParams object with form data
 * @param method - HTTP method (default: 'POST')
 * @returns Promise with axios response
 */
export const makeFormApiCall = async (
	url: string,
	params: URLSearchParams,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
) => {
	const token = getTokenFromRedux();

	const config: AxiosRequestConfig = {
		method,
		url: resolveFinanceApiUrl(url),
		data: params,
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			...(USE_AUTH_TOKEN && token ? { Authorization: `Bearer ${token}` } : {}),
		},
	};

	return axios(config);
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use makeApiCall instead
 */
export const makePostCall = (url: string, data: any) => {
	return makeApiCall(url, data, 'POST');
};
