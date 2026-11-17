import { takeEvery, put, call } from 'redux-saga/effects';
import { AuthActionTypes } from './auth.action.tsx';
import { authService } from './auth.services.tsx';
import { getToken } from '../../common/jwt';

function* login(action: any): Generator {
  try {
    const data: any = yield call(
      authService.login,
      action.payload.login || action.payload.email,
      action.payload.password
    );
    authService.storeAuthData(data.user, data.token, data.rights || []);
    yield put({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: { user: data.user, token: data.token, rights: data.rights || [] },
    });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Cannot reach API. Start backend on port 5000 and restart Vite.'
        : error.message) ||
      'Login failed';
    yield put({
      type: AuthActionTypes.LOGIN_FAILURE,
      payload: message,
    });
  }
}

function* register(action: any): Generator {
  try {
    const data: any = yield call(authService.register, action.payload);
    authService.storeAuthData(data.user, data.token, data.rights || []);
    yield put({
      type: AuthActionTypes.REGISTER_SUCCESS,
      payload: { user: data.user, token: data.token, rights: data.rights || [] },
    });
  } catch (error: any) {
    yield put({
      type: AuthActionTypes.REGISTER_FAILURE,
      payload: error.response?.data?.message || error.message || 'Registration failed',
    });
  }
}

function* logout() {
  try {
    yield call(authService.logoutRemote);
  } catch {
    /* ignore remote logout errors */
  }
  try {
    yield call(authService.logout);
  } catch {
    /* ignore */
  }
  yield put({ type: AuthActionTypes.LOGOUT_SUCCESS });
}

function* loadUser(): Generator {
  try {
    const data: any = yield call(authService.loadUser);
    const token = getToken();
    if (data.user && token) {
      authService.storeAuthData(data.user, token, data.rights || []);
    }
    yield put({
      type: AuthActionTypes.LOAD_USER_SUCCESS,
      payload: { user: data.user, rights: data.rights || [] },
    });
  } catch (error: any) {
    authService.clearAuthData();
    yield put({
      type: AuthActionTypes.LOAD_USER_FAILURE,
      payload: error.response?.data?.message || error.message || 'Failed to load user',
    });
  }
}

export default function* authSaga() {
  yield takeEvery(AuthActionTypes.LOGIN_REQUEST, login);
  yield takeEvery(AuthActionTypes.REGISTER_REQUEST, register);
  yield takeEvery(AuthActionTypes.LOGOUT_REQUEST, logout);
  yield takeEvery(AuthActionTypes.LOAD_USER_REQUEST, loadUser);
}
