import { takeEvery, put, call } from 'redux-saga/effects';
import { AuthActionTypes } from './auth.action.tsx';
import { authService } from './auth.service.tsx';

function* login(action: any): Generator {
  try {
    const { user, token } = yield call(
      authService.login,
      action.payload.email,
      action.payload.password
    );
    // Store encrypted auth data
    authService.storeAuthData(user, token);
    yield put({ type: AuthActionTypes.LOGIN_SUCCESS, payload: { user, token } });
  } catch (error: any) {
    yield put({
      type: AuthActionTypes.LOGIN_FAILURE,
      payload: error.response?.data?.message || error.message || 'Login failed',
    });
  }
}

function* register(action: any): Generator {
  try {
    const { user, token } = yield call(authService.register, action.payload);
    // Store encrypted auth data
    authService.storeAuthData(user, token);
    yield put({ type: AuthActionTypes.REGISTER_SUCCESS, payload: { user, token } });
  } catch (error: any) {
    yield put({
      type: AuthActionTypes.REGISTER_FAILURE,
      payload: error.response?.data?.message || error.message || 'Registration failed',
    });
  }
}

function* logout() {
  try {
    yield call(authService.logout);
    yield put({ type: AuthActionTypes.LOGOUT_SUCCESS });
  } catch (error: any) {
    yield put({
      type: AuthActionTypes.LOGOUT_FAILURE,
      payload: error.response?.data?.message || error.message || 'Logout failed',
    });
  }
}

function* loadUser(): Generator {
  try {
    const user = yield call(authService.loadUser);
    yield put({ type: AuthActionTypes.LOAD_USER_SUCCESS, payload: user });
  } catch (error: any) {
    // Clear auth data on error
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
