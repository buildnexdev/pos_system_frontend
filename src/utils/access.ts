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
  { key: 'company', label: 'Company', path: '/panel/companies', group: '', hideInMenu: true },
  { key: 'payment_history', label: 'Payment History', path: '/panel/payment-history', group: '', hideInMenu: true },
  { key: 'invoice_agreement', label: 'Invoice & Agreement', path: '/panel/invoice-agreement', group: '', hideInMenu: true },
  { key: 'manage_ticket', label: 'Manage Ticket', path: '/panel/manage-tickets', group: '', hideInMenu: true },
  { key: 'product_type', label: 'Product Type', path: '/panel/product-types', group: 'Catalog' },
  { key: 'category', label: 'Category', path: '/panel/categories', group: 'Catalog' },
  { key: 'brand', label: 'Brand', path: '/panel/brands', group: 'Catalog' },
  { key: 'material_type', label: 'Material Type', path: '/panel/material-types', group: 'Catalog' },
  { key: 'supplier', label: 'Supplier', path: '/panel/suppliers', group: 'Catalog' },
  { key: 'catalog', label: 'Products', path: '/panel/products', group: 'Catalog' },
  { key: 'product', label: 'Stock', path: '/panel/stock', group: 'Catalog' },
  { key: 'order', label: 'Order', path: '/panel/orders', group: 'Sales' },
  { key: 'order_tracking', label: 'Order Tracking', path: '/panel/order-tracking', group: 'Sales' },
  { key: 'customer', label: 'Customer', path: '/panel/customers', group: 'Sales' },
  { key: 'payment_gateway', label: 'Payment Gateway', path: '/panel/payment-gateways', group: 'Sales', hideInMenu: true },
  { key: 'billing', label: 'POS Billing', path: '/panel/billing', group: 'Sales' },
  { key: 'dropshipping', label: 'Dropshipping', path: '/panel/dropshipping', group: 'Sales', hideInMenu: true },
  { key: 'report', label: 'Report', path: '/panel/reports/sales', group: 'Report', hideInMenu: true },
  /** Finance pages live under Report menu — module kept for ACL only */
  { key: 'finance', label: 'Finance', path: '/panel/reports/finance', group: 'Report', hideInMenu: true },
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

export type ReportEngine = 'report' | 'finance';

export type ReportMenuItem = {
  key: string;
  label: string;
  path: string;
  type: string;
  /** Which page engine renders this report */
  engine: ReportEngine;
  /** Type passed to FinanceBooksView when different from `type` */
  financeType?: string;
};

/**
 * All sidebar report links under Report (Finance section removed).
 * `engine: 'finance'` uses FinanceBooksView; others use ReportsView.
 */
export const REPORT_MENU_ITEMS: ReportMenuItem[] = [
  { key: 'report_users', label: 'User Report', path: '/panel/reports/users', type: 'users', engine: 'report' },
  { key: 'report_stock', label: 'Stock Report', path: '/panel/reports/stock', type: 'stock', engine: 'report' },
  { key: 'report_product', label: 'Product Report', path: '/panel/reports/product', type: 'product', engine: 'report' },
  { key: 'report_invoice', label: 'Invoice Report', path: '/panel/reports/invoice', type: 'invoice', engine: 'report' },
  { key: 'report_bill', label: 'Bill Report', path: '/panel/reports/bill', type: 'bill', engine: 'report' },
  { key: 'report_refund', label: 'Refund Report', path: '/panel/reports/refund', type: 'refund', engine: 'report' },
  { key: 'report_sales', label: 'Sales Report', path: '/panel/reports/sales', type: 'sales', engine: 'report' },
  { key: 'report_month', label: 'Monthwise Report', path: '/panel/reports/month', type: 'month', engine: 'report' },
  { key: 'report_day', label: 'Daywise Report', path: '/panel/reports/day', type: 'day', engine: 'report' },
  { key: 'report_finance', label: 'Finance Report', path: '/panel/reports/finance', type: 'finance', engine: 'finance', financeType: 'accounts' },
  { key: 'report_bank', label: 'Bank Transaction Report', path: '/panel/reports/bank', type: 'bank', engine: 'finance' },
  { key: 'report_cash', label: 'Cash Transaction Report', path: '/panel/reports/cash', type: 'cash', engine: 'finance' },
  { key: 'report_upi', label: 'UPI Transaction Report', path: '/panel/reports/upi', type: 'upi', engine: 'report' },
  { key: 'report_branch', label: 'Branchwise Report', path: '/panel/reports/branch', type: 'branch', engine: 'report' },
  { key: 'report_warehouse', label: 'Warehouse Report', path: '/panel/reports/warehouse', type: 'warehouse', engine: 'report' },
  { key: 'report_barcode', label: 'Barcode Report', path: '/panel/reports/barcode', type: 'barcode', engine: 'report' },
  { key: 'report_daybook', label: 'Daybook Report', path: '/panel/reports/daybook', type: 'daybook', engine: 'finance' },
  { key: 'report_ledger', label: 'Ledger Report', path: '/panel/reports/ledger', type: 'ledger', engine: 'finance' },
  { key: 'report_auditlog', label: 'Audit Log Report', path: '/panel/reports/auditlog', type: 'auditlog', engine: 'report' },
  { key: 'report_auditing', label: 'Audit Report', path: '/panel/reports/auditing', type: 'auditing', engine: 'report' },
  { key: 'report_expense', label: 'Expense Report', path: '/panel/reports/expense', type: 'expense', engine: 'finance' },
];

/** @deprecated Finance sidebar removed — kept for FinanceBooksView type labels */
export const FINANCE_MENU_ITEMS = [
  { key: 'fin_accounts', label: 'Finance Report', path: '/panel/reports/finance', type: 'accounts' },
  { key: 'fin_bank', label: 'Bank Transaction Report', path: '/panel/reports/bank', type: 'bank' },
  { key: 'fin_cash', label: 'Cash Transaction Report', path: '/panel/reports/cash', type: 'cash' },
  { key: 'fin_ledger', label: 'Ledger Report', path: '/panel/reports/ledger', type: 'ledger' },
  { key: 'fin_journal', label: 'Journal transaction', path: '/panel/reports/journal', type: 'journal' },
  { key: 'fin_daybook', label: 'Daybook Report', path: '/panel/reports/daybook', type: 'daybook' },
  { key: 'fin_expense', label: 'Expense Report', path: '/panel/reports/expense', type: 'expense' },
  { key: 'fin_spent', label: 'Spent Report', path: '/panel/reports/spent', type: 'spent' },
  { key: 'fin_billing', label: 'Billing Report', path: '/panel/reports/billing', type: 'billing' },
] as const;

export function getReportMenuItem(type: string) {
  return REPORT_MENU_ITEMS.find((r) => r.type === type);
}

export function isFinanceReportType(type: string) {
  const item = getReportMenuItem(type);
  if (item?.engine === 'finance') return true;
  return FINANCE_MENU_ITEMS.some((m) => m.type === type);
}

export function resolveFinanceViewType(type: string) {
  const item = getReportMenuItem(type);
  if (item?.engine === 'finance') return item.financeType || item.type;
  if (FINANCE_MENU_ITEMS.some((m) => m.type === type)) return type;
  return type;
}

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
