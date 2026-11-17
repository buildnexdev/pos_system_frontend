import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import JsBarcode from 'jsbarcode';
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  X,
  Hash,
  IndianRupee,
  Boxes,
  BadgeCheck,
  Save,
  Image as ImageIcon,
  Tag,
  Star,
  Type,
  Barcode,
  FolderTree,
  Tags,
  Percent,
  Palette,
  Ruler,
  Shirt,
  Users,
  Upload,
  Camera,
  Link2,
  FileText,
  Truck,
  RefreshCw,
  ScanBarcode,
  Warehouse,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ArrowLeftRight,
  History,
  Printer,
  Download,
  Tag as TagIcon,
} from 'lucide-react';
import { catalogServices } from '../../../../redux/catalog/catalog.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import { COMPANY_NAME, COMPANY_TAGLINE, companyLogoSrc } from '../../../../utils/brand';
import './productsPage.scss';

function pickMoney(...vals: Array<string | number | null | undefined>) {
  for (const v of vals) {
    if (v === '' || v == null) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  for (const v of vals) {
    if (v === '' || v == null) continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  sku: Yup.string().required('SKU is required'),
  stock_code: Yup.string().required('Stock code is required'),
  category_id: Yup.mixed().required('Category is required'),
  price: Yup.number().typeError('Price must be a number').required('Price is required'),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateStockCode() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STK-${y}${m}${day}-${rand}`;
}

function renderBarcodeSvg(value: string, opts?: { width?: number; height?: number; fontSize?: number }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    width: opts?.width ?? 2,
    height: opts?.height ?? 70,
    displayValue: true,
    fontSize: opts?.fontSize ?? 14,
    margin: 10,
    background: '#ffffff',
    lineColor: '#0f172a',
  });
  return svg;
}

function downloadVariantBarcode(code: string, fileBase: string) {
  const value = String(code || '').trim();
  if (!value) {
    toast.error('Create barcode first');
    return;
  }
  try {
    const svg = renderBarcodeSvg(value);
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 480;
      canvas.height = img.height || 160;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // fallback to SVG download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBase || 'barcode'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          toast.error('Could not export barcode');
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${fileBase || 'barcode'}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        toast.success('Barcode downloaded');
      }, 'image/png');
    };
    img.onerror = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileBase || 'barcode'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Barcode downloaded (SVG)');
    };
    img.src = url;
  } catch {
    toast.error('Invalid barcode value');
  }
}

function StockBarcodePreview({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width: 1.6,
        height: 54,
        displayValue: true,
        fontSize: 12,
        margin: 6,
        background: '#ffffff',
        lineColor: '#0f172a',
      });
    } catch {
      // invalid barcode value
    }
  }, [value]);

  if (!value) {
    return <div className="prod-barcode-empty">Generate stock code to create barcode</div>;
  }

  return (
    <div className="prod-barcode-card">
      <svg ref={svgRef} />
    </div>
  );
}

type StockVariant = {
  key: string;
  id?: number | null;
  size: string;
  color: string;
  stock: number;
  price: string | number;
  discount: string | number;
  stock_code: string;
  barcode: string;
  image_url: string;
};

function stockStatusOf(item: any) {
  if (item?.stock_status) return item.stock_status;
  const stock = Number(item?.stock) || 0;
  const min = Number(item?.min_stock);
  const threshold = Number.isFinite(min) && min >= 0 ? min : 10;
  if (stock <= 0) return 'out_of_stock';
  if (stock <= threshold) return 'low_stock';
  return 'in_stock';
}

function stockStatusLabel(status: string) {
  if (status === 'out_of_stock') return 'Out of stock';
  if (status === 'low_stock') return 'Low stock';
  return 'In stock';
}

function calcSalePrice(price: string | number, discount: string | number) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  if (!p || d <= 0) return p || '';
  return Number((p - (p * d) / 100).toFixed(2));
}

const COLOR_OPTIONS = [
  'Red',
  'White',
  'Black',
  'Blue',
  'Navy',
  'Green',
  'Yellow',
  'Pink',
  'Grey',
  'Beige',
  'Brown',
  'Maroon',
  'Olive',
  'Purple',
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', 'One Size'];

function makeVariantKey() {
  return `v-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function createVariant(partial?: Partial<StockVariant>, baseCode?: string): StockVariant {
  const code = partial?.stock_code || `${baseCode || generateStockCode()}-${Math.floor(10 + Math.random() * 89)}`;
  return {
    key: partial?.key || makeVariantKey(),
    id: partial?.id ?? null,
    size: partial?.size || 'M',
    color: partial?.color || 'Red',
    stock: Number(partial?.stock) || 0,
    price: partial?.price ?? '',
    discount: partial?.discount ?? '',
    stock_code: code,
    barcode: partial?.barcode || code,
    image_url: partial?.image_url || '',
  };
}

function variantsFromProduct(item: any): StockVariant[] {
  if (Array.isArray(item?.variants) && item.variants.length) {
    return item.variants.map((v: any) =>
      createVariant({
        key: `db-${v.id}`,
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        price: v.price ?? '',
        discount: v.discount ?? '',
        stock_code: v.stock_code,
        barcode: v.barcode || v.stock_code,
        image_url: v.image_url || '',
      })
    );
  }
  return [];
}

function updateVariantList(
  variants: StockVariant[],
  index: number,
  patch: Partial<StockVariant>
) {
  const next = [...variants];
  next[index] = { ...next[index], ...patch };
  return next;
}

export default function ProductsPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'product', 'create');
  const canEdit = hasRight(rights, user, 'product', 'edit');
  const canDelete = hasRight(rights, user, 'product', 'delete');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draftStockCode, setDraftStockCode] = useState(() => generateStockCode());
  const [uploadingVariantKey, setUploadingVariantKey] = useState<string | null>(null);
  const [lowAlerts, setLowAlerts] = useState<any[]>([]);
  const [showLowAlerts, setShowLowAlerts] = useState(false);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [stockOpBusy, setStockOpBusy] = useState(false);
  const [stockOp, setStockOp] = useState({
    type: 'in' as 'in' | 'out' | 'adjust' | 'transfer' | 'purchase' | 'pos' | 'return',
    variant_id: '',
    qty: '',
    set_qty: '',
    from_location: '',
    to_location: '',
    note: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);
  const variantCameraInputRef = useRef<HTMLInputElement>(null);
  const variantsLiveRef = useRef<StockVariant[]>([]);
  const variantUploadTarget = useRef<{ key: string; setFieldValue: (field: string, value: any) => void } | null>(null);

  const uploadImage = async (
    file: File,
    setFieldValue: (field: string, value: any) => void,
    options?: { variantKey?: string }
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (options?.variantKey) setUploadingVariantKey(options.variantKey);
    else setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await catalogServices.http.post('/panel/upload/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      if (options?.variantKey) {
        const variants = variantsLiveRef.current || [];
        const index = variants.findIndex((v) => v.key === options.variantKey);
        if (index >= 0) {
          setFieldValue('variants', updateVariantList(variants, index, { image_url: url }));
        }
      } else {
        setFieldValue('image_url', url);
      }
      toast.success('Image uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setUploadingVariantKey(null);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, t, s, alerts] = await Promise.all([
        catalogServices.http.get('/panel/products'),
        catalogServices.http.get('/panel/categories'),
        catalogServices.http.get('/panel/product-types'),
        catalogServices.http.get('/panel/suppliers').catch(() => ({ data: { items: [] } })),
        catalogServices.http.get('/panel/stock/low-alerts').catch(() => ({ data: { items: [] } })),
      ]);
      setProducts(p.data.products || []);
      setCategories(c.data.categories || []);
      setTypes(t.data.items || []);
      setSuppliers((s.data.items || []).filter((item: any) => Number(item.is_active) === 1));
      setLowAlerts(alerts.data.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const loadStockHistory = async (productId: number) => {
    try {
      const { data } = await catalogServices.http.get('/panel/stock/history', {
        params: { product_id: productId, limit: 40 },
      });
      setStockHistory(data.history || []);
    } catch {
      setStockHistory([]);
    }
  };

  const submitStockOp = async () => {
    if (!editing?.id) {
      toast.error('Save the stock item first');
      return;
    }
    setStockOpBusy(true);
    try {
      await catalogServices.http.post('/panel/stock/move', {
        product_id: editing.id,
        variant_id: stockOp.variant_id ? Number(stockOp.variant_id) : null,
        type: stockOp.type,
        qty: stockOp.qty === '' ? undefined : Number(stockOp.qty),
        set_qty: stockOp.type === 'adjust' && stockOp.set_qty !== '' ? Number(stockOp.set_qty) : undefined,
        from_location: stockOp.from_location || editing.warehouse || null,
        to_location: stockOp.to_location || null,
        warehouse: stockOp.type === 'transfer' ? stockOp.to_location : undefined,
        note: stockOp.note || null,
      });
      toast.success('Stock movement saved');
      setStockOp((prev) => ({ ...prev, qty: '', set_qty: '', note: '' }));
      await load();
      await loadStockHistory(editing.id);
      const refreshed = (await catalogServices.http.get(`/panel/products/${editing.id}`)).data.product;
      if (refreshed) setEditing(refreshed);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Stock movement failed');
    } finally {
      setStockOpBusy(false);
    }
  };

  const buildPriceTagRows = (item: any, onlyVariant?: any) => {
    if (onlyVariant) return [onlyVariant];
    const variants = Array.isArray(item?.variants) ? item.variants : [];
    if (variants.length) return variants;
    return [
      {
        size: '—',
        color: '—',
        barcode: item.barcode || item.sku,
        price: item.sale_price || item.price,
        stock_code: item.stock_code || item.sku,
        discount: item.discount_percent,
      },
    ];
  };

  const resolveVariantPrice = (item: any, variant: any) => {
    const mrp = pickMoney(variant?.price, item?.price, item?.sale_price);
    const discount = Number(variant?.discount ?? item?.discount_percent) || 0;
    const sale =
      discount > 0 && mrp
        ? Number((mrp - (mrp * discount) / 100).toFixed(2))
        : pickMoney(item?.sale_price, variant?.price, item?.price) || mrp;
    return { mrp, discount, sale };
  };

  const buildPriceTagDocument = (item: any, rows: any[], opts?: { autoPrint?: boolean; single?: boolean }) => {
    const logo = companyLogoSrc();
    const brand = escapeHtml(item.brand || COMPANY_NAME);
    const productName = escapeHtml(item.name || 'Stock item');
    const barcodeSvgs = rows.map((v: any) => {
      const code = String(v.barcode || v.stock_code || item.barcode || item.sku || '').trim();
      if (!code) return '';
      try {
        return renderBarcodeSvg(code, { width: 1.7, height: 52, fontSize: 11 }).outerHTML;
      } catch {
        return '';
      }
    });

    const cards = rows
      .map((v: any, i: number) => {
        const code = escapeHtml(v.barcode || v.stock_code || item.barcode || item.sku || '');
        const stockCode = escapeHtml(v.stock_code || v.barcode || item.sku || '');
        const { mrp, discount, sale } = resolveVariantPrice(item, v);
        const color = escapeHtml(v.color || '—');
        const size = escapeHtml(v.size || '—');
        return `<article class="tag">
          <header class="tag-brand">
            <div class="tag-brand-left">
              ${logo ? `<img class="tag-logo" src="${logo}" alt="${brand}" />` : `<span class="tag-logo-fallback">BK</span>`}
              <div>
                <p class="tag-company">${brand}</p>
                <p class="tag-tagline">${escapeHtml(COMPANY_TAGLINE)}</p>
              </div>
            </div>
            <span class="tag-badge">PRICE TAG</span>
          </header>
          <div class="tag-body">
            <h1 class="tag-name">${productName}</h1>
            <p class="tag-meta">${color} · ${size} · ${stockCode}</p>
            <div class="tag-price-row">
              <p class="tag-price">₹${Number(sale).toFixed(0)}</p>
              ${
                discount > 0 && mrp > sale
                  ? `<div class="tag-price-side"><span class="tag-mrp">MRP ₹${Number(mrp).toFixed(0)}</span><span class="tag-off">${discount}% OFF</span></div>`
                  : mrp > sale
                    ? `<span class="tag-mrp">MRP ₹${Number(mrp).toFixed(0)}</span>`
                    : ''
              }
            </div>
            <div class="tag-barcode">${barcodeSvgs[i] || `<div class="tag-barcode-empty">No barcode</div>`}</div>
            <p class="tag-code">${code}</p>
          </div>
          <footer class="tag-foot">
            <span>${brand}</span>
            <span>www.buildnexkadai.in</span>
          </footer>
        </article>`;
      })
      .join('');

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${opts?.single ? 'Price Tag' : 'Price Tags'} · ${brand}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap');
    :root {
      --ink:#0f172a;
      --muted:#64748b;
      --line:#dbe3f0;
      --soft:#f8fafc;
      --brand:#1d4ed8;
      --accent:#b45309;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(29,78,216,0.08), transparent 34%),
        linear-gradient(180deg, #eef2f7 0%, #f8fafc 100%);
      font-family: Manrope, Arial, sans-serif;
    }
    .sheet {
      display: grid;
      grid-template-columns: ${opts?.single ? 'minmax(280px, 360px)' : 'repeat(auto-fill, minmax(280px, 1fr))'};
      gap: 16px;
      justify-content: ${opts?.single ? 'center' : 'stretch'};
    }
    .tag {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .tag-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      background: linear-gradient(135deg, #0f172a, #1e3a8a);
      color: #fff;
    }
    .tag-brand-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .tag-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      object-fit: cover;
      background: #fff;
      padding: 3px;
      flex-shrink: 0;
    }
    .tag-logo-fallback {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: #fff;
      color: var(--brand);
      font-weight: 800;
      font-size: 12px;
      flex-shrink: 0;
    }
    .tag-company {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .tag-tagline {
      margin: 2px 0 0;
      font-size: 10px;
      color: rgba(255,255,255,0.72);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .tag-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 999px;
      padding: 4px 8px;
      white-space: nowrap;
    }
    .tag-body { padding: 14px 14px 10px; }
    .tag-name {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.25;
      color: var(--ink);
    }
    .tag-meta {
      margin: 6px 0 0;
      font-size: 12px;
      color: var(--muted);
      font-weight: 600;
    }
    .tag-price-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      margin-top: 12px;
    }
    .tag-price {
      margin: 0;
      font-size: 30px;
      font-weight: 800;
      color: var(--ink);
      line-height: 1;
    }
    .tag-price-side {
      display: grid;
      gap: 2px;
      padding-bottom: 2px;
    }
    .tag-mrp {
      font-size: 12px;
      color: var(--muted);
      text-decoration: line-through;
      font-weight: 600;
    }
    .tag-off {
      font-size: 11px;
      font-weight: 800;
      color: var(--accent);
    }
    .tag-barcode {
      margin-top: 14px;
      padding: 10px 8px 6px;
      border: 1px dashed #c7d2fe;
      border-radius: 12px;
      background: linear-gradient(180deg, #f8fbff, #fff);
      text-align: center;
      overflow: hidden;
    }
    .tag-barcode svg {
      max-width: 100%;
      height: auto;
      display: inline-block;
    }
    .tag-barcode-empty {
      color: var(--muted);
      font-size: 12px;
      padding: 18px 0;
    }
    .tag-code {
      margin: 8px 0 0;
      text-align: center;
      font-family: "IBM Plex Mono", monospace;
      font-size: 12px;
      font-weight: 500;
      color: #334155;
      letter-spacing: 0.04em;
    }
    .tag-foot {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 14px 12px;
      font-size: 10px;
      color: var(--muted);
      font-weight: 600;
      border-top: 1px solid #eef2f7;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { gap: 10px; }
      .tag { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">${cards}</div>
  ${opts?.autoPrint ? '<script>window.onload=function(){window.print();}</script>' : ''}
</body>
</html>`;
  };

  const printPriceTags = (item: any, onlyVariant?: any) => {
    const rows = buildPriceTagRows(item, onlyVariant);
    const html = buildPriceTagDocument(item, rows, {
      autoPrint: true,
      single: Boolean(onlyVariant) || rows.length === 1,
    });
    const win = window.open('', '_blank', 'width=920,height=740');
    if (!win) {
      toast.error('Allow popups to print price tags');
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const downloadVariantPriceTag = (item: any, variant: any) => {
    const html = buildPriceTagDocument(item, [variant], { single: true });
    const safeName = `${item.name || 'item'}-${variant.color || 'color'}-${variant.size || 'size'}`
      .replace(/[^\w\-]+/g, '_')
      .slice(0, 80);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-tag-${safeName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${variant.color || 'Variant'} ${variant.size || ''} price tag downloaded`);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (formOpen) {
      requestAnimationFrame(() => setFormVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFormVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  const filtered = products.filter((p) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (
      String(p.name || '').toLowerCase().includes(term) ||
      String(p.sku || '').toLowerCase().includes(term) ||
      String(p.category_name || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setDraftStockCode(generateStockCode());
    setStockHistory([]);
    setStockOp({
      type: 'in',
      variant_id: '',
      qty: '',
      set_qty: '',
      from_location: '',
      to_location: '',
      note: '',
    });
    setFormOpen(true);
  };

  const openEdit = async (item: any) => {
    setStockOp({
      type: 'in',
      variant_id: '',
      qty: '',
      set_qty: '',
      from_location: item.warehouse || '',
      to_location: '',
      note: '',
    });
    setEditing(item);
    setFormOpen(true);
    loadStockHistory(item.id);
    try {
      const { data } = await catalogServices.http.get(`/panel/products/${item.id}`);
      if (data.product) {
        setEditing({
          ...data.product,
          image: data.product.image || item.image,
          category_name: item.category_name,
        });
      }
    } catch {
      /* keep list row data */
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setStockHistory([]);
  };

  const onDelete = async (item: any) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await catalogServices.http.delete(`/panel/products/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const initialVariants = editing
    ? variantsFromProduct(editing)
    : [
        createVariant({ color: 'Red', size: 'M', stock: 10, price: '' }, draftStockCode),
        createVariant({ color: 'White', size: 'M', stock: 1, price: '' }, draftStockCode),
      ];

  const initialValues = {
    name: editing?.name || '',
    sku: editing?.sku || (editing ? '' : draftStockCode),
    stock_code: editing?.stock_code || editing?.sku || (editing ? '' : draftStockCode),
    barcode: editing?.barcode || editing?.stock_code || editing?.sku || (editing ? '' : draftStockCode),
    category_id: editing?.category_id || categories[0]?.id || '',
    product_type_id: editing?.product_type_id || types[0]?.id || '',
    price: editing?.price || '',
    discount_percent:
      editing?.discount_percent ??
      (editing?.price && editing?.sale_price && Number(editing.price) > 0
        ? Number((((Number(editing.price) - Number(editing.sale_price)) / Number(editing.price)) * 100).toFixed(2))
        : ''),
    sale_price: editing?.sale_price || '',
    stock: editing?.stock ?? initialVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0),
    variants: initialVariants,
    brand: editing?.brand || 'BuildNex ShopOS',
    gender: editing?.gender || 'unisex',
    fabric: editing?.fabric || '',
    supplier_id: editing?.supplier_id || '',
    purchase_price: editing?.purchase_price ?? '',
    hsn_code: editing?.hsn_code || '',
    gst_rate: editing?.gst_rate ?? '',
    min_stock: editing?.min_stock ?? 10,
    reorder_qty: editing?.reorder_qty ?? '',
    warehouse: editing?.warehouse || '',
    stock_status: editing?.stock_status || stockStatusOf(editing || { stock: 0, min_stock: 10 }),
    description: editing?.description || '',
    image_url: editing?.image || editing?.image_url || '',
    is_featured: editing ? !!editing.is_featured : true,
    is_active: editing ? !!editing.is_active : true,
  };

  return (
    <div className="prod-page">
      <div className="prod-panel">
        <div className="prod-toolbar">
          <div className="prod-hero">
            <div className="prod-hero-icon">
              <Package size={22} />
            </div>
            <div>
              <h1>Stock</h1>
              <p>
                Total count: <strong>{products.length}</strong>
              </p>
            </div>
          </div>

          <div className="prod-toolbar-actions">
            <label className="prod-search">
              <Search size={16} className="text-amber-700" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, SKU, category"
              />
            </label>

            <div className="prod-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={view === 'table' ? 'is-active' : ''}
                onClick={() => setView('table')}
                title="Table view"
              >
                <Table2 size={16} />
              </button>
              <button
                type="button"
                className={view === 'grid' ? 'is-active' : ''}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <button
              type="button"
              className={`prod-code-btn ${showLowAlerts ? 'is-warn' : ''}`}
              onClick={() => setShowLowAlerts((v) => !v)}
              title="Low stock alerts"
            >
              <AlertTriangle size={15} /> Low Alerts{lowAlerts.length ? ` (${lowAlerts.length})` : ''}
            </button>

            {canCreate && (
              <button type="button" className="prod-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Stock
              </button>
            )}
          </div>
        </div>

        {showLowAlerts && (
          <div className="prod-low-alerts">
            <div className="prod-low-alerts-head">
              <strong><AlertTriangle size={15} /> Low / Out of stock</strong>
              <button type="button" className="prod-code-btn" onClick={() => setShowLowAlerts(false)}>Hide</button>
            </div>
            {lowAlerts.length === 0 ? (
              <p className="prod-hint">No low stock items right now.</p>
            ) : (
              <div className="prod-low-alerts-list">
                {lowAlerts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="prod-low-alert-item"
                    onClick={() => {
                      openEdit(item);
                      setShowLowAlerts(false);
                    }}
                  >
                    <span>{item.name}</span>
                    <em>{item.stock} / min {item.min_stock ?? 10}</em>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="prod-loading">
            <Loader />
            <p>Loading stock...</p>
          </div>
        ) : view === 'table' ? (
          <div className="prod-table-wrap">
            <table className="prod-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><Package size={14} className="th-prod" /> Stock Item</span></th>
                  <th><span className="th-cell"><Tag size={14} className="th-cat" /> Category</span></th>
                  <th><span className="th-cell"><IndianRupee size={14} className="th-price" /> Price</span></th>
                  <th><span className="th-cell"><Boxes size={14} className="th-stock" /> Stock</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-status" /> Status</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="prod-empty">No stock items found.</td>
                  </tr>
                ) : (
                  filtered.map((p, index) => (
                    <tr key={p.id} className="prod-row" style={{ animationDelay: `${index * 35}ms` }}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="prod-name-cell">
                          <span className="prod-thumb">
                            {p.image || p.image_url ? (
                              <img src={p.image || p.image_url} alt={p.name} />
                            ) : (
                              <Package size={16} />
                            )}
                          </span>
                          <div>
                            <strong>{p.name}</strong>
                            <p className="prod-sku">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td>{p.category_name || '—'}</td>
                      <td>
                        <span className="prod-price">₹{Number(p.sale_price || p.price || 0).toFixed(0)}</span>
                        {p.sale_price && Number(p.sale_price) < Number(p.price) ? (
                          <span className="prod-mrp">₹{Number(p.price).toFixed(0)}</span>
                        ) : null}
                      </td>
                      <td>
                        <span className={`prod-stock ${stockStatusOf(p) !== 'in_stock' ? 'is-low' : ''}`}>
                          {p.stock}
                        </span>
                        <p className="prod-stock-status">{stockStatusLabel(stockStatusOf(p))}</p>
                      </td>
                      <td>
                        <span className={`prod-badge ${p.is_active ? 'is-on' : 'is-off'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {canEdit ? (
                          <div className="prod-inline-actions">
                            <button type="button" className="icon-action edit" title="Edit" onClick={() => openEdit(p)}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="icon-action edit" title="Print price tags" onClick={() => printPriceTags(p)}>
                              <Printer size={15} />
                            </button>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {canDelete ? (
                          <button type="button" className="icon-action delete" title="Delete" onClick={() => onDelete(p)}>
                            <Trash2 size={15} />
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="prod-grid">
            {filtered.length === 0 ? (
              <div className="prod-empty">No stock items found.</div>
            ) : (
              filtered.map((p, index) => (
                <article key={p.id} className="prod-card" style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="prod-card-media">
                    {p.image || p.image_url ? (
                      <img src={p.image || p.image_url} alt={p.name} />
                    ) : (
                      <div className="prod-card-placeholder"><Package size={28} /></div>
                    )}
                    {!!p.is_featured && (
                      <span className="prod-featured"><Star size={12} /> Featured</span>
                    )}
                  </div>
                  <div className="prod-card-body">
                    <h3>{p.name}</h3>
                    <p className="prod-sku">{p.sku}</p>
                    <p className="prod-card-meta">{p.category_name || '—'} · Stock {p.stock}</p>
                    <div className="prod-card-foot">
                      <strong>₹{Number(p.sale_price || p.price || 0).toFixed(0)}</strong>
                      <div className="prod-card-actions">
                        {canEdit && (
                          <button type="button" className="icon-action edit" onClick={() => openEdit(p)}>
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" className="icon-action delete" onClick={() => onDelete(p)}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>

      {formOpen &&
        createPortal(
          <div className={`prod-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="prod-backdrop" onClick={closeForm} />
            <aside className={`prod-offcanvas ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <button type="button" className="prod-oc-close" onClick={closeForm} aria-label="Close">
                <X size={18} />
              </button>

              <div className="prod-oc-head">
                <span className="prod-oc-icon"><Package size={20} /></span>
                <div>
                  <h2>{editing ? 'Edit Stock' : 'Add Stock'}</h2>
                  <p>{editing ? 'Update stock item details' : 'Create a new stock item'}</p>
                </div>
              </div>

              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const stockCode = values.stock_code || values.sku;
                    const variants = (values.variants || []).map((v: StockVariant) => ({
                      size: v.size,
                      color: v.color,
                      stock: Number(v.stock) || 0,
                      price: v.price === '' || v.price == null ? null : Number(v.price),
                      discount: v.discount === '' || v.discount == null ? 0 : Number(v.discount),
                      stock_code: v.stock_code,
                      barcode: v.barcode || v.stock_code,
                      image_url: v.image_url || null,
                    }));
                    const payload = {
                      ...values,
                      slug: slugify(values.name),
                      category_id: Number(values.category_id),
                      product_type_id: values.product_type_id ? Number(values.product_type_id) : null,
                      price: Number(values.price),
                      purchase_price:
                        values.purchase_price === '' || values.purchase_price == null
                          ? null
                          : Number(values.purchase_price),
                      discount_percent: Number(values.discount_percent) || 0,
                      sale_price:
                        values.sale_price === '' || values.sale_price == null
                          ? null
                          : Number(values.sale_price),
                      gst_rate:
                        values.gst_rate === '' || values.gst_rate == null
                          ? 0
                          : Number(values.gst_rate),
                      min_stock:
                        values.min_stock === '' || values.min_stock == null
                          ? 10
                          : Number(values.min_stock),
                      reorder_qty: Number(values.reorder_qty) || 0,
                      warehouse: values.warehouse || null,
                      hsn_code: values.hsn_code || null,
                      stock_status: values.stock_status || null,
                      stock: variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0),
                      sizes: [...new Set(variants.map((v: any) => v.size).filter(Boolean))].join(','),
                      colors: [...new Set(variants.map((v: any) => v.color).filter(Boolean))].join(','),
                      supplier_id: values.supplier_id ? Number(values.supplier_id) : null,
                      stock_code: stockCode,
                      barcode: values.barcode || stockCode,
                      variants,
                    };
                    if (editing) await catalogServices.http.put(`/panel/products/${editing.id}`, payload);
                    else await catalogServices.http.post('/panel/products', payload);
                    toast.success(editing ? 'Stock updated' : 'Stock created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => {
                  variantsLiveRef.current = values.variants || [];
                  return (
                  <Form className="prod-oc-body">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, setFieldValue);
                        e.target.value = '';
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, setFieldValue);
                        e.target.value = '';
                      }}
                    />
                    <input
                      ref={variantFileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const target = variantUploadTarget.current;
                        if (file && target) {
                          uploadImage(file, target.setFieldValue, { variantKey: target.key });
                        }
                        e.target.value = '';
                      }}
                    />
                    <input
                      ref={variantCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const target = variantUploadTarget.current;
                        if (file && target) {
                          uploadImage(file, target.setFieldValue, { variantKey: target.key });
                        }
                        e.target.value = '';
                      }}
                    />

                    <section className="prod-form-section is-single">
                      <div className="prod-section-head">
                        <span className="prod-section-icon basic"><Package size={16} /></span>
                        <div>
                          <h3>Stock Details</h3>
                          <p>All item fields, stock code and barcode in one place</p>
                        </div>
                      </div>

                      <div className="prod-form-grid">
                        <div>
                          <label><Type size={14} className="lbl-icon c-amber" /> Name</label>
                          <Field name="name" className="prod-input" placeholder="Stock item name" />
                          {touched.name && errors.name && <p className="prod-error">{String(errors.name)}</p>}
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-sky" /> Stock Code</label>
                          <div className="prod-code-row">
                            <Field name="stock_code" className="prod-input" placeholder="STK-YYYYMMDD-####" readOnly />
                            <button
                              type="button"
                              className="prod-code-btn"
                              title="Generate stock code & barcode"
                              onClick={() => {
                                const code = generateStockCode();
                                setFieldValue('stock_code', code);
                                setFieldValue('barcode', code);
                                if (!editing || !values.sku) setFieldValue('sku', code);
                                toast.success('Stock code & barcode generated');
                              }}
                            >
                              <RefreshCw size={15} /> Generate
                            </button>
                          </div>
                          {touched.stock_code && errors.stock_code && (
                            <p className="prod-error">{String(errors.stock_code)}</p>
                          )}
                        </div>
                        <div>
                          <label><Barcode size={14} className="lbl-icon c-indigo" /> SKU</label>
                          <Field name="sku" className="prod-input" placeholder="SKU" />
                          {touched.sku && errors.sku && <p className="prod-error">{String(errors.sku)}</p>}
                        </div>
                        <div>
                          <label><Star size={14} className="lbl-icon c-amber" /> Brand</label>
                          <Field name="brand" className="prod-input" placeholder="Brand" />
                        </div>
                        <div>
                          <label><FolderTree size={14} className="lbl-icon c-violet" /> Category</label>
                          <Field as="select" name="category_id" className="prod-input">
                            <option value="">Select category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </Field>
                          {touched.category_id && errors.category_id && (
                            <p className="prod-error">{String(errors.category_id)}</p>
                          )}
                        </div>
                        <div>
                          <label><Tags size={14} className="lbl-icon c-orange" /> Product Type</label>
                          <Field as="select" name="product_type_id" className="prod-input">
                            <option value="">Select type</option>
                            {types.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <label><Users size={14} className="lbl-icon c-cyan" /> Gender</label>
                          <Field as="select" name="gender" className="prod-input">
                            <option value="unisex">Unisex</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                          </Field>
                        </div>
                        <div>
                          <label><Shirt size={14} className="lbl-icon c-lime" /> Fabric</label>
                          <Field name="fabric" className="prod-input" placeholder="Fabric" />
                        </div>
                        <div>
                          <label><IndianRupee size={14} className="lbl-icon c-teal" /> Price Tag</label>
                          <Field
                            name="price"
                            type="number"
                            className="prod-input"
                            placeholder="Price tag"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const price = e.target.value;
                              setFieldValue('price', price);
                              const sale = calcSalePrice(price, values.discount_percent);
                              setFieldValue('sale_price', sale === '' ? '' : sale);
                            }}
                          />
                          {touched.price && errors.price && <p className="prod-error">{String(errors.price)}</p>}
                        </div>
                        <div>
                          <label><Percent size={14} className="lbl-icon c-rose" /> Discount %</label>
                          <Field
                            name="discount_percent"
                            type="number"
                            className="prod-input"
                            placeholder="e.g. 20"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const discount = e.target.value;
                              setFieldValue('discount_percent', discount);
                              const sale = calcSalePrice(values.price, discount);
                              setFieldValue('sale_price', sale === '' ? '' : sale);
                            }}
                          />
                        </div>
                        <div>
                          <label><IndianRupee size={14} className="lbl-icon c-orange" /> Sale Price</label>
                          <Field name="sale_price" type="number" className="prod-input" placeholder="After discount" />
                        </div>
                        <div>
                          <label><Boxes size={14} className="lbl-icon c-blue" /> Total Stock</label>
                          <input
                            className="prod-input"
                            value={(values.variants || []).reduce(
                              (sum: number, v: StockVariant) => sum + (Number(v.stock) || 0),
                              0
                            )}
                            readOnly
                          />
                        </div>
                        <div>
                          <label><Truck size={14} className="lbl-icon c-orange" /> Supplier</label>
                          <Field as="select" name="supplier_id" className="prod-input">
                            <option value="">Select supplier</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <label><IndianRupee size={14} className="lbl-icon c-teal" /> Purchase Price</label>
                          <Field name="purchase_price" type="number" className="prod-input" placeholder="Cost price" />
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-indigo" /> HSN Code</label>
                          <Field name="hsn_code" className="prod-input" placeholder="e.g. 6109" />
                        </div>
                        <div>
                          <label><Percent size={14} className="lbl-icon c-rose" /> GST Rate %</label>
                          <Field name="gst_rate" type="number" className="prod-input" placeholder="e.g. 5 / 12 / 18" />
                        </div>
                        <div>
                          <label><AlertTriangle size={14} className="lbl-icon c-amber" /> Minimum Stock Alert</label>
                          <Field name="min_stock" type="number" className="prod-input" placeholder="10" />
                        </div>
                        <div>
                          <label><Boxes size={14} className="lbl-icon c-blue" /> Reorder Quantity</label>
                          <Field name="reorder_qty" type="number" className="prod-input" placeholder="Suggested reorder qty" />
                        </div>
                        <div>
                          <label><Warehouse size={14} className="lbl-icon c-violet" /> Warehouse / Location</label>
                          <Field name="warehouse" className="prod-input" placeholder="Main store / Godown A" />
                        </div>
                        <div>
                          <label><BadgeCheck size={14} className="lbl-icon c-lime" /> Stock Status</label>
                          <Field as="select" name="stock_status" className="prod-input">
                            <option value="in_stock">In stock</option>
                            <option value="low_stock">Low stock</option>
                            <option value="out_of_stock">Out of stock</option>
                          </Field>
                          <p className="prod-hint">Auto-updates from total stock vs minimum alert after save / movements.</p>
                        </div>

                        <div className="span-all">
                          <div className="prod-variant-head">
                            <div>
                              <label><Palette size={14} className="lbl-icon c-pink" /> Color / Size Stock</label>
                              <p className="prod-hint">Example: Red · M · 10 stocks &nbsp;|&nbsp; White · M · 1 stock · unique SKU & barcode per variant</p>
                            </div>
                            <div className="prod-variant-actions">
                              <button
                                type="button"
                                className="prod-code-btn"
                                onClick={() => {
                                  const base = values.stock_code || generateStockCode();
                                  const next = (values.variants || []).map((v: StockVariant, index: number) => {
                                    const code = `${base}-${String(index + 1).padStart(2, '0')}${Math.floor(Math.random() * 90 + 10)}`;
                                    return { ...v, stock_code: code, barcode: code };
                                  });
                                  setFieldValue('variants', next);
                                  toast.success('Bulk barcodes generated for all variants');
                                }}
                              >
                                <ScanBarcode size={15} /> Bulk Barcodes
                              </button>
                              <button
                                type="button"
                                className="prod-code-btn"
                                onClick={() =>
                                  printPriceTags({
                                    ...values,
                                    name: values.name,
                                    brand: values.brand || COMPANY_NAME,
                                    price: values.price,
                                    sale_price: values.sale_price,
                                    discount_percent: values.discount_percent,
                                    variants: values.variants,
                                  })
                                }
                              >
                                <Printer size={15} /> Price Tags
                              </button>
                              <button
                                type="button"
                                className="prod-code-btn"
                                onClick={() => {
                                  const next = [
                                    ...(values.variants || []),
                                    createVariant({ color: '', size: '', stock: 0 }, values.stock_code || draftStockCode),
                                  ];
                                  setFieldValue('variants', next);
                                }}
                              >
                                <Plus size={15} /> Add Variant
                              </button>
                            </div>
                          </div>

                          <div className="prod-variant-list">
                            {(values.variants || []).length === 0 && (
                              <div className="prod-variant-empty">No variants yet. Add color + size stock rows.</div>
                            )}
                            {(values.variants || []).map((variant: StockVariant, index: number) => {
                              const colorOptions = COLOR_OPTIONS.includes(variant.color)
                                ? COLOR_OPTIONS
                                : variant.color
                                  ? [variant.color, ...COLOR_OPTIONS]
                                  : COLOR_OPTIONS;
                              const sizeOptions = SIZE_OPTIONS.includes(variant.size)
                                ? SIZE_OPTIONS
                                : variant.size
                                  ? [variant.size, ...SIZE_OPTIONS]
                                  : SIZE_OPTIONS;
                              const isVariantUploading = uploadingVariantKey === variant.key;

                              return (
                              <div key={variant.key} className="prod-variant-row">
                                <div>
                                  <label><Palette size={12} className="lbl-icon c-pink" /> Color</label>
                                  <select
                                    className="prod-input"
                                    value={variant.color}
                                    onChange={(e) => {
                                      setFieldValue(
                                        'variants',
                                        updateVariantList(values.variants, index, { color: e.target.value })
                                      );
                                    }}
                                  >
                                    <option value="">Select color</option>
                                    {colorOptions.map((color) => (
                                      <option key={color} value={color}>{color}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label><Ruler size={12} className="lbl-icon c-indigo" /> Size</label>
                                  <select
                                    className="prod-input"
                                    value={variant.size}
                                    onChange={(e) => {
                                      setFieldValue(
                                        'variants',
                                        updateVariantList(values.variants, index, { size: e.target.value })
                                      );
                                    }}
                                  >
                                    <option value="">Select size</option>
                                    {sizeOptions.map((size) => (
                                      <option key={size} value={size}>{size}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label><Boxes size={12} className="lbl-icon c-blue" /> Stocks</label>
                                  <input
                                    type="number"
                                    className="prod-input"
                                    value={variant.stock}
                                    min={0}
                                    placeholder="0"
                                    onChange={(e) => {
                                      setFieldValue(
                                        'variants',
                                        updateVariantList(values.variants, index, {
                                          stock: Number(e.target.value) || 0,
                                        })
                                      );
                                    }}
                                  />
                                </div>
                                <div>
                                  <label><IndianRupee size={12} className="lbl-icon c-teal" /> Price Tag</label>
                                  <input
                                    type="number"
                                    className="prod-input"
                                    value={variant.price}
                                    min={0}
                                    placeholder={String(values.price || 'Price')}
                                    onChange={(e) => {
                                      setFieldValue(
                                        'variants',
                                        updateVariantList(values.variants, index, { price: e.target.value })
                                      );
                                    }}
                                  />
                                </div>
                                <div>
                                  <label><Percent size={12} className="lbl-icon c-rose" /> Discount %</label>
                                  <input
                                    type="number"
                                    className="prod-input"
                                    value={variant.discount}
                                    min={0}
                                    max={100}
                                    placeholder={String(values.discount_percent || '0')}
                                    onChange={(e) => {
                                      setFieldValue(
                                        'variants',
                                        updateVariantList(values.variants, index, { discount: e.target.value })
                                      );
                                    }}
                                  />
                                </div>
                                <div>
                                  <label><Hash size={12} className="lbl-icon c-sky" /> Stock Code</label>
                                  <div className="prod-code-row">
                                    <input className="prod-input" value={variant.stock_code} readOnly />
                                    <button
                                      type="button"
                                      className="prod-code-btn"
                                      title="Generate variant code"
                                      onClick={() => {
                                        const code = `${values.stock_code || generateStockCode()}-${String(index + 1).padStart(2, '0')}${Math.floor(Math.random() * 90 + 10)}`;
                                        setFieldValue(
                                          'variants',
                                          updateVariantList(values.variants, index, {
                                            stock_code: code,
                                            barcode: code,
                                          })
                                        );
                                      }}
                                    >
                                      <RefreshCw size={14} />
                                    </button>
                                  </div>
                                </div>

                                <div className="prod-variant-image">
                                  <label><ImageIcon size={12} className="lbl-icon c-amber" /> Variant Image</label>
                                  <div className="prod-variant-image-box">
                                    <div className="prod-variant-thumb">
                                      {variant.image_url ? (
                                        <img src={variant.image_url} alt={`${variant.color} ${variant.size}`} />
                                      ) : (
                                        <span><ImageIcon size={18} /></span>
                                      )}
                                      {isVariantUploading && (
                                        <div className="prod-image-uploading">
                                          <span className="prod-spinner dark" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="prod-variant-image-actions">
                                      <button
                                        type="button"
                                        className="prod-img-btn upload"
                                        disabled={isVariantUploading}
                                        onClick={() => {
                                          variantUploadTarget.current = { key: variant.key, setFieldValue };
                                          variantFileInputRef.current?.click();
                                        }}
                                      >
                                        <Upload size={14} /> Upload
                                      </button>
                                      <button
                                        type="button"
                                        className="prod-img-btn camera"
                                        disabled={isVariantUploading}
                                        onClick={() => {
                                          variantUploadTarget.current = { key: variant.key, setFieldValue };
                                          variantCameraInputRef.current?.click();
                                        }}
                                      >
                                        <Camera size={14} /> Camera
                                      </button>
                                      {variant.image_url && (
                                        <button
                                          type="button"
                                          className="prod-img-btn clear"
                                          onClick={() => {
                                            setFieldValue(
                                              'variants',
                                              updateVariantList(values.variants, index, { image_url: '' })
                                            );
                                          }}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                    <input
                                      className="prod-input"
                                      value={variant.image_url}
                                      placeholder="Or paste image URL"
                                      onChange={(e) => {
                                        setFieldValue(
                                          'variants',
                                          updateVariantList(values.variants, index, {
                                            image_url: e.target.value,
                                          })
                                        );
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="prod-variant-barcode">
                                  <label><ScanBarcode size={12} className="lbl-icon c-sky" /> Barcode</label>
                                  <StockBarcodePreview value={variant.barcode || variant.stock_code} />
                                  <div className="prod-variant-barcode-actions">
                                    <button
                                      type="button"
                                      className="prod-img-btn upload"
                                      title="Create barcode"
                                      onClick={() => {
                                        const code = variant.stock_code || generateStockCode();
                                        setFieldValue(
                                          'variants',
                                          updateVariantList(values.variants, index, {
                                            stock_code: code,
                                            barcode: code,
                                          })
                                        );
                                        toast.success(`${variant.color || 'Variant'} ${variant.size || ''} barcode created`);
                                      }}
                                    >
                                      <ScanBarcode size={14} /> Create
                                    </button>
                                    <button
                                      type="button"
                                      className="prod-img-btn upload"
                                      title="Download this variant barcode"
                                      disabled={!variant.barcode && !variant.stock_code}
                                      onClick={() => {
                                        const code = variant.barcode || variant.stock_code;
                                        const base = `${values.name || 'stock'}-${variant.color || 'color'}-${variant.size || 'size'}-${code}`
                                          .replace(/[^\w\-]+/g, '_')
                                          .slice(0, 80);
                                        downloadVariantBarcode(code, base);
                                      }}
                                    >
                                      <Download size={14} /> Barcode
                                    </button>
                                    <button
                                      type="button"
                                      className="prod-img-btn upload"
                                      title="Print this variant price tag"
                                      onClick={() => {
                                        printPriceTags(
                                          {
                                            name: values.name,
                                            brand: values.brand || COMPANY_NAME,
                                            sku: values.sku,
                                            price: values.price,
                                            sale_price: values.sale_price,
                                            discount_percent: values.discount_percent,
                                            barcode: values.barcode,
                                            stock_code: values.stock_code,
                                          },
                                          variant
                                        );
                                      }}
                                    >
                                      <Printer size={14} /> Print Tag
                                    </button>
                                    <button
                                      type="button"
                                      className="prod-img-btn upload"
                                      title="Download this variant price tag"
                                      onClick={() => {
                                        downloadVariantPriceTag(
                                          {
                                            name: values.name,
                                            brand: values.brand || COMPANY_NAME,
                                            sku: values.sku,
                                            price: values.price,
                                            sale_price: values.sale_price,
                                            discount_percent: values.discount_percent,
                                          },
                                          variant
                                        );
                                      }}
                                    >
                                      <TagIcon size={14} /> Tag File
                                    </button>
                                    <button
                                      type="button"
                                      className="prod-img-btn clear"
                                      title="Remove variant"
                                      onClick={() => {
                                        const next = values.variants.filter((_: StockVariant, i: number) => i !== index);
                                        setFieldValue('variants', next);
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                <div className="prod-variant-summary">
                                  <strong>{variant.color || 'Color'} · {variant.size || 'Size'}</strong>
                                  <span>
                                    {Number(variant.stock) || 0} stocks
                                    {variant.price !== '' && variant.price != null
                                      ? ` · Tag ₹${Number(variant.price).toFixed(0)}`
                                      : ''}
                                    {Number(variant.discount) > 0
                                      ? ` · ${Number(variant.discount)}% off → ₹${calcSalePrice(variant.price || values.price, variant.discount)}`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </div>

                        <div className="span-all">
                          <label><ImageIcon size={14} className="lbl-icon c-amber" /> Product Image</label>
                          <div className="prod-image-box">
                            <div className="prod-image-layout">
                              <div className="prod-image-preview">
                                {values.image_url ? (
                                  <img src={values.image_url} alt="Preview" />
                                ) : (
                                  <div className="prod-image-empty">
                                    <ImageIcon size={28} />
                                    <span>No image</span>
                                  </div>
                                )}
                                {uploading && (
                                  <div className="prod-image-uploading">
                                    <span className="prod-spinner dark" /> Uploading...
                                  </div>
                                )}
                              </div>
                              <div className="prod-image-side">
                                <div className="prod-image-actions">
                                  <button
                                    type="button"
                                    className="prod-img-btn upload"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <Upload size={15} /> Upload
                                  </button>
                                  <button
                                    type="button"
                                    className="prod-img-btn camera"
                                    disabled={uploading}
                                    onClick={() => cameraInputRef.current?.click()}
                                  >
                                    <Camera size={15} /> Camera
                                  </button>
                                  {values.image_url && (
                                    <button
                                      type="button"
                                      className="prod-img-btn clear"
                                      disabled={uploading}
                                      onClick={() => setFieldValue('image_url', '')}
                                    >
                                      <Trash2 size={15} /> Remove
                                    </button>
                                  )}
                                </div>
                                <div className="prod-image-url">
                                  <label><Link2 size={13} className="lbl-icon c-slate" /> Or paste image URL</label>
                                  <Field name="image_url" className="prod-input" placeholder="https://... or /api/uploads/..." />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="span-all">
                          <div className="prod-price-strip">
                            <div>
                              <label><IndianRupee size={14} className="lbl-icon c-teal" /> Price Tag</label>
                              <Field
                                name="price"
                                type="number"
                                className="prod-input"
                                placeholder="Main price tag"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  const price = e.target.value;
                                  setFieldValue('price', price);
                                  const sale = calcSalePrice(price, values.discount_percent);
                                  setFieldValue('sale_price', sale === '' ? '' : sale);
                                }}
                              />
                            </div>
                            <div>
                              <label><Percent size={14} className="lbl-icon c-rose" /> Discount %</label>
                              <Field
                                name="discount_percent"
                                type="number"
                                className="prod-input"
                                placeholder="Discount %"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  const discount = e.target.value;
                                  setFieldValue('discount_percent', discount);
                                  const sale = calcSalePrice(values.price, discount);
                                  setFieldValue('sale_price', sale === '' ? '' : sale);
                                }}
                              />
                            </div>
                            <div>
                              <label><IndianRupee size={14} className="lbl-icon c-orange" /> After Discount</label>
                              <Field name="sale_price" type="number" className="prod-input" placeholder="Sale price" />
                            </div>
                          </div>
                        </div>

                        {editing?.id && (
                          <div className="span-all prod-stock-ops">
                            <div className="prod-variant-head">
                              <div>
                                <label><SlidersHorizontal size={14} className="lbl-icon c-indigo" /> Stock Movements</label>
                                <p className="prod-hint">Stock In / Out / Adjustment / Transfer · also used for purchase, POS & returns</p>
                              </div>
                            </div>
                            <div className="prod-form-grid">
                              <div>
                                <label>Action</label>
                                <select
                                  className="prod-input"
                                  value={stockOp.type}
                                  onChange={(e) =>
                                    setStockOp((prev) => ({
                                      ...prev,
                                      type: e.target.value as typeof prev.type,
                                    }))
                                  }
                                >
                                  <option value="in">Stock In</option>
                                  <option value="purchase">Purchase In</option>
                                  <option value="out">Stock Out</option>
                                  <option value="pos">POS Sale Out</option>
                                  <option value="return">Return In</option>
                                  <option value="adjust">Stock Adjustment</option>
                                  <option value="transfer">Stock Transfer</option>
                                </select>
                              </div>
                              <div>
                                <label>Variant (Size & Colour)</label>
                                <select
                                  className="prod-input"
                                  value={stockOp.variant_id}
                                  onChange={(e) => setStockOp((prev) => ({ ...prev, variant_id: e.target.value }))}
                                >
                                  <option value="">Product total / no variant</option>
                                  {(values.variants || [])
                                    .filter((v: StockVariant) => v.id)
                                    .map((v: StockVariant) => (
                                      <option key={v.key} value={v.id || ''}>
                                        {v.color} · {v.size} · qty {v.stock}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              {stockOp.type === 'adjust' ? (
                                <div>
                                  <label>Set quantity to</label>
                                  <input
                                    className="prod-input"
                                    type="number"
                                    value={stockOp.set_qty}
                                    onChange={(e) => setStockOp((prev) => ({ ...prev, set_qty: e.target.value }))}
                                    placeholder="Absolute qty"
                                  />
                                </div>
                              ) : stockOp.type !== 'transfer' ? (
                                <div>
                                  <label>Quantity</label>
                                  <input
                                    className="prod-input"
                                    type="number"
                                    value={stockOp.qty}
                                    onChange={(e) => setStockOp((prev) => ({ ...prev, qty: e.target.value }))}
                                    placeholder="Qty"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label>From location</label>
                                  <input
                                    className="prod-input"
                                    value={stockOp.from_location}
                                    onChange={(e) => setStockOp((prev) => ({ ...prev, from_location: e.target.value }))}
                                    placeholder={values.warehouse || 'Current warehouse'}
                                  />
                                </div>
                              )}
                              {stockOp.type === 'transfer' && (
                                <div>
                                  <label>To location</label>
                                  <input
                                    className="prod-input"
                                    value={stockOp.to_location}
                                    onChange={(e) => setStockOp((prev) => ({ ...prev, to_location: e.target.value }))}
                                    placeholder="Destination warehouse"
                                  />
                                </div>
                              )}
                              <div className="span-2">
                                <label>Note</label>
                                <input
                                  className="prod-input"
                                  value={stockOp.note}
                                  onChange={(e) => setStockOp((prev) => ({ ...prev, note: e.target.value }))}
                                  placeholder="Optional reference note"
                                />
                              </div>
                            </div>
                            <div className="prod-stock-ops-actions">
                              <button
                                type="button"
                                className="prod-code-btn"
                                disabled={stockOpBusy || !canEdit}
                                onClick={submitStockOp}
                              >
                                {stockOp.type === 'in' || stockOp.type === 'purchase' || stockOp.type === 'return' ? (
                                  <ArrowDownToLine size={15} />
                                ) : stockOp.type === 'transfer' ? (
                                  <ArrowLeftRight size={15} />
                                ) : stockOp.type === 'adjust' ? (
                                  <SlidersHorizontal size={15} />
                                ) : (
                                  <ArrowUpFromLine size={15} />
                                )}
                                {stockOpBusy ? 'Saving...' : 'Apply Movement'}
                              </button>
                            </div>

                            <div className="prod-stock-history">
                              <div className="prod-variant-head">
                                <label><History size={14} className="lbl-icon c-sky" /> Stock History / Ledger</label>
                              </div>
                              {stockHistory.length === 0 ? (
                                <p className="prod-hint">No movements yet for this item.</p>
                              ) : (
                                <div className="prod-history-list">
                                  {stockHistory.map((h) => (
                                    <div key={h.id} className="prod-history-row">
                                      <div>
                                        <strong className="capitalize">{h.movement_type}</strong>
                                        <p>
                                          {h.size && h.color ? `${h.color} · ${h.size} · ` : ''}
                                          {h.qty > 0 ? '+' : ''}
                                          {h.qty} ({h.qty_before} → {h.qty_after})
                                          {h.note ? ` · ${h.note}` : ''}
                                        </p>
                                      </div>
                                      <span>{new Date(h.created_at).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="span-all">
                          <label><FileText size={14} className="lbl-icon c-sky" /> Description</label>
                          <Field as="textarea" name="description" rows={3} className="prod-input" placeholder="Description" />
                        </div>
                      </div>

                      <div className="prod-checks">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!values.is_featured}
                            onChange={(e) => setFieldValue('is_featured', e.target.checked)}
                          />
                          Featured
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!values.is_active}
                            onChange={(e) => setFieldValue('is_active', e.target.checked)}
                          />
                          Active
                        </label>
                      </div>
                    </section>

                    <div className="prod-oc-actions">
                      <button type="button" className="prod-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="prod-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><span className="prod-spinner" /> Saving...</>
                        ) : (
                          <><Save size={15} /> {editing ? 'Update Stock' : 'Save Stock'}</>
                        )}
                      </button>
                    </div>
                  </Form>
                  );
                }}
              </Formik>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
