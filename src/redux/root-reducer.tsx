import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer.tsx';
import branchReducer from './branch/branch.reducer.tsx';

const rootReducer = combineReducers({
  auth: authReducer,
  branch: branchReducer,
});

export default rootReducer;
