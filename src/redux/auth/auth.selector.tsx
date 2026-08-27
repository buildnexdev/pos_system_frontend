import { RootState } from '../store.tsx';
import { AuthState } from './auth.types.tsx';

export const selectAuthState = (state: RootState): AuthState => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectToken = (state: RootState) => state.auth.token;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState) => state.auth.loading;

export const selectAuthError = (state: RootState) => state.auth.error;
