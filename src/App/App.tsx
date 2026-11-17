/**
 * App.tsx
 * The main entry point for the application.
 * Handles routing, authentication, and the overall application structure.
 */
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import SuppliersPage from '../pages/Panel/catalog/suppliers/suppliers';
import BranchesPage from '../pages/Panel/catalog/branches/branches';
import WarehousesPage from '../pages/Panel/catalog/warehouses/warehouses';
import StockInventoryPage from '../pages/Panel/catalog/stock/stock';
import CatalogProductsPage from '../pages/Panel/catalog/products/products';
import OrdersPage from '../pages/Panel/sales/orders/orders';
import OrderFormPage from '../pages/Panel/sales/orders/orderForm';
import PaymentGatewaysPage from '../pages/Panel/sales/paymentGateways/paymentGateways';
import BillingPage from '../pages/Panel/sales/billing/billing';
import CustomersPage from '../pages/Panel/sales/customers/customers';
import DropshippingPage from '../pages/Panel/sales/dropshipping/dropshipping';
import ReportsView from '../pages/Panel/report/_shared/ReportsView';
import FinanceBooksView from '../pages/Panel/finance/_shared/FinanceBooksView';
import { loadUserRequest, loginSuccess } from '../redux/auth/auth.action';
import { getToken, getUser } from '../common/jwt';
import { authService } from '../redux/auth/auth.services';
import { RootState } from '../redux/store';
import { isPanelUser, isSuperAdminUser } from '../utils/access';

/**
 * HomeRedirect component
 * Redirects the user to the appropriate page based on their authentication status and role.
 */
function HomeRedirect() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/change-password" replace />;
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
  const { isAuthenticated, loading } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    const rights = authService.getStoredRights();
    if (token && user) {
      dispatch(loginSuccess(user, token, rights));
      dispatch(loadUserRequest());
    }
  }, [dispatch]);

  // While restoring session, keep login gate for first paint if no auth
  if (!isAuthenticated && loading) {
    return <Login />;
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
        <Route path="suppliers" element={<ProtectedRoute panelOnly moduleKey="supplier"><SuppliersPage /></ProtectedRoute>} />
        <Route path="branches" element={<ProtectedRoute panelOnly moduleKey="branch"><BranchesPage /></ProtectedRoute>} />
        <Route path="warehouses" element={<ProtectedRoute panelOnly moduleKey="warehouse"><WarehousesPage /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute panelOnly moduleKey="product"><CatalogProductsPage /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute panelOnly moduleKey="product"><StockInventoryPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute panelOnly moduleKey="order"><OrdersPage /></ProtectedRoute>} />
        <Route path="orders/new" element={<ProtectedRoute panelOnly moduleKey="order" action="create"><OrderFormPage /></ProtectedRoute>} />
        <Route path="orders/:id/edit" element={<ProtectedRoute panelOnly moduleKey="order" action="edit"><OrderFormPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute panelOnly moduleKey="customer"><CustomersPage /></ProtectedRoute>} />
        <Route path="payment-gateways" element={<ProtectedRoute panelOnly moduleKey="payment_gateway"><PaymentGatewaysPage /></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute panelOnly moduleKey="billing"><BillingPage /></ProtectedRoute>} />
        <Route path="dropshipping" element={<ProtectedRoute panelOnly moduleKey="dropshipping"><DropshippingPage /></ProtectedRoute>} />
        <Route path="reports" element={<Navigate to="/panel/reports/users" replace />} />
        <Route path="reports/:type" element={<ProtectedRoute panelOnly moduleKey="report"><ReportsView /></ProtectedRoute>} />
        <Route path="finance" element={<Navigate to="/panel/finance/accounts" replace />} />
        <Route path="finance/:type" element={<ProtectedRoute panelOnly moduleKey="finance"><FinanceBooksView /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
