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
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  ChevronDown,
} from 'lucide-react';
import { reportServices } from '../../../../redux/report/report.services';
import { REPORT_MENU_ITEMS } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './ReportsView.scss';

type Filters = {
  date_from: string;
  date_to: string;
  q: string;
  status: string;
  source: string;
  payment_status: string;
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
  warehouse: '',
  branch: '',
  active: '',
  city: '',
  min_orders: '',
};

const REPORT_ICONS: Record<string, React.ReactNode> = {
  users: <Users size={22} />,
  sales: <ShoppingCart size={22} />,
  product: <ShoppingBag size={22} />,
  stock: <Package size={22} />,
  warehouse: <Warehouse size={22} />,
  branch: <Building2 size={22} />,
  billing: <CircleDollarSign size={22} />,
  day: <ClipboardList size={22} />,
  auditing: <ShieldCheck size={22} />,
};

function money(n: unknown) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function titleFor(type: string) {
  return REPORT_MENU_ITEMS.find((r) => r.type === type)?.label || 'Report';
}

function formatCell(key: string, value: unknown) {
  if (value == null || value === '') return '—';
  if (String(key).includes('created') || key === 'latest' || key === 'join_date') {
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) {
      return key === 'join_date' ? d.toLocaleDateString() : d.toLocaleString();
    }
  }
  if (
    [
      'spent', 'total', 'amount', 'tax', 'tax_amount', 'revenue', 'avg_spend', 'avg_ticket',
      'subtotal', 'discount', 'coupon_discount', 'shipping_fee', 'round_off', 'amount_received', 'change_amount',
    ].includes(key)
  ) {
    return money(value);
  }
  if (key === 'is_active') return Number(value) ? 'Yes' : 'No';
  return String(value);
}

function downloadBlob(filename: string, content: string | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function rowsToCsv(columns: Array<{ key: string; label: string }>, rows: any[]) {
  const head = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => `"${String(formatCell(c.key, row[c.key])).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

function kpiEntries(summary: Record<string, any>) {
  const order = [
    'staff', 'roles', 'customers', 'orders', 'revenue', 'avg_spend', 'avg_ticket', 'paid',
    'products', 'qty', 'amount', 'skus', 'available', 'low_stock', 'out_of_stock',
    'warehouses', 'reserved', 'branches', 'active', 'inactive', 'cities',
    'invoices', 'tax', 'events', 'transitions',
  ];
  const labels: Record<string, string> = {
    staff: 'Staff',
    roles: 'Roles',
    customers: 'Customers',
    orders: 'Orders',
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
  return order
    .filter((k) => summary[k] != null)
    .slice(0, 4)
    .map((k) => ({
      key: k,
      label: labels[k] || k,
      value: ['revenue', 'avg_spend', 'avg_ticket', 'amount', 'tax', 'total'].includes(k)
        ? money(summary[k])
        : String(summary[k]),
    }));
}

export default function ReportsPage() {
  const { type: typeParam } = useParams();
  const type = (typeParam || 'users').toLowerCase();
  const dlRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);

  const heading = useMemo(() => titleFor(type), [type]);
  const icon = REPORT_ICONS[type] || <BarChart3 size={22} />;

  useEffect(() => {
    setSearch('');
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setDlOpen(false);
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

  const columns = data?.columns || [];
  const rows = data?.rows || [];
  const kpis = kpiEntries(data?.summary || {});
  const fileBase = `${type}-report-${new Date().toISOString().slice(0, 10)}`;

  const activeFilterCount = Object.entries(applied).filter(([key, value]) => {
    if (key === 'q') return false;
    return Boolean(value);
  }).length;

  const runSearch = () => {
    setApplied((prev) => ({ ...prev, q: search.trim() }));
  };

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

  const downloadCsv = () => {
    if (!rows.length) return toast.error('No rows to export');
    downloadBlob(`${fileBase}.csv`, rowsToCsv(columns, rows), 'text/csv;charset=utf-8');
    setDlOpen(false);
    toast.success('CSV downloaded');
  };

  const downloadExcel = () => {
    if (!rows.length) return toast.error('No rows to export');
    const sheetRows = rows.map((row: any) => {
      const out: Record<string, string> = {};
      columns.forEach((c: any) => {
        out[c.label] = formatCell(c.key, row[c.key]);
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

  const downloadPdf = () => {
    if (!rows.length) return toast.error('No rows to export');
    const head = columns.map((c: any) => `<th>${c.label}</th>`).join('');
    const body = rows
      .slice(0, 500)
      .map((row: any) => `<tr>${columns.map((c: any) => `<td>${formatCell(c.key, row[c.key])}</td>`).join('')}</tr>`)
      .join('');
    const kpiHtml = kpis.map((k) => `<div class="kpi"><span>${k.label}</span><strong>${k.value}</strong></div>`).join('');
    const html = `<!doctype html><html><head><title>${heading}</title>
      <style>
        body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#0f172a}
        h1{margin:0 0 8px}
        .meta{color:#64748b;font-size:12px;margin-bottom:16px}
        .kpis{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
        .kpi{background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:10px 14px;min-width:120px}
        .kpi span{display:block;font-size:11px;color:#64748b}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}
        th{background:#f8fafc}
      </style></head><body>
      <h1>${heading}</h1>
      <div class="meta">Generated ${new Date().toLocaleString()} · ${rows.length} rows</div>
      <div class="kpis">${kpiHtml}</div>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) return toast.error('Allow popups for PDF print');
    w.document.write(html);
    w.document.close();
    setDlOpen(false);
  };

  const showDate = ['users', 'sales', 'day', 'product', 'billing', 'auditing'].includes(type);
  const showStatus = ['sales', 'day', 'stock', 'billing', 'auditing'].includes(type);
  const showSource = ['sales', 'day'].includes(type);
  const showPayment = ['sales', 'day'].includes(type);
  const showWarehouse = type === 'stock';
  const showBranch = ['sales', 'day'].includes(type);
  const showActive = ['users', 'branch'].includes(type);
  const showCity = ['users', 'branch'].includes(type);
  const showMinOrders = false;

  return (
    <div className="rpt-page">
      <div className="rpt-panel">
        <div className="rpt-toolbar">
          <div className="rpt-hero">
            <span className="rpt-hero-icon">{icon}</span>
            <div>
              <h1>{heading}</h1>
              <p>{rows.length} records</p>
            </div>
          </div>

          <label className="rpt-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder={type === 'users' ? 'Search staff…' : 'Search report…'}
            />
          </label>

          <div className="rpt-toolbar-end">
            <button
              type="button"
              className={`rpt-mini-btn ${activeFilterCount ? 'is-on' : ''}`}
              onClick={openFilters}
            >
              <Filter size={14} />
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>

            <div className="rpt-dl" ref={dlRef}>
              <button type="button" className="rpt-mini-btn" onClick={() => setDlOpen((v) => !v)}>
                <Download size={14} /> Download <ChevronDown size={14} />
              </button>
              {dlOpen && (
                <div className="rpt-dl-menu">
                  <button type="button" onClick={downloadPdf}><FileText size={14} /> PDF</button>
                  <button type="button" onClick={downloadCsv}><Download size={14} /> CSV</button>
                  <button type="button" onClick={downloadExcel}><FileSpreadsheet size={14} /> Excel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rpt-body">
          {loading ? (
            <div className="rpt-loading"><Loader /><p>Loading report…</p></div>
          ) : !data ? (
            <div className="rpt-empty">Could not load this report.</div>
          ) : (
            <>
              {!!kpis.length && (
                <div className="rpt-kpis">
                  {kpis.map((k) => (
                    <div key={k.key} className="rpt-kpi">
                      <span>{k.label}</span>
                      <strong>{k.value}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="rpt-table-wrap">
                {!rows.length ? (
                  <div className="rpt-empty">No records match these filters.</div>
                ) : (
                  <table className="rpt-table">
                    <thead>
                      <tr>
                        {columns.map((c: any) => (
                          <th key={c.key}>{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: any, idx: number) => (
                        <tr key={row.id || row.order_number || row.invoice_no || idx}>
                          {columns.map((c: any) => (
                            <td key={c.key}>{formatCell(c.key, row[c.key])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {filtersOpen &&
        createPortal(
          <div className={`rpt-overlay ${filtersVisible ? 'is-open' : ''}`}>
            <div className="rpt-backdrop" onClick={() => setFiltersOpen(false)} />
            <aside className={`rpt-offcanvas ${filtersVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <button type="button" className="rpt-oc-close" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
              <div className="rpt-oc-head">
                <h2>Filters</h2>
                <p>Set date and conditions, then apply</p>
              </div>
              <div className="rpt-oc-body">
                {showDate && (
                  <div className="rpt-oc-dates">
                    <label>From date
                      <input className="rpt-input" type="date" value={draft.date_from} onChange={(e) => setDraft((f) => ({ ...f, date_from: e.target.value }))} />
                    </label>
                    <label>To date
                      <input className="rpt-input" type="date" value={draft.date_to} onChange={(e) => setDraft((f) => ({ ...f, date_to: e.target.value }))} />
                    </label>
                  </div>
                )}
                {showStatus && (
                  <label>Status
                    <select className="rpt-input" value={draft.status} onChange={(e) => setDraft((f) => ({ ...f, status: e.target.value }))}>
                      <option value="">All</option>
                      {type === 'stock' && (
                        <>
                          <option value="in_stock">In stock</option>
                          <option value="low_stock">Low stock</option>
                          <option value="out_of_stock">Out of stock</option>
                          <option value="reserved">Reserved</option>
                        </>
                      )}
                      {type === 'billing' && (
                        <>
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </>
                      )}
                      {(type === 'sales' || type === 'day' || type === 'auditing') && (
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
                  <label>Source
                    <select className="rpt-input" value={draft.source} onChange={(e) => setDraft((f) => ({ ...f, source: e.target.value }))}>
                      <option value="">All</option>
                      <option value="online">Online</option>
                      <option value="pos">POS</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                )}
                {showPayment && (
                  <label>Payment
                    <select className="rpt-input" value={draft.payment_status} onChange={(e) => setDraft((f) => ({ ...f, payment_status: e.target.value }))}>
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </label>
                )}
                {showWarehouse && (
                  <label>Warehouse
                    <input className="rpt-input" value={draft.warehouse} onChange={(e) => setDraft((f) => ({ ...f, warehouse: e.target.value }))} placeholder="Warehouse name" />
                  </label>
                )}
                {showBranch && (
                  <label>Branch
                    <input className="rpt-input" value={draft.branch} onChange={(e) => setDraft((f) => ({ ...f, branch: e.target.value }))} placeholder="Branch name or code" />
                  </label>
                )}
                {showCity && (
                  <label>City
                    <input className="rpt-input" value={draft.city} onChange={(e) => setDraft((f) => ({ ...f, city: e.target.value }))} placeholder="City" />
                  </label>
                )}
                {showActive && (
                  <label>Active
                    <select className="rpt-input" value={draft.active} onChange={(e) => setDraft((f) => ({ ...f, active: e.target.value }))}>
                      <option value="">All</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </label>
                )}
                {showMinOrders && (
                  <label>Min orders
                    <input className="rpt-input" type="number" min={0} value={draft.min_orders} onChange={(e) => setDraft((f) => ({ ...f, min_orders: e.target.value }))} placeholder="0" />
                  </label>
                )}
              </div>
              <div className="rpt-oc-footer">
                <button type="button" className="rpt-btn-ghost" onClick={clearFilters}>Clear</button>
                <button type="button" className="rpt-btn-primary" onClick={applyFilters}>Apply Filters</button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
