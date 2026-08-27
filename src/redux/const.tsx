const apiBase = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL || '/api/';

export const API_URL = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
export const FIN_API_URL = API_URL;
export const NEW_FIN_API_URL = API_URL;

export const getFinApiUrl = (_companyId?: number | string) => API_URL;
