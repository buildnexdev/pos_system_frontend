import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const cssFiles = [
  'index.css',
  'pages/Auth/Login3d.css',
  'components/panel/PanelLayout.css',
  'pages/Panel/SupportPages.css',
  'pages/Panel/ReportsPage.css',
  'pages/Panel/BillingPage.css',
  'pages/Panel/OrdersPage.css',
  'pages/Panel/CatalogProductsPage.css',
  'pages/Panel/StockInventoryPage.css',
  'pages/Panel/LocationPages.css',
  'pages/Panel/ProductsPage.css',
  'pages/Panel/StaffFormOffcanvas.css',
  'pages/Panel/RolesPage.css',
  'pages/Panel/SuppliersPage.css',
  'pages/Panel/ProductTypesPage.css',
  'pages/Panel/AccessControlPage.css',
  'pages/Panel/StaffPage.css',
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === 'styles' && dir === src) continue; // skip vendors already scss tree for rewrite of imports only
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

for (const rel of cssFiles) {
  const cssPath = path.join(src, rel);
  if (!fs.existsSync(cssPath)) {
    console.log('missing', rel);
    continue;
  }
  const scssPath = cssPath.replace(/\.css$/i, '.scss');
  fs.renameSync(cssPath, scssPath);
  console.log('renamed', rel, '->', path.basename(scssPath));
}

// update imports across src
for (const file of walk(src)) {
  let code = fs.readFileSync(file, 'utf8');
  const next = code.replace(/(['"])([^'\"]+)\.css\1/g, (m, q, p) => {
    // don't touch url() in unexpected places; only relative style imports typically end with known files
    if (p.includes('node_modules')) return m;
    // convert app css imports
    for (const rel of cssFiles) {
      const base = rel.replace(/\.css$/i, '');
      if (p.endsWith(base) || p.endsWith(path.basename(base))) {
        return `${q}${p}.scss${q}`.replace('.css.scss', '.scss');
      }
    }
    // generic: if import looks like local stylesheet
    if (p.startsWith('.') || p.startsWith('/src')) {
      return `${q}${p.replace(/\.css$/i, '')}.scss${q}`;
    }
    return m;
  });
  // fix double .scss.scss
  const cleaned = next.replace(/\.scss\.scss/g, '.scss').replace(/\.css\.scss/g, '.scss');
  if (cleaned !== code) {
    fs.writeFileSync(file, cleaned);
    console.log('imports', path.relative(src, file));
  }
}

console.log('done');
