/**
 * Finance-backed reports — uses Common Report UI/UX Standard
 */
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
  X,
} from 'lucide-react';
import { financeServices } from '../../../../redux/finance/finance.services';
import { FINANCE_MENU_ITEMS, REPORT_MENU_ITEMS } from '../../../../utils/access';
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
} from '../../report/_shared/ui';

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
  accounts: <Wallet size={18} strokeWidth={1.75} />,
  bank: <Building2 size={18} strokeWidth={1.75} />,
  cash: <CircleDollarSign size={18} strokeWidth={1.75} />,
  ledger: <ClipboardList size={18} strokeWidth={1.75} />,
  journal: <Layers size={18} strokeWidth={1.75} />,
  daybook: <ClipboardList size={18} strokeWidth={1.75} />,
  expense: <Package size={18} strokeWidth={1.75} />,
  spent: <ShoppingCart size={18} strokeWidth={1.75} />,
  billing: <CircleDollarSign size={18} strokeWidth={1.75} />,
};

const FINANCE_COLUMNS: ReportColumn[] = [
  { key: 'entry_date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'reference_no', label: 'Reference' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount', money: true, total: true },
];

const BILLING_COLUMNS: ReportColumn[] = [
  { key: 'invoice_no', label: 'Invoice' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'amount', label: 'Amount', money: true, total: true },
  { key: 'tax', label: 'Tax', money: true, total: true },
  { key: 'total', label: 'Total', money: true, total: true },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Date' },
];

function titleFor(type: string) {
  return (
    REPORT_MENU_ITEMS.find((r) => r.type === type || r.financeType === type)?.label ||
    FINANCE_MENU_ITEMS.find((r) => r.type === type)?.label ||
    'Finance'
  );
}

export default function FinanceBooksPage({ forcedType }: { forcedType?: string } = {}) {
  const { type: typeParam } = useParams();
  const type = String(forcedType || typeParam || 'accounts').toLowerCase();
  const valid =
    FINANCE_MENU_ITEMS.some((m) => m.type === type) ||
    REPORT_MENU_ITEMS.some((m) => m.engine === 'finance' && (m.type === type || m.financeType === type));

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
  const [showColFilters, setShowColFilters] = useState(true);
  const [columnsMenuSignal, setColumnsMenuSignal] = useState(0);

  const heading = useMemo(() => titleFor(type), [type]);
  const columns = type === 'billing' ? BILLING_COLUMNS : FINANCE_COLUMNS;
  const icon = ICONS[type] || <Wallet size={18} strokeWidth={1.75} />;
  const fileBase = `finance-${type}-${new Date().toISOString().slice(0, 10)}`;

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

  if (!valid) return <Navigate to="/panel/reports/finance" replace />;

  const activeFilterCount = Object.entries(applied).filter(([key, value]) => key !== 'q' && Boolean(value)).length;

  const kpis = type === 'billing'
    ? [
        { key: 'records', label: 'Total Records', value: String(rows.length) },
        { key: 'invoices', label: 'Invoices', value: String(summary.invoices || 0) },
        { key: 'total', label: 'Total Amount', value: moneyInr(summary.total) },
        { key: 'tax', label: 'Tax', value: moneyInr(summary.tax) },
        { key: 'paid', label: 'Paid', value: String(summary.paid || 0) },
      ]
    : [
        { key: 'records', label: 'Total Records', value: String(summary.entries || rows.length) },
        { key: 'income', label: 'Income', value: moneyInr(summary.income) },
        { key: 'expense', label: 'Expense', value: moneyInr(summary.expense) },
        { key: 'balance', label: 'Balance', value: moneyInr(summary.balance) },
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

  const clearAll = () => {
    setSearch('');
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setFiltersOpen(false);
    toast.success('All filters cleared');
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
        out[c.label] = formatReportCell(c.key, row[c.key]);
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
      .map((row) => `<tr>${columns.map((c) => `<td>${formatReportCell(c.key, row[c.key])}</td>`).join('')}</tr>`)
      .join('');
    const html = `<!doctype html><html><head><title>${heading}</title>
      <style>body{font-family:Segoe UI,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #444;padding:8px;text-align:left}th{background:#e5e5e5}</style>
      </head><body><h1>${heading}</h1><p>${rows.length} rows · ${new Date().toLocaleString('en-IN')}</p>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) return toast.error('Allow popups for PDF');
    w.document.write(html);
    w.document.close();
    setDlOpen(false);
  };

  return (
    <div className="rs-page">
      <div className="rs-panel">
        <ReportHeader
          title={heading}
          icon={icon}
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={runSearch}
          searchPlaceholder="Search finance…"
          filterCount={activeFilterCount}
          onOpenFilters={() => {
            setDraft({ ...applied });
            setFiltersOpen(true);
          }}
          showColFilters={showColFilters}
          onToggleColFilters={() => setShowColFilters((v) => !v)}
          onOpenColumns={() => setColumnsMenuSignal((n) => n + 1)}
          downloadOpen={dlOpen}
          onToggleDownload={() => setDlOpen((v) => !v)}
          downloadRef={dlRef}
          onExcel={downloadExcel}
          onCsv={downloadCsv}
          onPdf={downloadPdf}
          onPrint={downloadPdf}
          onClearAll={clearAll}
          clearDisabled={!search && !activeFilterCount}
        />

        <div className="rs-body">
          {loading ? (
            <div className="rs-loading"><Loader /><p>Loading…</p></div>
          ) : (
            <>
              <ReportKpis items={kpis} />
              <ReportTable
                title={heading}
                columns={columns}
                rows={rows}
                columnsMenuSignal={columnsMenuSignal}
                showColFilters={showColFilters}
                onShowColFiltersChange={setShowColFilters}
                emptyText="No records found."
              />
            </>
          )}
        </div>
      </div>

      {filtersOpen &&
        createPortal(
          <div className={`rs-overlay ${filtersVisible ? 'is-open' : ''}`}>
            <div className="rs-backdrop" onClick={() => setFiltersOpen(false)} />
            <aside className="rs-offcanvas">
              <button type="button" className="rs-oc-close" onClick={() => setFiltersOpen(false)}><X size={16} /></button>
              <div className="rs-oc-head">
                <h2>Filters</h2>
                <p>Set date and conditions, then apply</p>
              </div>
              <div className="rs-oc-body">
                <div className="rs-oc-dates">
                  <label>From date
                    <input className="rs-input" type="date" value={draft.date_from} onChange={(e) => setDraft((f) => ({ ...f, date_from: e.target.value }))} />
                  </label>
                  <label>To date
                    <input className="rs-input" type="date" value={draft.date_to} onChange={(e) => setDraft((f) => ({ ...f, date_to: e.target.value }))} />
                  </label>
                </div>
                {type !== 'billing' && (
                  <>
                    <label>Entry type
                      <select className="rs-input" value={draft.entry_type} onChange={(e) => setDraft((f) => ({ ...f, entry_type: e.target.value }))}>
                        <option value="">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </label>
                    <label>Category
                      <input className="rs-input" value={draft.category} onChange={(e) => setDraft((f) => ({ ...f, category: e.target.value }))} placeholder="Category" />
                    </label>
                  </>
                )}
                {type === 'billing' && (
                  <label>Status
                    <select className="rs-input" value={draft.entry_type} onChange={(e) => setDraft((f) => ({ ...f, entry_type: e.target.value }))}>
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
