/**
 * App.tsx
 * The main entry point for the application.
 * Handles routing, authentication, and the overall application structure.
 */
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '../components/shop/ProtectedRoute';
import PanelLayout from '../components/panel/PanelLayout';
import Login from '../pages/Auth/Login';
import ChangePassword from '../pages/Auth/ChangePassword';
import DashboardPage from '../pages/Panel/dashboard/dashboard';
import StaffPage from '../pages/Panel/userControl/staff/staff';
import StaffFormPage from '../pages/Panel/userControl/staff/staffForm';
import RolesPage from '../pages/Panel/userControl/roles/roles';
import AccessControlPage from '../pages/Panel/userControl/accessControl/accessControl';
import CompaniesPage from '../pages/Panel/userControl/companies/companies';
import PaymentHistoryPage from '../pages/Panel/superAdmin/paymentHistory/paymentHistory';
import InvoiceAgreementPage from '../pages/Panel/superAdmin/invoiceAgreement/invoiceAgreement';
import ManageTicketsPage from '../pages/Panel/superAdmin/manageTickets/manageTickets';
import ProductTypesPage from '../pages/Panel/catalog/productTypes/productTypes';
import CategoriesPage from '../pages/Panel/catalog/categories/categories';
import BrandsPage from '../pages/Panel/catalog/brands/brands';
import MaterialTypesPage from '../pages/Panel/catalog/materialTypes/materialTypes';
import SuppliersPage from '../pages/Panel/catalog/suppliers/suppliers';
import BranchesPage from '../pages/Panel/catalog/branches/branches';
import WarehousesPage from '../pages/Panel/catalog/warehouses/warehouses';
import StockInventoryPage from '../pages/Panel/catalog/stock/stock';
import CatalogProductsPage from '../pages/Panel/catalog/products/products';
import OrdersPage from '../pages/Panel/sales/orders/orders';
import OrderFormPage from '../pages/Panel/sales/orders/orderForm';
import OrderTrackingPage from '../pages/Panel/sales/orderTracking/orderTracking';
import PaymentGatewaysPage from '../pages/Panel/sales/paymentGateways/paymentGateways';
import BillingPage from '../pages/Panel/sales/billing/billing';
import CustomersPage from '../pages/Panel/sales/customers/customers';
import DropshippingPage from '../pages/Panel/sales/dropshipping/dropshipping';
import ReportRouter from '../pages/Panel/report/_shared/ReportRouter';
import FinanceRedirect from '../pages/Panel/report/_shared/FinanceRedirect';
import { loadUserRequest, loginSuccess } from '../redux/auth/auth.action';
import { getToken, getUser } from '../common/jwt';
import { authService } from '../redux/auth/auth.services';
import { RootState } from '../redux/store';
import { isPanelUser, isSuperAdminUser } from '../utils/access';

function safePanelPath(path?: string | null) {
  if (!path || typeof path !== 'string') return null;
  if (!path.startsWith('/panel')) return null;
  if (path.startsWith('/login') || path.startsWith('/change-password')) return null;
  return path;
}

/**
 * HomeRedirect — after login / `/` only. Honors deep-link `state.from` (e.g. reload recover).
 */
function HomeRedirect() {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const from = safePanelPath((location.state as { from?: string } | null)?.from);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;

  if (from) {
    if (isSuperAdminUser(user)) {
      // Super admin may only land on platform pages; otherwise companies home
      const allowed =
        from.startsWith('/panel/companies') ||
        from.startsWith('/panel/payment-history') ||
        from.startsWith('/panel/invoice-agreement') ||
        from.startsWith('/panel/manage-tickets');
      return <Navigate to={allowed ? from : '/panel/companies'} replace />;
    }
    if (isPanelUser(user)) return <Navigate to={from} replace />;
  }

  if (isSuperAdminUser(user)) return <Navigate to="/panel/companies" replace />;
  if (isPanelUser(user)) return <Navigate to="/panel" replace />;
  return <Navigate to="/login" replace />;
}

/**
 * App component
 * The main application component that handles routing and authentication.
 */
export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  // Keep current URL while restoring token from localStorage (prevents /panel/staff → dashboard)
  const [booting, setBooting] = useState(() => Boolean(getToken() && getUser()));

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    const rights = authService.getStoredRights();
    if (token && user) {
      dispatch(loginSuccess(user, token, rights));
      dispatch(loadUserRequest());
    }
    setBooting(false);
  }, [dispatch]);

  if (booting) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#eef2f6',
          color: '#64748b',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '0.95rem',
        }}
      >
        Restoring session…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <HomeRedirect /> : <Login />} />
      <Route
        path="/change-password"
        element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/panel"
        element={
          <ProtectedRoute panelOnly>
            <PanelLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute panelOnly moduleKey="dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute panelOnly moduleKey="role"><RolesPage /></ProtectedRoute>} />
        <Route path="access-control" element={<ProtectedRoute panelOnly moduleKey="access_control"><AccessControlPage /></ProtectedRoute>} />
        <Route path="staff" element={<ProtectedRoute panelOnly moduleKey="staff"><StaffPage /></ProtectedRoute>} />
        <Route path="staff/new" element={<ProtectedRoute panelOnly moduleKey="staff" action="create"><StaffFormPage /></ProtectedRoute>} />
        <Route path="staff/:id" element={<ProtectedRoute panelOnly moduleKey="staff"><StaffFormPage /></ProtectedRoute>} />
        <Route path="companies" element={<ProtectedRoute panelOnly moduleKey="company"><CompaniesPage /></ProtectedRoute>} />
        <Route path="payment-history" element={<ProtectedRoute panelOnly moduleKey="payment_history"><PaymentHistoryPage /></ProtectedRoute>} />
        <Route path="invoice-agreement" element={<ProtectedRoute panelOnly moduleKey="invoice_agreement"><InvoiceAgreementPage /></ProtectedRoute>} />
        <Route path="manage-tickets" element={<ProtectedRoute panelOnly moduleKey="manage_ticket"><ManageTicketsPage /></ProtectedRoute>} />
        <Route path="product-types" element={<ProtectedRoute panelOnly moduleKey="product_type"><ProductTypesPage /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute panelOnly moduleKey="category"><CategoriesPage /></ProtectedRoute>} />
        <Route path="brands" element={<ProtectedRoute panelOnly moduleKey="brand"><BrandsPage /></ProtectedRoute>} />
        <Route path="material-types" element={<ProtectedRoute panelOnly moduleKey="material_type"><MaterialTypesPage /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute panelOnly moduleKey="supplier"><SuppliersPage /></ProtectedRoute>} />
        <Route path="branches" element={<ProtectedRoute panelOnly moduleKey="branch"><BranchesPage /></ProtectedRoute>} />
        <Route path="warehouses" element={<ProtectedRoute panelOnly moduleKey="warehouse"><WarehousesPage /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute panelOnly moduleKey="catalog"><CatalogProductsPage /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute panelOnly moduleKey="product"><StockInventoryPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute panelOnly moduleKey="order"><OrdersPage /></ProtectedRoute>} />
        <Route path="orders/new" element={<ProtectedRoute panelOnly moduleKey="order" action="create"><OrderFormPage /></ProtectedRoute>} />
        <Route path="orders/:id/edit" element={<ProtectedRoute panelOnly moduleKey="order" action="edit"><OrderFormPage /></ProtectedRoute>} />
        <Route path="order-tracking" element={<ProtectedRoute panelOnly moduleKey="order_tracking"><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute panelOnly moduleKey="customer"><CustomersPage /></ProtectedRoute>} />
        <Route path="payment-gateways" element={<ProtectedRoute panelOnly moduleKey="payment_gateway"><PaymentGatewaysPage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute panelOnly moduleKey="billing"><BillingPage /></ProtectedRoute>} />
        <Route path="dropshipping" element={<ProtectedRoute panelOnly moduleKey="dropshipping"><DropshippingPage /></ProtectedRoute>} />
        <Route path="reports" element={<Navigate to="/panel/reports/sales" replace />} />
        <Route path="reports/:type" element={<ProtectedRoute panelOnly><ReportRouter /></ProtectedRoute>} />
        <Route path="finance" element={<Navigate to="/panel/reports/finance" replace />} />
        <Route path="finance/:type" element={<ProtectedRoute panelOnly><FinanceRedirect /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
