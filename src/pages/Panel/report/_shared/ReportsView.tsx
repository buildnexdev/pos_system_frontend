/**
 * Shared reports page — Common Report UI/UX Standard
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  Users,
  ShoppingCart,
  ShoppingBag,
  Package,
  Warehouse,
  Building2,
  CircleDollarSign,
  ClipboardList,
  ShieldCheck,
  Phone,
  FileText as FileTextIcon,
  Tag,
  Undo2,
  X,
} from 'lucide-react';
import { reportServices } from '../../../../redux/report/report.services';
import { REPORT_MENU_ITEMS } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import {
  ReportHeader,
  ReportKpis,
  ReportTable,
  downloadBlob,
  formatReportCell,
  moneyInr,
  rowsToCsv,
  type ReportColumn,
} from './ui';

type Filters = {
  date_from: string;
  date_to: string;
  q: string;
  status: string;
  source: string;
  payment_status: string;
  payment_method: string;
  cashier: string;
  customer: string;
  warehouse: string;
  branch: string;
  active: string;
  city: string;
  min_orders: string;
};

const emptyFilters: Filters = {
  date_from: '',
  date_to: '',
  q: '',
  status: '',
  source: '',
  payment_status: '',
  payment_method: '',
  cashier: '',
  customer: '',
  warehouse: '',
  branch: '',
  active: '',
  city: '',
  min_orders: '',
};

const REPORT_ICONS: Record<string, React.ReactNode> = {
  users: <Users size={18} strokeWidth={1.75} />,
  sales: <ShoppingCart size={18} strokeWidth={1.75} />,
  product: <ShoppingBag size={18} strokeWidth={1.75} />,
  stock: <Package size={18} strokeWidth={1.75} />,
  warehouse: <Warehouse size={18} strokeWidth={1.75} />,
  branch: <Building2 size={18} strokeWidth={1.75} />,
  billing: <CircleDollarSign size={18} strokeWidth={1.75} />,
  invoice: <FileTextIcon size={18} strokeWidth={1.75} />,
  bill: <CircleDollarSign size={18} strokeWidth={1.75} />,
  refund: <Undo2 size={18} strokeWidth={1.75} />,
  month: <ClipboardList size={18} strokeWidth={1.75} />,
  day: <ClipboardList size={18} strokeWidth={1.75} />,
  upi: <CircleDollarSign size={18} strokeWidth={1.75} />,
  barcode: <Tag size={18} strokeWidth={1.75} />,
  auditlog: <ShieldCheck size={18} strokeWidth={1.75} />,
  auditing: <ShieldCheck size={18} strokeWidth={1.75} />,
};

/** Preferred preview columns; export still uses full API columns. */
const TABLE_PREVIEW_KEYS: Record<string, string[]> = {
  users: ['employee_code', 'name', 'role_name', 'phone', 'is_active'],
  sales: [
    'invoice_no', 'order_number', 'created_at', 'shipping_name', 'shipping_phone',
    'cashier_name', 'branch_name', 'item_qty', 'subtotal', 'total_discount',
    'tax_amount', 'total', 'payment_method', 'payment_status',
  ],
  day: [
    'invoice_no', 'order_number', 'created_at', 'shipping_name', 'shipping_phone',
    'cashier_name', 'branch_name', 'item_qty', 'subtotal', 'total_discount',
    'tax_amount', 'total', 'payment_method', 'payment_status',
  ],
  product: ['product_name', 'qty', 'amount'],
  stock: ['product_name', 'stock_code', 'available_qty', 'status', 'warehouse_name'],
  billing: ['invoice_no', 'customer_name', 'total', 'status', 'created_at'],
  invoice: ['invoice_no', 'customer_name', 'total', 'status', 'created_at'],
  bill: ['invoice_no', 'customer_name', 'total', 'status', 'created_at'],
  refund: ['order_number', 'invoice_no', 'shipping_name', 'refund_amount', 'status', 'created_at'],
  month: ['period', 'orders', 'gross_sales', 'net_revenue', 'refund_amount'],
  upi: ['order_number', 'invoice_no', 'amount', 'reference_no', 'status', 'paid_at', 'cashier_name'],
  barcode: ['product_name', 'sku', 'barcode', 'size', 'color', 'available_qty'],
  branch: ['name', 'city', 'is_active'],
  warehouse: ['name', 'code', 'branch_name', 'is_active'],
  auditlog: ['order_number', 'from_status', 'to_status', 'created_at'],
  auditing: ['order_number', 'from_status', 'to_status', 'created_at'],
};

function initials(name: unknown) {
  const parts = String(name || 'S').trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'S';
}

function titleFor(type: string) {
  return REPORT_MENU_ITEMS.find((r) => r.type === type)?.label || 'Report';
}

function kpiEntries(summary: Record<string, any>, type?: string) {
  const salesOrder = [
    'orders', 'gross_sales', 'net_revenue', 'avg_order_value', 'total_discounts', 'refund_amount',
  ];
  const order =
    type === 'sales' || type === 'day' || type === 'month' || type === 'refund'
      ? salesOrder
      : [
          'staff', 'roles', 'customers', 'orders', 'revenue', 'avg_spend', 'avg_ticket', 'paid',
          'products', 'qty', 'amount', 'skus', 'available', 'low_stock', 'out_of_stock',
          'warehouses', 'reserved', 'branches', 'active', 'inactive', 'cities',
          'invoices', 'tax', 'events', 'transitions',
        ];
  const labels: Record<string, string> = {
    staff: 'Staff',
    roles: 'Roles',
    customers: 'Customers',
    orders: 'Total Orders',
    gross_sales: 'Gross Sales',
    net_revenue: 'Net Revenue',
    avg_order_value: 'Average Order Value',
    total_discounts: 'Total Discounts',
    refund_amount: 'Refund Amount',
    revenue: 'Revenue',
    avg_spend: 'Avg spend',
    avg_ticket: 'Avg ticket',
    paid: 'Paid',
    products: 'Products',
    qty: 'Qty sold',
    amount: 'Amount',
    skus: 'SKUs',
    available: 'Available',
    low_stock: 'Low stock',
    out_of_stock: 'Out of stock',
    warehouses: 'Warehouses',
    reserved: 'Reserved',
    branches: 'Branches',
    active: 'Active',
    inactive: 'Inactive',
    cities: 'Cities',
    invoices: 'Invoices',
    tax: 'Tax',
    events: 'Events',
    transitions: 'Transitions',
  };
  const moneyKeys = [
    'revenue', 'avg_spend', 'avg_ticket', 'amount', 'tax', 'total',
    'gross_sales', 'net_revenue', 'avg_order_value', 'total_discounts', 'refund_amount',
  ];
  const limit = type === 'sales' || type === 'day' || type === 'month' || type === 'refund' ? 6 : 6;
  const items = order
    .filter((k) => summary[k] != null)
    .slice(0, limit)
    .map((k) => ({
      key: k,
      label: labels[k] || k,
      value: moneyKeys.includes(k) ? moneyInr(summary[k]) : String(summary[k]),
    }));

  if (!items.length && summary) {
    return [{ key: 'records', label: 'Total Records', value: String(summary.orders ?? summary.events ?? 0) }];
  }
  return items;
}

function renderUsersCell(key: string, row: any, formatted: string) {
  if (key === 'name') {
    return (
      <div className="rs-person">
        <span className="rs-avatar">{initials(row.name)}</span>
        <div>
          <strong>{formatted}</strong>
          {row.email ? <small>{String(row.email)}</small> : null}
        </div>
      </div>
    );
  }
  if (key === 'role_name') return <span className="rs-chip">{formatted}</span>;
  if (key === 'is_active') {
    const on = Number(row.is_active) === 1;
    return <span className={`rs-chip ${on ? 'on' : 'off'}`}>{on ? 'Active' : 'Inactive'}</span>;
  }
  if (key === 'phone') {
    return (
      <span className="rs-inline">
        <Phone size={13} /> {formatted}
      </span>
    );
  }
  if (key === 'employee_code') return <span className="rs-code">{formatted}</span>;
  return formatted;
}

function renderSalesCell(key: string, row: any, formatted: string) {
  if (key === 'order_number' || key === 'invoice_no') return <span className="rs-code">{formatted}</span>;
  if (key === 'shipping_name') {
    return (
      <div className="rs-person">
        <span className="rs-avatar">{initials(row.shipping_name)}</span>
        <div><strong>{formatted}</strong></div>
      </div>
    );
  }
  if (key === 'shipping_phone') {
    return (
      <span className="rs-inline">
        <Phone size={13} /> {formatted}
      </span>
    );
  }
  if (key === 'status' || key === 'fulfillment_status' || key === 'payment_status') {
    const s = String(row[key] || '').toLowerCase();
    const on = ['delivered', 'paid', 'confirmed', 'processing', 'packed', 'shipped'].includes(s);
    const off = ['cancelled', 'failed', 'returned', 'refunded', 'refund_pending'].includes(s);
    return <span className={`rs-chip ${on ? 'on' : off ? 'off' : ''}`}>{formatted}</span>;
  }
  if (key === 'payment_method') return <span className="rs-chip">{String(row.payment_method || '—').toUpperCase()}</span>;
  if (['total', 'subtotal', 'total_discount', 'tax_amount'].includes(key)) {
    return <strong className="rs-money">{formatted}</strong>;
  }
  return formatted;
}

export default function ReportsPage() {
  const { type: typeParam } = useParams();
  const type = (typeParam || 'sales').toLowerCase();
  const dlRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);
  const [showColFilters, setShowColFilters] = useState(true);
  const [columnsMenuSignal, setColumnsMenuSignal] = useState(0);

  const heading = useMemo(() => titleFor(type), [type]);
  const icon = REPORT_ICONS[type] || <BarChart3 size={18} strokeWidth={1.75} />;

  useEffect(() => {
    setSearch('');
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setDlOpen(false);
    setShowColFilters(true);
  }, [type]);

  useEffect(() => {
    if (filtersOpen) {
      requestAnimationFrame(() => setFiltersVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFiltersVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!dlRef.current?.contains(e.target as Node)) setDlOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reportServices.http
      .get('/panel/reports', {
        params: {
          type,
          q: applied.q || undefined,
          date_from: applied.date_from || undefined,
          date_to: applied.date_to || undefined,
          status: applied.status || undefined,
          source: applied.source || undefined,
          payment_status: applied.payment_status || undefined,
          payment_method: applied.payment_method || undefined,
          cashier: applied.cashier || undefined,
          customer: applied.customer || undefined,
          warehouse: applied.warehouse || undefined,
          branch: applied.branch || undefined,
          active: applied.active || undefined,
          city: applied.city || undefined,
          min_orders: applied.min_orders || undefined,
        },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          toast.error(e.response?.data?.message || 'Failed to load report');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, applied]);

  const columns: ReportColumn[] = data?.columns || [];
  const rows = data?.rows || [];
  const tableColumns = useMemo(() => {
    const keys = TABLE_PREVIEW_KEYS[type];
    if (!keys?.length || !columns.length) return columns;
    const picked = keys
      .map((key) => columns.find((c) => c.key === key))
      .filter(Boolean) as ReportColumn[];
    return picked.length ? picked : columns.slice(0, 8);
  }, [type, columns]);

  const kpis = useMemo(() => {
    const base = kpiEntries(data?.summary || {}, type);
    if (!base.find((k) => k.key === 'records')) {
      return [{ key: 'records', label: 'Total Records', value: String(rows.length) }, ...base].slice(0, 6);
    }
    return base;
  }, [data?.summary, type, rows.length]);

  const filterOptions = data?.filter_options || null;
  const fileBase = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

  const activeFilterCount = Object.entries(applied).filter(([key, value]) => {
    if (key === 'q') return false;
    return Boolean(value);
  }).length;

  const runSearch = () => setApplied((prev) => ({ ...prev, q: search.trim() }));
  const openFilters = () => {
    setDraft({ ...applied });
    setFiltersOpen(true);
  };
  const applyFilters = () => {
    setApplied({ ...draft, q: search.trim() });
    setFiltersOpen(false);
    toast.success('Filters applied');
  };
  const clearFilters = () => {
    setDraft(emptyFilters);
    setApplied({ ...emptyFilters, q: search.trim() });
    setFiltersOpen(false);
    toast.success('Filters cleared');
  };
  const clearAll = () => {
    setSearch('');
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setFiltersOpen(false);
    toast.success('All filters cleared');
  };

  const exportColumns = columns.length ? columns : tableColumns;
  const exportRows = rows;

  const downloadCsv = () => {
    if (!exportRows.length) return toast.error('No rows to export');
    downloadBlob(`${fileBase}.csv`, rowsToCsv(exportColumns, exportRows), 'text/csv;charset=utf-8');
    setDlOpen(false);
    toast.success('CSV downloaded');
  };

  const downloadExcel = () => {
    if (!exportRows.length) return toast.error('No rows to export');
    const sheetRows = exportRows.map((row: any) => {
      const out: Record<string, string> = {};
      exportColumns.forEach((c) => {
        out[c.label] = formatReportCell(c.key, row[c.key]);
      });
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
    setDlOpen(false);
    toast.success('Excel downloaded');
  };

  const openPrintable = () => {
    if (!exportRows.length) return toast.error('No rows to export');
    const head = exportColumns.map((c) => `<th>${c.label}</th>`).join('');
    const body = exportRows
      .slice(0, 1000)
      .map((row: any) => `<tr>${exportColumns.map((c) => `<td>${formatReportCell(c.key, row[c.key])}</td>`).join('')}</tr>`)
      .join('');
    const kpiHtml = kpis.map((k) => `<div class="kpi"><span>${k.label}</span><strong>${k.value}</strong></div>`).join('');
    const html = `<!doctype html><html><head><title>${heading}</title>
      <style>
        body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#111}
        h1{margin:0 0 8px;font-size:18px}
        .meta{color:#666;font-size:12px;margin-bottom:16px}
        .kpis{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
        .kpi{border:1px solid #999;padding:8px 12px;min-width:110px}
        .kpi span{display:block;font-size:11px;color:#666}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th,td{border:1px solid #444;padding:6px 8px;text-align:left}
        th{background:#e5e5e5}
      </style></head><body>
      <h1>${heading}</h1>
      <div class="meta">Generated ${new Date().toLocaleString('en-IN')} · ${exportRows.length} rows</div>
      <div class="kpis">${kpiHtml}</div>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) return toast.error('Allow popups for print / PDF');
    w.document.write(html);
    w.document.close();
    setDlOpen(false);
  };

  const showDate = ['users', 'sales', 'day', 'month', 'product', 'billing', 'invoice', 'bill', 'refund', 'upi', 'auditing', 'auditlog'].includes(type);
  const showStatus = ['sales', 'day', 'month', 'stock', 'billing', 'invoice', 'bill', 'refund', 'auditing', 'auditlog'].includes(type);
  const showSource = ['sales', 'day', 'month', 'refund'].includes(type);
  const showPayment = ['sales', 'day', 'month', 'refund', 'upi'].includes(type);
  const showPaymentMethod = ['sales', 'day', 'month', 'refund'].includes(type);
  const showCashier = ['sales', 'day', 'month', 'refund', 'upi'].includes(type);
  const showCustomer = ['sales', 'day', 'month', 'refund', 'invoice', 'bill'].includes(type);
  const showWarehouse = type === 'stock';
  const showBranch = ['sales', 'day', 'month', 'refund', 'upi'].includes(type);
  const showActive = ['users', 'branch'].includes(type);
  const showCity = ['users', 'branch'].includes(type);

  const isUsers = type === 'users';
  const isSales = type === 'sales' || type === 'day';

  return (
    <div className="rs-page">
      <div className="rs-panel">
        <ReportHeader
          title={heading}
          icon={icon}
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={runSearch}
          searchPlaceholder={
            isUsers
              ? 'Search name, phone, emp id…'
              : isSales
                ? 'Invoice / Order ID, customer, phone…'
                : 'Search report…'
          }
          filterCount={activeFilterCount}
          onOpenFilters={openFilters}
          showColFilters={showColFilters}
          onToggleColFilters={() => setShowColFilters((v) => !v)}
          onOpenColumns={() => setColumnsMenuSignal((n) => n + 1)}
          downloadOpen={dlOpen}
          onToggleDownload={() => setDlOpen((v) => !v)}
          downloadRef={dlRef}
          onExcel={downloadExcel}
          onCsv={downloadCsv}
          onPdf={openPrintable}
          onPrint={openPrintable}
          onClearAll={clearAll}
          clearDisabled={!search && !activeFilterCount}
        />

        <div className="rs-body">
          {loading ? (
            <div className="rs-loading"><Loader /><p>Loading report…</p></div>
          ) : !data ? (
            <div className="rs-empty">Could not load this report.</div>
          ) : (
            <>
              <ReportKpis items={kpis} />
              <ReportTable
                title={heading}
                columns={tableColumns}
                rows={rows}
                columnsMenuSignal={columnsMenuSignal}
                showColFilters={showColFilters}
                onShowColFiltersChange={setShowColFilters}
                emptyText="No records match these filters."
                renderCell={(key, row, formatted) =>
                  isUsers
                    ? renderUsersCell(key, row, formatted)
                    : isSales
                      ? renderSalesCell(key, row, formatted)
                      : formatted
                }
              />
            </>
          )}
        </div>
      </div>

      {filtersOpen &&
        createPortal(
          <div className={`rs-overlay ${filtersVisible ? 'is-open' : ''}`}>
            <div className="rs-backdrop" onClick={() => setFiltersOpen(false)} />
            <aside className="rs-offcanvas" role="dialog" aria-modal="true">
              <button type="button" className="rs-oc-close" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
              <div className="rs-oc-head">
                <h2>Filters</h2>
                <p>Set conditions, then apply</p>
              </div>
              <div className="rs-oc-body">
                {showDate && (
                  <div className="rs-oc-dates">
                    <label>From date
                      <input className="rs-input" type="date" value={draft.date_from} onChange={(e) => setDraft((f) => ({ ...f, date_from: e.target.value }))} />
                    </label>
                    <label>To date
                      <input className="rs-input" type="date" value={draft.date_to} onChange={(e) => setDraft((f) => ({ ...f, date_to: e.target.value }))} />
                    </label>
                  </div>
                )}
                {showStatus && (
                  <label>Status
                    <select className="rs-input" value={draft.status} onChange={(e) => setDraft((f) => ({ ...f, status: e.target.value }))}>
                      <option value="">All</option>
                      {type === 'stock' && (
                        <>
                          <option value="in_stock">In stock</option>
                          <option value="low_stock">Low stock</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="reserved">Reserved</option>
                        </>
                      )}
                      {(type === 'billing' || type === 'invoice' || type === 'bill') && (
                        <>
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </>
                      )}
                      {['sales', 'day', 'month', 'refund', 'auditing', 'auditlog'].includes(type) && (
                        <>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                          <option value="refunded">Refunded</option>
                        </>
                      )}
                    </select>
                  </label>
                )}
                {showSource && (
                  <label>Order Source
                    <select className="rs-input" value={draft.source} onChange={(e) => setDraft((f) => ({ ...f, source: e.target.value }))}>
                      <option value="">All</option>
                      {(filterOptions?.order_sources || ['pos', 'online', 'admin']).map((s: string) => (
                        <option key={s} value={s}>{String(s).toUpperCase()}</option>
                      ))}
                    </select>
                  </label>
                )}
                {showPayment && (
                  <label>Payment Status
                    <select className="rs-input" value={draft.payment_status} onChange={(e) => setDraft((f) => ({ ...f, payment_status: e.target.value }))}>
                      <option value="">All</option>
                      {(filterOptions?.payment_statuses || ['pending', 'paid', 'failed', 'refund_pending', 'refunded']).map((s: string) => (
                        <option key={s} value={s}>{String(s).replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </label>
                )}
                {showPaymentMethod && (
                  <label>Payment Method
                    <select className="rs-input" value={draft.payment_method} onChange={(e) => setDraft((f) => ({ ...f, payment_method: e.target.value }))}>
                      <option value="">All</option>
                      {(filterOptions?.payment_methods || ['cash', 'upi', 'card', 'credit', 'online', 'cod', 'split']).map((s: string) => (
                        <option key={s} value={s}>{String(s).toUpperCase()}</option>
                      ))}
                    </select>
                  </label>
                )}
                {showCashier && (
                  <label>Cashier / Staff
                    {filterOptions?.cashiers?.length ? (
                      <select className="rs-input" value={draft.cashier} onChange={(e) => setDraft((f) => ({ ...f, cashier: e.target.value }))}>
                        <option value="">All</option>
                        {filterOptions.cashiers.map((c: any) => (
                          <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="rs-input" value={draft.cashier} onChange={(e) => setDraft((f) => ({ ...f, cashier: e.target.value }))} placeholder="Cashier name" />
                    )}
                  </label>
                )}
                {showCustomer && (
                  <label>Customer
                    <input className="rs-input" value={draft.customer} onChange={(e) => setDraft((f) => ({ ...f, customer: e.target.value }))} placeholder="Name or phone" />
                  </label>
                )}
                {showWarehouse && (
                  <label>Warehouse
                    <input className="rs-input" value={draft.warehouse} onChange={(e) => setDraft((f) => ({ ...f, warehouse: e.target.value }))} placeholder="Warehouse name" />
                  </label>
                )}
                {showBranch && (
                  <label>Branch
                    {filterOptions?.branches?.length ? (
                      <select className="rs-input" value={draft.branch} onChange={(e) => setDraft((f) => ({ ...f, branch: e.target.value }))}>
                        <option value="">All</option>
                        {filterOptions.branches.map((b: any) => (
                          <option key={b.id} value={b.name}>{b.name}{b.code ? ` (${b.code})` : ''}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="rs-input" value={draft.branch} onChange={(e) => setDraft((f) => ({ ...f, branch: e.target.value }))} placeholder="Branch name or code" />
                    )}
                  </label>
                )}
                {showCity && (
                  <label>City
                    <input className="rs-input" value={draft.city} onChange={(e) => setDraft((f) => ({ ...f, city: e.target.value }))} placeholder="City" />
                  </label>
                )}
                {showActive && (
                  <label>Active
                    <select className="rs-input" value={draft.active} onChange={(e) => setDraft((f) => ({ ...f, active: e.target.value }))}>
                      <option value="">All</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </label>
                )}
              </div>
              <div className="rs-oc-footer">
                <button type="button" className="rs-btn-ghost" onClick={clearFilters}>Clear</button>
                <button type="button" className="rs-btn-primary" onClick={applyFilters}>Apply Filters</button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
