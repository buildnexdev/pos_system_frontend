import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const redux = path.join(src, 'redux');

// Add http: apiClient to generated services that don't have it
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.services.tsx')) out.push(full);
  }
  return out;
}

for (const file of walk(redux)) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('http: apiClient') || code.includes('http:apiClient')) continue;
  if (!code.includes("from '../../services/apiClient'") && !code.includes('from "../../services/apiClient"')) continue;
  // inject http into export object
  code = code.replace(
    /export const (\w+Services) = \{/,
    'export const $1 = {\n  http: apiClient,'
  );
  fs.writeFileSync(file, code);
  console.log('http added', path.relative(root, file));
}

const pageMap = [
  ['pages/Panel/StaffPage.tsx', 'staffServices', 'redux/staff/staff.services'],
  ['pages/Panel/StaffFormPage.tsx', 'staffServices', 'redux/staff/staff.services'],
  ['pages/Panel/StaffFormOffcanvas.tsx', 'staffServices', 'redux/staff/staff.services'],
  ['pages/Panel/RolesPage.tsx', 'roleServices', 'redux/role/role.services'],
  ['pages/Panel/AccessControlPage.tsx', 'accessControlServices', 'redux/accessControl/accessControl.services'],
  ['pages/Panel/ProductTypesPage.tsx', 'productTypeServices', 'redux/productType/productType.services'],
  ['pages/Panel/SuppliersPage.tsx', 'supplierServices', 'redux/supplier/supplier.services'],
  ['pages/Panel/BranchesPage.tsx', 'branchesServices', 'redux/branches/branches.services'],
  ['pages/Panel/WarehousesPage.tsx', 'warehouseServices', 'redux/warehouse/warehouse.services'],
  ['pages/Panel/CatalogProductsPage.tsx', 'catalogServices', 'redux/catalog/catalog.services'],
  ['pages/Panel/ProductsPage.tsx', 'catalogServices', 'redux/catalog/catalog.services'],
  ['pages/Panel/StockInventoryPage.tsx', 'stockServices', 'redux/stock/stock.services'],
  ['pages/Panel/OrdersPage.tsx', 'orderPanelServices', 'redux/orderPanel/orderPanel.services'],
  ['pages/Panel/OrderFormPage.tsx', 'orderPanelServices', 'redux/orderPanel/orderPanel.services'],
  ['pages/Panel/BillingPage.tsx', 'billingServices', 'redux/billing/billing.services'],
  ['pages/Panel/PaymentGatewaysPage.tsx', 'paymentGatewayServices', 'redux/paymentGateway/paymentGateway.services'],
  ['pages/Panel/DropshippingPage.tsx', 'dropshippingServices', 'redux/dropshipping/dropshipping.services'],
  ['pages/Panel/FinancePage.tsx', 'financeServices', 'redux/finance/finance.services'],
  ['pages/Panel/FinanceBooksPage.tsx', 'financeServices', 'redux/finance/finance.services'],
  ['pages/Panel/ReportsPage.tsx', 'reportServices', 'redux/report/report.services'],
  ['pages/Panel/HelpSupportPage.tsx', 'supportServices', 'redux/support/support.services'],
  ['pages/Panel/SupportTicketFormPage.tsx', 'supportServices', 'redux/support/support.services'],
  ['pages/Panel/DashboardPage.tsx', 'dashboardServices', 'redux/dashboard/dashboard.services'],
  ['pages/Admin/AdminDashboard.tsx', 'dashboardServices', 'redux/dashboard/dashboard.services'],
  ['pages/Admin/AdminProducts.tsx', 'catalogServices', 'redux/catalog/catalog.services'],
  ['pages/Admin/AdminProductForm.tsx', 'catalogServices', 'redux/catalog/catalog.services'],
  ['pages/Admin/AdminOrders.tsx', 'orderPanelServices', 'redux/orderPanel/orderPanel.services'],
  ['pages/Admin/AdminCategories.tsx', 'catalogServices', 'redux/catalog/catalog.services'],
  ['pages/Admin/AdminCustomers.tsx', 'billingServices', 'redux/billing/billing.services'],
];

function relImport(file, target) {
  const depth = file.split('/').length - 1;
  return `${'../'.repeat(depth)}${target}`;
}

for (const [file, svc, from] of pageMap) {
  const full = path.join(src, file);
  if (!fs.existsSync(full)) {
    console.log('missing', file);
    continue;
  }
  let code = fs.readFileSync(full, 'utf8');
  if (!code.includes('apiClient')) {
    console.log('skip', file);
    continue;
  }
  const importLine = `import { ${svc} } from '${relImport(file, from)}';\n`;
  code = code.replace(/import apiClient from ['\"][^'\"]+['\"];?\r?\n/, importLine);
  code = code.replace(/\bapiClient\b/g, `${svc}.http`);
  // fix accidental ${svc}.httpServices if any
  code = code.replace(new RegExp(`${svc}\\.httpServices`, 'g'), svc);
  fs.writeFileSync(full, code);
  console.log('page', file);
}

// Support tickets page if exists
const extra = path.join(src, 'pages/Panel/SupportTicketsPage.tsx');
if (fs.existsSync(extra)) {
  let code = fs.readFileSync(extra, 'utf8');
  if (code.includes('apiClient')) {
    code = code.replace(/import apiClient from ['\"][^'\"]+['\"];?\r?\n/, `import { supportServices } from '../../redux/support/support.services';\n`);
    code = code.replace(/\bapiClient\b/g, 'supportServices.http');
    fs.writeFileSync(extra, code);
    console.log('page SupportTicketsPage');
  }
}

console.log('done');
