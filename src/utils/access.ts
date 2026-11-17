import { User, UserRight } from '../redux/auth/auth.types';

/** Modules only Super Admin may open */
export const SUPER_ADMIN_MODULE_KEYS = new Set([
  'company',
  'payment_history',
  'invoice_agreement',
  'manage_ticket',
]);

export const PANEL_MODULES = [
  { key: 'dashboard', label: 'Dashboard', path: '/panel', group: '', hideInMenu: true },
  { key: 'role', label: 'Role', path: '/panel/roles', group: 'User Control' },
  { key: 'access_control', label: 'Access Control', path: '/panel/access-control', group: 'User Control' },
  { key: 'staff', label: 'Staff', path: '/panel/staff', group: 'User Control' },
  { key: 'branch', label: 'Branch', path: '/panel/branches', group: 'User Control' },
  { key: 'warehouse', label: 'Warehouse', path: '/panel/warehouses', group: 'User Control' },
  { key: 'company', label: 'Company', path: '/panel/companies', group: '' },
  { key: 'payment_history', label: 'Payment History', path: '/panel/payment-history', group: '' },
  { key: 'invoice_agreement', label: 'Invoice & Agreement', path: '/panel/invoice-agreement', group: '' },
  { key: 'manage_ticket', label: 'Manage Ticket', path: '/panel/manage-tickets', group: '' },
  { key: 'product_type', label: 'Product Type', path: '/panel/product-types', group: 'Catalog' },
  { key: 'supplier', label: 'Supplier', path: '/panel/suppliers', group: 'Catalog' },
  { key: 'catalog', label: 'Products', path: '/panel/products', group: 'Catalog' },
  { key: 'product', label: 'Stock', path: '/panel/stock', group: 'Catalog' },
  { key: 'order', label: 'Order', path: '/panel/orders', group: 'Sales' },
  { key: 'customer', label: 'Customer', path: '/panel/customers', group: 'Sales' },
  { key: 'payment_gateway', label: 'Payment Gateway', path: '/panel/payment-gateways', group: 'Sales', hideInMenu: true },
  { key: 'billing', label: 'POS Billing', path: '/panel/billing', group: 'Sales' },
  { key: 'dropshipping', label: 'Dropshipping', path: '/panel/dropshipping', group: 'Sales', hideInMenu: true },
  { key: 'report', label: 'Report', path: '/panel/reports/users', group: 'Report', hideInMenu: true },
  { key: 'finance', label: 'Finance', path: '/panel/finance/accounts', group: 'Finance', hideInMenu: true },
  { key: 'support', label: 'Help & Support', path: '/panel/support', group: 'Support', hideInMenu: true },
] as const;

/** Sidebar support links — gated by `support` right */
export const SUPPORT_MENU_ITEMS = [
  { key: 'support_help', label: 'Help Center', path: '/panel/support', type: 'help' },
  { key: 'support_new', label: 'Create Ticket', path: '/panel/support/tickets/new', type: 'new' },
  { key: 'support_tickets', label: 'My Tickets', path: '/panel/support/tickets', type: 'tickets' },
  { key: 'support_manage', label: 'Manage Tickets', path: '/panel/support/manage', type: 'manage', adminOnly: true },
  { key: 'support_settings', label: 'Support Settings', path: '/panel/support/settings', type: 'settings', adminOnly: true },
] as const;

/** Sidebar report links under Report — all gated by `report` right */
export const REPORT_MENU_ITEMS = [
  { key: 'report_users', label: 'User Report', path: '/panel/reports/users', type: 'users' },
  { key: 'report_sales', label: 'Sales Report', path: '/panel/reports/sales', type: 'sales' },
  { key: 'report_product', label: 'Product Report', path: '/panel/reports/product', type: 'product' },
  { key: 'report_stock', label: 'Stock Report', path: '/panel/reports/stock', type: 'stock' },
  { key: 'report_warehouse', label: 'Warehouse Report', path: '/panel/reports/warehouse', type: 'warehouse' },
  { key: 'report_branch', label: 'Branch Report', path: '/panel/reports/branch', type: 'branch' },
  { key: 'report_day', label: 'Day Report', path: '/panel/reports/day', type: 'day' },
  { key: 'report_auditing', label: 'Auditing Report', path: '/panel/reports/auditing', type: 'auditing' },
] as const;

/** Sidebar finance links under Finance — all gated by `finance` right */
export const FINANCE_MENU_ITEMS = [
  { key: 'fin_accounts', label: 'Accounts', path: '/panel/finance/accounts', type: 'accounts' },
  { key: 'fin_bank', label: 'Bank transaction', path: '/panel/finance/bank', type: 'bank' },
  { key: 'fin_cash', label: 'Cash transaction', path: '/panel/finance/cash', type: 'cash' },
  { key: 'fin_ledger', label: 'Ledger', path: '/panel/finance/ledger', type: 'ledger' },
  { key: 'fin_journal', label: 'Journal transaction', path: '/panel/finance/journal', type: 'journal' },
  { key: 'fin_daybook', label: 'Daybook', path: '/panel/finance/daybook', type: 'daybook' },
  { key: 'fin_expense', label: 'Expense Report', path: '/panel/finance/expense', type: 'expense' },
  { key: 'fin_spent', label: 'Spent Report', path: '/panel/finance/spent', type: 'spent' },
  { key: 'fin_billing', label: 'Billing Report', path: '/panel/finance/billing', type: 'billing' },
] as const;

function flagOn(v: unknown): boolean {
  return v === true || v === 1 || v === '1';
}

export function isSuperAdminUser(
  user?: Pick<User, 'isAdmin' | 'isSuperAdmin'> | null
): boolean {
  return !!user && flagOn(user.isSuperAdmin) && flagOn(user.isAdmin);
}

export function isCompanyAdminUser(
  user?: Pick<User, 'isAdmin' | 'isSuperAdmin' | 'role'> | null
): boolean {
  if (!user || isSuperAdminUser(user)) return false;
  return flagOn(user.isAdmin) || user.role === 'admin';
}

export function isPanelUser(
  user?: Pick<User, 'role' | 'isAdmin' | 'isSuperAdmin'> | null
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user) || isCompanyAdminUser(user)) return true;
  return ['admin', 'staff'].includes(String(user.role || ''));
}

/**
 * Pass the full user (preferred) so Super Admin is limited to platform pages.
 */
export function hasRight(
  rights: UserRight[],
  userOrRole: User | string | undefined | null,
  moduleKey: string,
  action: 'view' | 'create' | 'edit' | 'delete' = 'view'
) {
  const user =
    typeof userOrRole === 'object' && userOrRole !== null
      ? userOrRole
      : ({ role: userOrRole || undefined } as User);

  // Super Admin → platform pages only
  if (isSuperAdminUser(user)) {
    return SUPER_ADMIN_MODULE_KEYS.has(moduleKey);
  }

  // Company Admin → full panel except Super Admin–only pages
  if (isCompanyAdminUser(user) || user.role === 'admin') {
    return !SUPER_ADMIN_MODULE_KEYS.has(moduleKey);
  }

  const row = rights.find((r) => r.module_key === moduleKey);
  if (!row) return false;
  const map = {
    view: row.can_view,
    create: row.can_create,
    edit: row.can_edit,
    delete: row.can_delete,
  };
  return !!map[action];
}
