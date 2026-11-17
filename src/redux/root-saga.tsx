/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Root redux saga for all API modules
 * Edit Date: 2026-11-12
 */
import { all } from 'redux-saga/effects';
import authSaga from './auth/auth.saga';
import shopSaga from './shop/shop.saga';
import cartSaga from './cart/cart.saga';
import ordersSaga from './orders/orders.saga';
import branchSaga from './branch/branch.saga';
import staffSaga from './staff/staff.saga';
import roleSaga from './role/role.saga';
import accessControlSaga from './accessControl/accessControl.saga';
import productTypeSaga from './productType/productType.saga';
import supplierSaga from './supplier/supplier.saga';
import companySaga from './company/company.saga';
import branchesSaga from './branches/branches.saga';
import warehouseSaga from './warehouse/warehouse.saga';
import catalogSaga from './catalog/catalog.saga';
import stockSaga from './stock/stock.saga';
import orderPanelSaga from './orderPanel/orderPanel.saga';
import billingSaga from './billing/billing.saga';
import paymentGatewaySaga from './paymentGateway/paymentGateway.saga';
import dropshippingSaga from './dropshipping/dropshipping.saga';
import financeSaga from './finance/finance.saga';
import reportSaga from './report/report.saga';
import supportSaga from './support/support.saga';
import dashboardSaga from './dashboard/dashboard.saga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    shopSaga(),
    cartSaga(),
    ordersSaga(),
    branchSaga(),
    staffSaga(),
    roleSaga(),
    accessControlSaga(),
    productTypeSaga(),
    supplierSaga(),
    companySaga(),
    branchesSaga(),
    warehouseSaga(),
    catalogSaga(),
    stockSaga(),
    orderPanelSaga(),
    billingSaga(),
    paymentGatewaySaga(),
    dropshippingSaga(),
    financeSaga(),
    reportSaga(),
    supportSaga(),
    dashboardSaga(),
  ]);
}
