import { AuthState } from './auth.types.tsx';
import { AuthActionTypes } from './auth.action.tsx';

const initialState: AuthState = {
  user: null,
  token: null,
  rights: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

export default function authReducer(state = initialState, action: any): AuthState {
  switch (action.type) {
    case AuthActionTypes.LOGIN_REQUEST:
    case AuthActionTypes.REGISTER_REQUEST:
    case AuthActionTypes.LOAD_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        rights: action.payload.rights || [],
        isAuthenticated: true,
        error: null,
      };

    case AuthActionTypes.LOAD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        rights: action.payload.rights || [],
        isAuthenticated: true,
        error: null,
      };

    case AuthActionTypes.SET_RIGHTS:
      return { ...state, rights: action.payload || [] };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
    case AuthActionTypes.LOAD_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        rights: [],
      };

    case AuthActionTypes.LOGOUT_REQUEST:
      return { ...state, loading: true };

    case AuthActionTypes.LOGOUT_SUCCESS:
      return { ...initialState };

    case AuthActionTypes.LOGOUT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
