export const AuthActionTypes = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT_REQUEST: 'LOGOUT_REQUEST',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'LOGOUT_FAILURE',
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_REQUEST: 'LOAD_USER_REQUEST',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
} as const;

export const loginRequest = (email: string, password: string) => ({
  type: AuthActionTypes.LOGIN_REQUEST,
  payload: { email, password },
});

export const loginSuccess = (user: any, token: string) => ({
  type: AuthActionTypes.LOGIN_SUCCESS,
  payload: { user, token },
});

export const loginFailure = (error: string) => ({
  type: AuthActionTypes.LOGIN_FAILURE,
  payload: error,
});

export const logoutRequest = () => ({
  type: AuthActionTypes.LOGOUT_REQUEST,
});

export const logoutSuccess = () => ({
  type: AuthActionTypes.LOGOUT_SUCCESS,
});

export const logoutFailure = (error: string) => ({
  type: AuthActionTypes.LOGOUT_FAILURE,
  payload: error,
});

export const registerRequest = (userData: any) => ({
  type: AuthActionTypes.REGISTER_REQUEST,
  payload: userData,
});

export const registerSuccess = (user: any, token: string) => ({
  type: AuthActionTypes.REGISTER_SUCCESS,
  payload: { user, token },
});

export const registerFailure = (error: string) => ({
  type: AuthActionTypes.REGISTER_FAILURE,
  payload: error,
});

export const loadUserRequest = () => ({
  type: AuthActionTypes.LOAD_USER_REQUEST,
});

export const loadUserSuccess = (user: any) => ({
  type: AuthActionTypes.LOAD_USER_SUCCESS,
  payload: user,
});

export const loadUserFailure = (error: string) => ({
  type: AuthActionTypes.LOAD_USER_FAILURE,
  payload: error,
});
