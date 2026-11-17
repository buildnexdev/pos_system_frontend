/**
 * Generates mandatory Redux module files for panel API domains.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'redux');
const EDIT = '2026-11-12';

const modules = [
  {
    name: 'staff',
    stateKey: 'staff',
    prefix: 'STAFF',
    listPath: '/panel/staff',
    itemPath: (id) => `/panel/staff/${id}`,
    listKey: 'staff',
  },
  {
    name: 'role',
    stateKey: 'role',
    prefix: 'ROLE',
    listPath: '/panel/roles',
    itemPath: (id) => `/panel/roles/${id}`,
    listKey: 'roles',
  },
  {
    name: 'accessControl',
    stateKey: 'accessControl',
    prefix: 'ACCESS_CONTROL',
    listPath: '/panel/staff-options',
    rightsPath: (id) => `/panel/rights/${id}`,
    listKey: 'staff',
    custom: 'access',
  },
  {
    name: 'productType',
    stateKey: 'productType',
    prefix: 'PRODUCT_TYPE',
    listPath: '/panel/product-types',
    itemPath: (id) => `/panel/product-types/${id}`,
    listKey: 'items',
  },
  {
    name: 'supplier',
    stateKey: 'supplier',
    prefix: 'SUPPLIER',
    listPath: '/panel/suppliers',
    itemPath: (id) => `/panel/suppliers/${id}`,
    listKey: 'items',
  },
  {
    name: 'branches',
    stateKey: 'branches',
    prefix: 'BRANCHES',
    listPath: '/panel/branches',
    itemPath: (id) => `/panel/branches/${id}`,
    listKey: 'items',
  },
  {
    name: 'warehouse',
    stateKey: 'warehouse',
    prefix: 'WAREHOUSE',
    listPath: '/panel/warehouses',
    itemPath: (id) => `/panel/warehouses/${id}`,
    listKey: 'items',
  },
  {
    name: 'catalog',
    stateKey: 'catalog',
    prefix: 'CATALOG',
    listPath: '/panel/products',
    itemPath: (id) => `/panel/products/${id}`,
    listKey: 'products',
  },
  {
    name: 'stock',
    stateKey: 'stock',
    prefix: 'STOCK',
    listPath: '/panel/stock/items',
    listKey: 'items',
    custom: 'stock',
  },
  {
    name: 'orderPanel',
    stateKey: 'orderPanel',
    prefix: 'ORDER_PANEL',
    listPath: '/panel/orders',
    itemPath: (id) => `/panel/orders/${id}`,
    listKey: 'orders',
  },
  {
    name: 'billing',
    stateKey: 'billing',
    prefix: 'BILLING',
    listPath: '/panel/billings',
    listKey: 'items',
    custom: 'billing',
  },
  {
    name: 'paymentGateway',
    stateKey: 'paymentGateway',
    prefix: 'PAYMENT_GATEWAY',
    listPath: '/panel/payment-gateways',
    itemPath: (id) => `/panel/payment-gateways/${id}`,
    listKey: 'items',
  },
  {
    name: 'dropshipping',
    stateKey: 'dropshipping',
    prefix: 'DROPSHIPPING',
    listPath: '/panel/dropshipping',
    itemPath: (id) => `/panel/dropshipping/${id}`,
    listKey: 'items',
  },
  {
    name: 'finance',
    stateKey: 'finance',
    prefix: 'FINANCE',
    listPath: '/panel/finance',
    itemPath: (id) => `/panel/finance/${id}`,
    listKey: 'items',
  },
  {
    name: 'report',
    stateKey: 'report',
    prefix: 'REPORT',
    listPath: '/panel/reports',
    listKey: 'rows',
    custom: 'report',
  },
  {
    name: 'support',
    stateKey: 'support',
    prefix: 'SUPPORT',
    listPath: '/panel/support/tickets',
    listKey: 'tickets',
    custom: 'support',
  },
  {
    name: 'dashboard',
    stateKey: 'dashboard',
    prefix: 'DASHBOARD',
    listPath: '/panel/dashboard',
    listKey: null,
    custom: 'dashboard',
  },
];

function header(desc) {
  return `/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: ${desc}
 * Edit Date: ${EDIT}
 */
`;
}

function write(mod, file, content) {
  const dir = path.join(root, mod.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), content);
}

function genCrud(mod) {
  const T = `${mod.prefix}`;
  write(
    mod,
    `${mod.name}.types.tsx`,
    `${header(`${mod.name} redux types`)}
export const ${mod.name[0].toUpperCase()}${mod.name.slice(1)}ActionTypes = {
  FETCH_LIST_REQUEST: '${T}_FETCH_LIST_REQUEST',
  FETCH_LIST_SUCCESS: '${T}_FETCH_LIST_SUCCESS',
  FETCH_LIST_FAILURE: '${T}_FETCH_LIST_FAILURE',
  FETCH_ONE_REQUEST: '${T}_FETCH_ONE_REQUEST',
  FETCH_ONE_SUCCESS: '${T}_FETCH_ONE_SUCCESS',
  FETCH_ONE_FAILURE: '${T}_FETCH_ONE_FAILURE',
  SAVE_REQUEST: '${T}_SAVE_REQUEST',
  SAVE_SUCCESS: '${T}_SAVE_SUCCESS',
  SAVE_FAILURE: '${T}_SAVE_FAILURE',
  DELETE_REQUEST: '${T}_DELETE_REQUEST',
  DELETE_SUCCESS: '${T}_DELETE_SUCCESS',
  DELETE_FAILURE: '${T}_DELETE_FAILURE',
  RESET_RESPONSE: '${T}_RESET_RESPONSE',
} as const;

export interface ${mod.name[0].toUpperCase()}${mod.name.slice(1)}State {
  items: any[];
  current: any | null;
  loading: boolean;
  error: string | null;
  lastResponse: any | null;
}
`
  );

  const Types = `${mod.name[0].toUpperCase()}${mod.name.slice(1)}ActionTypes`;
  write(
    mod,
    `${mod.name}.action.tsx`,
    `${header(`${mod.name} redux actions`)}
import { ${Types} } from './${mod.name}.types';

export const fetch${cap(mod.name)}ListRequest = (params?: any) => ({ type: ${Types}.FETCH_LIST_REQUEST, payload: params || {} });
export const fetch${cap(mod.name)}ListSuccess = (payload: any[]) => ({ type: ${Types}.FETCH_LIST_SUCCESS, payload });
export const fetch${cap(mod.name)}ListFailure = (payload: string) => ({ type: ${Types}.FETCH_LIST_FAILURE, payload });

export const fetch${cap(mod.name)}OneRequest = (id: string | number) => ({ type: ${Types}.FETCH_ONE_REQUEST, payload: id });
export const fetch${cap(mod.name)}OneSuccess = (payload: any) => ({ type: ${Types}.FETCH_ONE_SUCCESS, payload });
export const fetch${cap(mod.name)}OneFailure = (payload: string) => ({ type: ${Types}.FETCH_ONE_FAILURE, payload });

export const save${cap(mod.name)}Request = (payload: any) => ({ type: ${Types}.SAVE_REQUEST, payload });
export const save${cap(mod.name)}Success = (payload: any) => ({ type: ${Types}.SAVE_SUCCESS, payload });
export const save${cap(mod.name)}Failure = (payload: string) => ({ type: ${Types}.SAVE_FAILURE, payload });

export const delete${cap(mod.name)}Request = (id: string | number) => ({ type: ${Types}.DELETE_REQUEST, payload: id });
export const delete${cap(mod.name)}Success = (payload: any) => ({ type: ${Types}.DELETE_SUCCESS, payload });
export const delete${cap(mod.name)}Failure = (payload: string) => ({ type: ${Types}.DELETE_FAILURE, payload });

export const reset${cap(mod.name)}Response = () => ({ type: ${Types}.RESET_RESPONSE });
`
  );

  const servicesBody = genServices(mod);
  write(mod, `${mod.name}.services.tsx`, `${header(`${mod.name} API services`)}\n${servicesBody}`);

  write(
    mod,
    `${mod.name}.reducer.tsx`,
    `${header(`${mod.name} redux reducer`)}
import { ${Types}, ${cap(mod.name)}State } from './${mod.name}.types';

const initialState: ${cap(mod.name)}State = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function ${mod.name}Reducer(state = initialState, action: any): ${cap(mod.name)}State {
  switch (action.type) {
    case ${Types}.FETCH_LIST_REQUEST:
    case ${Types}.FETCH_ONE_REQUEST:
    case ${Types}.SAVE_REQUEST:
    case ${Types}.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case ${Types}.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case ${Types}.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case ${Types}.SAVE_SUCCESS:
    case ${Types}.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case ${Types}.FETCH_LIST_FAILURE:
    case ${Types}.FETCH_ONE_FAILURE:
    case ${Types}.SAVE_FAILURE:
    case ${Types}.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ${Types}.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
`
  );

  write(
    mod,
    `${mod.name}.saga.tsx`,
    `${header(`${mod.name} redux sagas`)}
import { call, put, takeLatest } from 'redux-saga/effects';
import { ${Types} } from './${mod.name}.types';
import { ${mod.name}Services } from './${mod.name}.services';
import {
  delete${cap(mod.name)}Failure,
  delete${cap(mod.name)}Success,
  fetch${cap(mod.name)}ListFailure,
  fetch${cap(mod.name)}ListSuccess,
  fetch${cap(mod.name)}OneFailure,
  fetch${cap(mod.name)}OneSuccess,
  save${cap(mod.name)}Failure,
  save${cap(mod.name)}Success,
} from './${mod.name}.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(${mod.name}Services.list, action.payload);
    yield put(fetch${cap(mod.name)}ListSuccess(data));
  } catch (error: any) {
    yield put(fetch${cap(mod.name)}ListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(${mod.name}Services.getOne, action.payload);
    yield put(fetch${cap(mod.name)}OneSuccess(data));
  } catch (error: any) {
    yield put(fetch${cap(mod.name)}OneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(${mod.name}Services.save, action.payload);
    yield put(save${cap(mod.name)}Success(data));
  } catch (error: any) {
    yield put(save${cap(mod.name)}Failure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(${mod.name}Services.remove, action.payload);
    yield put(delete${cap(mod.name)}Success(data));
  } catch (error: any) {
    yield put(delete${cap(mod.name)}Failure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* ${mod.name}Saga() {
  yield takeLatest(${Types}.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(${Types}.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(${Types}.SAVE_REQUEST, saveItem);
  yield takeLatest(${Types}.DELETE_REQUEST, deleteItem);
}
`
  );

  write(
    mod,
    `${mod.name}.selector.tsx`,
    `${header(`${mod.name} redux selectors`)}
import { RootState } from '../store';

export const select${cap(mod.name)}State = (state: RootState) => state.${mod.stateKey};
export const select${cap(mod.name)}Items = (state: RootState) => state.${mod.stateKey}.items;
export const select${cap(mod.name)}Current = (state: RootState) => state.${mod.stateKey}.current;
export const select${cap(mod.name)}Loading = (state: RootState) => state.${mod.stateKey}.loading;
export const select${cap(mod.name)}Error = (state: RootState) => state.${mod.stateKey}.error;
export const select${cap(mod.name)}LastResponse = (state: RootState) => state.${mod.stateKey}.lastResponse;
`
  );
}

function cap(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function genServices(mod) {
  if (mod.custom === 'access') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async () => {
    const { data } = await apiClient.get('/panel/staff-options');
    return data.staff || [];
  },
  getOne: async (userId: string | number) => {
    const { data } = await apiClient.get(\`/panel/rights/\${userId}\`);
    return data;
  },
  save: async (payload: any) => {
    const { userId, rights } = payload;
    const { data } = await apiClient.put(\`/panel/rights/\${userId}\`, { rights });
    return data;
  },
  remove: async () => ({ success: true }),
};
`;
  }
  if (mod.custom === 'stock') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/items', { params });
    return data.items || [];
  },
  getOne: async () => null,
  save: async (payload: any) => {
    const { data } = await apiClient.post('/panel/stock/move', payload);
    return data;
  },
  remove: async () => ({ success: true }),
  history: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/history', { params });
    return data;
  },
  lowAlerts: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/low-alerts', { params });
    return data.items || [];
  },
  reports: async (type: string) => {
    const { data } = await apiClient.get(\`/panel/stock/reports/\${type}\`);
    return data;
  },
};
`;
  }
  if (mod.custom === 'billing') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/billings', { params });
    return data.items || data.billings || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(\`/panel/billings/\${id}\`);
    return data;
  },
  save: async (payload: any) => {
    const { data } = await apiClient.post('/panel/pos/checkout', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(\`/panel/billings/\${id}\`);
    return data;
  },
  lookup: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/pos/lookup', { params });
    return data;
  },
  customers: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/pos/customers', { params });
    return data.customers || data.items || [];
  },
};
`;
  }
  if (mod.custom === 'report') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/reports', { params });
    return data.rows || data.items || [];
  },
  getOne: async () => null,
  save: async () => ({ success: true }),
  remove: async () => ({ success: true }),
  fetch: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/reports', { params });
    return data;
  },
};
`;
  }
  if (mod.custom === 'support') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/support/tickets', { params });
    return data.tickets || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(\`/panel/support/tickets/\${id}\`);
    return data;
  },
  save: async (payload: any) => {
    if (payload instanceof FormData) {
      const { data } = await apiClient.post('/panel/support/tickets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    if (payload.reply) {
      const { id, ...rest } = payload;
      const { data } = await apiClient.post(\`/panel/support/tickets/\${id}/reply\`, rest);
      return data;
    }
    const { data } = await apiClient.post('/panel/support/tickets', payload);
    return data;
  },
  remove: async () => ({ success: true }),
  articles: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/support/articles', { params });
    return data.articles || [];
  },
  categories: async () => {
    const { data } = await apiClient.get('/panel/support/categories');
    return data.categories || [];
  },
  settings: async () => {
    const { data } = await apiClient.get('/panel/support/settings');
    return data.settings;
  },
  saveSettings: async (payload: any) => {
    const { data } = await apiClient.put('/panel/support/settings', payload);
    return data.settings;
  },
};
`;
  }
  if (mod.custom === 'dashboard') {
    return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async () => {
    const { data } = await apiClient.get('/panel/dashboard');
    return data;
  },
  getOne: async () => null,
  save: async () => ({ success: true }),
  remove: async () => ({ success: true }),
};
`;
  }

  // generic CRUD
  const listKey = mod.listKey;
  return `import apiClient from '../../services/apiClient';

export const ${mod.name}Services = {
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('${mod.listPath}', { params });
    return ${listKey ? `data.${listKey} || data.items || []` : 'data'};
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(\`${mod.listPath}/\${id}\`);
    return data.item || data.${mod.name} || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(\`${mod.listPath}/\${id}\`, payload);
      return data;
    }
    const { data } = await apiClient.post('${mod.listPath}', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(\`${mod.listPath}/\${id}\`);
    return data;
  },
};
`;
}

for (const mod of modules) {
  genCrud(mod);
  console.log('generated', mod.name);
}

// also ensure branch has selector already - yes
console.log('done', modules.length);
