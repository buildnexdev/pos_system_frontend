import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  Wallet,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Layers,
  Package,
  ShoppingCart,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  ChevronDown,
} from 'lucide-react';
import { financeServices } from '../../../../redux/finance/finance.services';
import { FINANCE_MENU_ITEMS } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './FinanceBooksView.scss';

type Filters = {
  date_from: string;
  date_to: string;
  entry_type: string;
  category: string;
  q: string;
};

const emptyFilters: Filters = {
  date_from: '',
  date_to: '',
  entry_type: '',
  category: '',
  q: '',
};

const ICONS: Record<string, React.ReactNode> = {
  accounts: <Wallet size={22} />,
  bank: <Building2 size={22} />,
  cash: <CircleDollarSign size={22} />,
  ledger: <ClipboardList size={22} />,
  journal: <Layers size={22} />,
  daybook: <ClipboardList size={22} />,
  expense: <Package size={22} />,
  spent: <ShoppingCart size={22} />,
  billing: <CircleDollarSign size={22} />,
};

const FINANCE_COLUMNS = [
  { key: 'entry_date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'reference_no', label: 'Reference' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
];

const BILLING_COLUMNS = [
  { key: 'invoice_no', label: 'Invoice' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
  { key: 'tax', label: 'Tax' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Date' },
];

function money(n: unknown) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function titleFor(type: string) {
  return FINANCE_MENU_ITEMS.find((r) => r.type === type)?.label || 'Finance';
}

function formatCell(key: string, value: unknown) {
  if (value == null || value === '') return '—';
  if (key === 'entry_date') return String(value).slice(0, 10);
  if (key === 'created_at') {
    const d = new Date(String(value));
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  if (['amount', 'tax', 'total'].includes(key)) return money(value);
  if (key === 'type' || key === 'status') return String(value);
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
    .map((row) => columns.map((c) => `"${String(formatCell(c.key, row[c.key])).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  return `${head}\n${body}`;
}

export default function FinanceBooksPage() {
  const { type: typeParam } = useParams();
  const type = (typeParam || 'accounts').toLowerCase();
  const valid = FINANCE_MENU_ITEMS.some((m) => m.type === type);
  const dlRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);

  const heading = useMemo(() => titleFor(type), [type]);
  const columns = type === 'billing' ? BILLING_COLUMNS : FINANCE_COLUMNS;
  const icon = ICONS[type] || <Wallet size={22} />;
  const fileBase = `finance-${type}-${new Date().toISOString().slice(0, 10)}`;

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
    if (!valid) return;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        if (type === 'billing') {
          const { data } = await financeServices.http.get('/panel/reports', {
            params: {
              type: 'billing',
              q: applied.q || undefined,
              date_from: applied.date_from || undefined,
              date_to: applied.date_to || undefined,
              status: applied.entry_type || undefined,
            },
          });
          if (cancelled) return;
          setRows(data.rows || []);
          setSummary({
            invoices: data.summary?.invoices || 0,
            total: data.summary?.total || 0,
            tax: data.summary?.tax || 0,
            paid: data.summary?.paid || 0,
          });
        } else {
          const { data } = await financeServices.http.get('/panel/finance', {
            params: {
              type,
              q: applied.q || undefined,
              date_from: applied.date_from || undefined,
              date_to: applied.date_to || undefined,
              entry_type: applied.entry_type || undefined,
              category: applied.category || undefined,
            },
          });
          if (cancelled) return;
          setRows(data.items || []);
          setSummary(data.summary || {});
        }
      } catch (e: any) {
        if (!cancelled) {
          setRows([]);
          toast.error(e.response?.data?.message || 'Failed to load finance data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [type, applied, valid]);

  if (!valid) return <Navigate to="/panel/finance/accounts" replace />;

  const activeFilterCount = Object.entries(applied).filter(([key, value]) => key !== 'q' && Boolean(value)).length;

  const kpis = type === 'billing'
    ? [
        { key: 'invoices', label: 'Invoices', value: String(summary.invoices || 0) },
        { key: 'total', label: 'Total', value: money(summary.total) },
        { key: 'tax', label: 'Tax', value: money(summary.tax) },
        { key: 'paid', label: 'Paid', value: String(summary.paid || 0) },
      ]
    : [
        { key: 'entries', label: 'Entries', value: String(summary.entries || rows.length) },
        { key: 'income', label: 'Income', value: money(summary.income) },
        { key: 'expense', label: 'Expense', value: money(summary.expense) },
        { key: 'balance', label: 'Balance', value: money(summary.balance) },
      ];

  const runSearch = () => setApplied((prev) => ({ ...prev, q: search.trim() }));

  const applyFilters = () => {
    setApplied({ ...draft, q: search.trim() });
    setFiltersOpen(false);
    toast.success('Filters applied');
  };

  const clearFilters = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setSearch('');
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
    const sheetRows = rows.map((row) => {
      const out: Record<string, string> = {};
      columns.forEach((c) => {
        out[c.label] = formatCell(c.key, row[c.key]);
      });
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance');
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
    setDlOpen(false);
    toast.success('Excel downloaded');
  };

  const downloadPdf = () => {
    if (!rows.length) return toast.error('No rows to export');
    const head = columns.map((c) => `<th>${c.label}</th>`).join('');
    const body = rows
      .map((row) => `<tr>${columns.map((c) => `<td>${formatCell(c.key, row[c.key])}</td>`).join('')}</tr>`)
      .join('');
    const html = `<!doctype html><html><head><title>${heading}</title>
      <style>body{font-family:Segoe UI,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border-bottom:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#f8fafc}</style>
      </head><body><h1>${heading}</h1><p>${rows.length} rows · ${new Date().toLocaleString()}</p>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) return toast.error('Allow popups for PDF');
    w.document.write(html);
    w.document.close();
    setDlOpen(false);
  };

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
              placeholder="Search finance…"
            />
          </label>

          <div className="rpt-toolbar-end">
            <button
              type="button"
              className={`rpt-mini-btn ${activeFilterCount ? 'is-on' : ''}`}
              onClick={() => {
                setDraft({ ...applied });
                setFiltersOpen(true);
              }}
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
            <div className="rpt-loading"><Loader /><p>Loading…</p></div>
          ) : (
            <>
              <div className="rpt-kpis">
                {kpis.map((k) => (
                  <div key={k.key} className="rpt-kpi">
                    <span>{k.label}</span>
                    <strong>{k.value}</strong>
                  </div>
                ))}
              </div>

              <div className="rpt-table-wrap">
                {!rows.length ? (
                  <div className="rpt-empty">No records found.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="rpt-table">
                      <thead>
                        <tr>
                          {columns.map((c) => (
                            <th key={c.key}>{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={row.id || row.invoice_no || idx}>
                            {columns.map((c) => (
                              <td key={c.key}>{formatCell(c.key, row[c.key])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
            <aside className={`rpt-offcanvas ${filtersVisible ? 'is-open' : ''}`}>
              <button type="button" className="rpt-oc-close" onClick={() => setFiltersOpen(false)}><X size={18} /></button>
              <div className="rpt-oc-head">
                <h2>Filters</h2>
                <p>Set date and conditions, then apply</p>
              </div>
              <div className="rpt-oc-body">
                <div className="rpt-oc-dates">
                  <label>From date
                    <input className="rpt-input" type="date" value={draft.date_from} onChange={(e) => setDraft((f) => ({ ...f, date_from: e.target.value }))} />
                  </label>
                  <label>To date
                    <input className="rpt-input" type="date" value={draft.date_to} onChange={(e) => setDraft((f) => ({ ...f, date_to: e.target.value }))} />
                  </label>
                </div>
                {type !== 'billing' && (
                  <>
                    <label>Entry type
                      <select className="rpt-input" value={draft.entry_type} onChange={(e) => setDraft((f) => ({ ...f, entry_type: e.target.value }))}>
                        <option value="">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </label>
                    <label>Category
                      <input className="rpt-input" value={draft.category} onChange={(e) => setDraft((f) => ({ ...f, category: e.target.value }))} placeholder="Category" />
                    </label>
                  </>
                )}
                {type === 'billing' && (
                  <label>Status
                    <select className="rpt-input" value={draft.entry_type} onChange={(e) => setDraft((f) => ({ ...f, entry_type: e.target.value }))}>
                      <option value="">All</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
