/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Root redux reducer combining all API modules
 * Edit Date: 2026-11-12
 */
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth/auth.reducer';
import shopReducer from './shop/shop.reducer';
import cartReducer from './cart/cart.reducer';
import ordersReducer from './orders/orders.reducer';
import branchReducer from './branch/branch.reducer';
import staffReducer from './staff/staff.reducer';
import roleReducer from './role/role.reducer';
import accessControlReducer from './accessControl/accessControl.reducer';
import productTypeReducer from './productType/productType.reducer';
import supplierReducer from './supplier/supplier.reducer';
import companyReducer from './company/company.reducer';
import branchesReducer from './branches/branches.reducer';
import warehouseReducer from './warehouse/warehouse.reducer';
import catalogReducer from './catalog/catalog.reducer';
import stockReducer from './stock/stock.reducer';
import orderPanelReducer from './orderPanel/orderPanel.reducer';
import billingReducer from './billing/billing.reducer';
import paymentGatewayReducer from './paymentGateway/paymentGateway.reducer';
import dropshippingReducer from './dropshipping/dropshipping.reducer';
import financeReducer from './finance/finance.reducer';
import reportReducer from './report/report.reducer';
import supportReducer from './support/support.reducer';
import dashboardReducer from './dashboard/dashboard.reducer';

const rootReducer = combineReducers({
  auth: authReducer,
  shop: shopReducer,
  cart: cartReducer,
  orders: ordersReducer,
  branch: branchReducer,
  staff: staffReducer,
  role: roleReducer,
  accessControl: accessControlReducer,
  productType: productTypeReducer,
  supplier: supplierReducer,
  company: companyReducer,
  branches: branchesReducer,
  warehouse: warehouseReducer,
  catalog: catalogReducer,
  stock: stockReducer,
  orderPanel: orderPanelReducer,
  billing: billingReducer,
  paymentGateway: paymentGatewayReducer,
  dropshipping: dropshippingReducer,
  finance: financeReducer,
  report: reportReducer,
  support: supportReducer,
  dashboard: dashboardReducer,
});

export default rootReducer;
