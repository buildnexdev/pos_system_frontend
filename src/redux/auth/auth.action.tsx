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
  SET_RIGHTS: 'SET_RIGHTS',
} as const;

export const loginRequest = (login: string, password: string) => ({
  type: AuthActionTypes.LOGIN_REQUEST,
  payload: { login, password },
});

export const loginSuccess = (user: any, token: string, rights: any[] = []) => ({
  type: AuthActionTypes.LOGIN_SUCCESS,
  payload: { user, token, rights },
});

export const loginFailure = (error: string) => ({
  type: AuthActionTypes.LOGIN_FAILURE,
  payload: error,
});

export const logoutRequest = () => ({ type: AuthActionTypes.LOGOUT_REQUEST });
export const logoutSuccess = () => ({ type: AuthActionTypes.LOGOUT_SUCCESS });
export const logoutFailure = (error: string) => ({
  type: AuthActionTypes.LOGOUT_FAILURE,
  payload: error,
});

export const registerRequest = (userData: any) => ({
  type: AuthActionTypes.REGISTER_REQUEST,
  payload: userData,
});

export const registerSuccess = (user: any, token: string, rights: any[] = []) => ({
  type: AuthActionTypes.REGISTER_SUCCESS,
  payload: { user, token, rights },
});

export const registerFailure = (error: string) => ({
  type: AuthActionTypes.REGISTER_FAILURE,
  payload: error,
});

export const loadUserRequest = () => ({ type: AuthActionTypes.LOAD_USER_REQUEST });

export const loadUserSuccess = (user: any, rights: any[] = []) => ({
  type: AuthActionTypes.LOAD_USER_SUCCESS,
  payload: { user, rights },
});

export const loadUserFailure = (error: string) => ({
  type: AuthActionTypes.LOAD_USER_FAILURE,
  payload: error,
});

export const setRights = (rights: any[]) => ({
  type: AuthActionTypes.SET_RIGHTS,
  payload: rights,
});
