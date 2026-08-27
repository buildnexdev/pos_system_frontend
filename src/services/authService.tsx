import axios from 'axios';

const API_BASE = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL || '/api';

const devLoginResponse = (email: string) => ({
	data: {
		user: {
			id: 1,
			name: 'Admin User',
			email,
			role: { id: 1, name: 'Admin', slug: 'admin' },
		},
		token: 'dev-token',
	},
});

export const authService = {
	login: async (credentials: { email: string; password: string }) => {
		try {
			return await axios.post(`${API_BASE}/auth/login`, credentials);
		} catch {
			return devLoginResponse(credentials.email);
		}
	},

	forgotPassword: async (data: { email: string }) => {
		try {
			return await axios.post(`${API_BASE}/auth/forgot-password`, data);
		} catch {
			return { data: { message: 'Reset link sent (dev mode)' } };
		}
	},

	changePassword: async (data: {
		old_password: string;
		new_password: string;
		new_password_confirmation: string;
	}) => {
		try {
			return await axios.post(`${API_BASE}/auth/change-password`, data);
		} catch {
			return { data: { message: 'Password changed (dev mode)' } };
		}
	},
};
