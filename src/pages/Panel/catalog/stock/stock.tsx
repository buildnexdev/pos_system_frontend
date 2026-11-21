import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Package,
  Search,
  LayoutGrid,
  Table2,
  X,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ArrowLeftRight,
  History,
  AlertTriangle,
  Warehouse,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { stockServices } from '../../../../redux/stock/stock.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './stock.scss';

type MoveType = 'in' | 'out' | 'adjust' | 'transfer' | 'purchase' | 'return' | 'damaged';

const STATUS_LABEL: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  reserved: 'Reserved',
  damaged: 'Damaged',
};

export default function StockInventoryPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canEdit = hasRight(rights, user, 'product', 'edit');

  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    current: 0,
    low: 0,
    out: 0,
    damaged: 0,
    available_units: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const emptyFilters = {
    category_id: '',
    brand: '',
    size: '',
    color: '',
    warehouse_id: '',
    status: '',
  };
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [reportType, setReportType] = useState('');
  const [reportRows, setReportRows] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [lookups, setLookups] = useState<{ brands: string[]; sizes: string[]; colors: string[] }>({
    brands: [],
    sizes: [],
    colors: [],
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [mode, setMode] = useState<'in' | 'out' | 'adjust' | 'transfer' | 'history'>('in');
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    qty: '',
    set_qty: '',
    adjustment_type: 'increase',
    supplier_id: '',
    reference_no: '',
    purchase_price: '',
    movement_date: new Date().toISOString().slice(0, 10),
    warehouse_id: '',
    to_warehouse_id: '',
    reason: '',
    note: '',
  });

  const load = async (overrides?: {
    q?: string;
    filters?: typeof emptyFilters;
  }) => {
    const nextQ = overrides?.q ?? q;
    const nextFilters = overrides?.filters ?? appliedFilters;
    setLoading(true);
    try {
      const [stock, cats, wh, sup] = await Promise.all([
        stockServices.http.get('/panel/stock/items', {
          params: {
            q: nextQ || undefined,
            category_id: nextFilters.category_id || undefined,
            brand: nextFilters.brand || undefined,
            size: nextFilters.size || undefined,
            color: nextFilters.color || undefined,
            warehouse_id: nextFilters.warehouse_id || undefined,
            status: nextFilters.status || undefined,
          },
        }),
        stockServices.http.get('/panel/categories'),
        stockServices.http.get('/panel/warehouses'),
        stockServices.http.get('/panel/suppliers').catch(() => ({ data: { items: [] } })),
      ]);
      const nextItems = stock.data.items || [];
      setItems(nextItems);
      if (stock.data.summary) {
        setSummary({
          current: Number(stock.data.summary.current || 0),
          low: Number(stock.data.summary.low || 0),
          out: Number(stock.data.summary.out || 0),
          damaged: Number(stock.data.summary.damaged || 0),
          available_units: Number(stock.data.summary.available_units || 0),
        });
      }
      setCategories(cats.data.categories || []);
      setWarehouses((wh.data.warehouses || []).filter((w: any) => Number(w.is_active) !== 0));
      setSuppliers((sup.data.items || []).filter((s: any) => Number(s.is_active) === 1));

      const noFilters =
        !nextQ &&
        !nextFilters.category_id &&
        !nextFilters.brand &&
        !nextFilters.size &&
        !nextFilters.color &&
        !nextFilters.warehouse_id &&
        !nextFilters.status;
      if (noFilters || !lookups.brands.length) {
        const brands = new Set<string>();
        const sizes = new Set<string>();
        const colors = new Set<string>();
        nextItems.forEach((i: any) => {
          if (i.brand) brands.add(String(i.brand));
          if (i.size) sizes.add(String(i.size));
          if (i.color) colors.add(String(i.color));
        });
        setLookups({
          brands: Array.from(brands).sort(),
          sizes: Array.from(sizes).sort(),
          colors: Array.from(colors).sort(),
        });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const anyDrawer = panelOpen || filtersOpen;
    if (anyDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [panelOpen, filtersOpen]);

  useEffect(() => {
    if (panelOpen) requestAnimationFrame(() => setPanelVisible(true));
    else setPanelVisible(false);
  }, [panelOpen]);

  useEffect(() => {
    if (filtersOpen) requestAnimationFrame(() => setFiltersVisible(true));
    else setFiltersVisible(false);
  }, [filtersOpen]);

  const openFilters = () => {
    setDraftFilters({ ...appliedFilters });
    setFiltersOpen(true);
  };

  const closeFilters = () => setFiltersOpen(false);

  const applyFilters = async () => {
    setAppliedFilters({ ...draftFilters });
    closeFilters();
    await load({ filters: draftFilters });
    toast.success('Filters applied');
  };

  const clearFilters = async () => {
    setDraftFilters({ ...emptyFilters });
    setAppliedFilters({ ...emptyFilters });
    closeFilters();
    await load({ filters: emptyFilters });
    toast.success('Filters cleared');
  };

  const runSearch = async () => {
    await load({ q });
  };

  const openMove = async (row: any, nextMode: typeof mode) => {
    setSelected(row);
    setMode(nextMode);
    setForm({
      qty: '',
      set_qty: '',
      adjustment_type: 'increase',
      supplier_id: '',
      reference_no: '',
      purchase_price: '',
      movement_date: new Date().toISOString().slice(0, 10),
      warehouse_id: String(row.warehouse_id || ''),
      to_warehouse_id: '',
      reason: '',
      note: '',
    });
    setPanelOpen(true);
    if (nextMode === 'history') {
      try {
        const { data } = await stockServices.http.get('/panel/stock/history', {
          params: { variant_id: row.variant_id, limit: 50 },
        });
        setHistory(data.history || []);
      } catch {
        setHistory([]);
      }
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelected(null);
    setHistory([]);
  };

  const submitMove = async () => {
    if (!selected) return;
    if (!canEdit) {
      toast.error('No permission to update stock');
      return;
    }
    if ((mode === 'out' || mode === 'adjust') && !form.reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    if (mode === 'transfer' && !form.to_warehouse_id) {
      toast.error('Select destination warehouse');
      return;
    }
    const qtyNum = Number(form.qty) || 0;
    if ((mode === 'in' || mode === 'out' || mode === 'transfer') && qtyNum <= 0) {
      toast.error('Quantity is required');
      return;
    }
    if (mode === 'out' && qtyNum > Number(selected.available_qty || 0)) {
      toast.error('Quantity exceeds available stock');
      return;
    }
    if (mode === 'adjust' && form.set_qty === '' && qtyNum <= 0) {
      toast.error('Adjustment quantity is required');
      return;
    }
    setBusy(true);
    try {
      const type: MoveType =
        mode === 'in'
          ? form.supplier_id
            ? 'purchase'
            : 'in'
          : mode === 'out'
            ? 'out'
            : mode === 'transfer'
              ? 'transfer'
              : 'adjust';

      await stockServices.http.post('/panel/stock/move', {
        product_id: selected.product_id,
        variant_id: selected.variant_id,
        type,
        qty: form.qty === '' ? undefined : Number(form.qty),
        set_qty: mode === 'adjust' && form.set_qty !== '' ? Number(form.set_qty) : undefined,
        adjustment_type: mode === 'adjust' ? form.adjustment_type : undefined,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : selected.warehouse_id,
        to_warehouse_id: form.to_warehouse_id ? Number(form.to_warehouse_id) : undefined,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : undefined,
        reference_no: form.reference_no || undefined,
        purchase_price: form.purchase_price === '' ? undefined : Number(form.purchase_price),
        movement_date: form.movement_date || undefined,
        reason: form.reason || undefined,
        note: form.note || form.reason || undefined,
      });
      toast.success('Stock updated');
      closePanel();
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Stock update failed');
    } finally {
      setBusy(false);
    }
  };

  const loadReport = async (type: string) => {
    setReportType(type);
    try {
      const { data } = await stockServices.http.get(`/panel/stock/reports/${type}`);
      setReportRows(data.rows || []);
      toast.success(`${type} report loaded (${(data.rows || []).length})`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Report failed');
    }
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const renderCard = (row: any) => (
    <article key={`${row.inventory_id}-${row.variant_id}`} className="stk-card">
      <div className="stk-card-media">
        {row.image || row.variant_image ? (
          <img src={row.image || row.variant_image} alt="" />
        ) : (
          <Package size={28} />
        )}
      </div>
      <div className="stk-card-body">
        <div className="stk-card-top">
          <h3>{row.product_name}</h3>
          <span className={`stk-badge status-${row.stock_status}`}>
            {STATUS_LABEL[row.stock_status] || row.stock_status}
          </span>
        </div>
        <p>{row.color} · {row.size} · <span className="mono">{row.stock_code}</span></p>
        <div className="stk-card-meta">
          <span><strong className={row.stock_status !== 'in_stock' ? 'is-low' : ''}>{row.available_qty}</strong> avail</span>
          <span>Min {row.min_stock}</span>
          <span>{row.warehouse_name}</span>
        </div>
        <p className="stk-card-price">
          MRP ₹{Number(row.mrp || 0).toFixed(0)} · Sell ₹{Number(row.sale_price || row.variant_price || row.mrp || 0).toFixed(0)}
        </p>
        <div className="stk-actions">
          {canEdit && (
            <>
              <button type="button" title="Stock In" onClick={() => openMove(row, 'in')}><ArrowDownToLine size={14} /></button>
              <button type="button" title="Stock Out" onClick={() => openMove(row, 'out')}><ArrowUpFromLine size={14} /></button>
              <button type="button" title="Adjust" onClick={() => openMove(row, 'adjust')}><SlidersHorizontal size={14} /></button>
              <button type="button" title="Transfer" onClick={() => openMove(row, 'transfer')}><ArrowLeftRight size={14} /></button>
            </>
          )}
          <button type="button" title="History" onClick={() => openMove(row, 'history')}><History size={14} /></button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="stk-page">
      <div className="stk-panel">
        <div className="stk-toolbar">
          <div className="stk-hero">
            <div className="stk-hero-icon"><Boxes size={22} /></div>
            <div>
              <h1>Stock Management</h1>
              <p>{summary.current} SKUs · {summary.available_units} units available</p>
            </div>
          </div>

          <div className="stk-summary" aria-label="Stock totals">
            <button type="button" className="stk-sum-chip is-current" onClick={() => loadReport('current')}>
              <span className="stk-sum-label">Current</span>
              <strong>{summary.current}</strong>
            </button>
            <button type="button" className="stk-sum-chip is-low" onClick={() => loadReport('low')}>
              <span className="stk-sum-label"><AlertTriangle size={12} /> Low</span>
              <strong>{summary.low}</strong>
            </button>
            <button type="button" className="stk-sum-chip is-out" onClick={() => loadReport('out')}>
              <span className="stk-sum-label">Out</span>
              <strong>{summary.out}</strong>
            </button>
            <button type="button" className="stk-sum-chip is-damaged" onClick={() => loadReport('damaged')}>
              <span className="stk-sum-label">Damaged</span>
              <strong>{summary.damaged}</strong>
            </button>
          </div>

          <label className="stk-search">
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="Search name / SKU / barcode"
            />
          </label>

          <div className="stk-toolbar-end">
            <button type="button" className="stk-mini-btn" onClick={runSearch} title="Search">
              <RefreshCw size={14} /> <span className="stk-btn-label">Search</span>
            </button>
            <button
              type="button"
              className={`stk-mini-btn stk-filter-btn ${activeFilterCount ? 'is-on' : ''}`}
              onClick={openFilters}
              title="Open filters"
            >
              <Filter size={14} />
              <span>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</span>
            </button>
            <div className="stk-view-toggle">
              <button type="button" className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')} aria-label="Table view"><Table2 size={16} /></button>
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>

        <div className="stk-reports" role="tablist" aria-label="Stock reports">
          <button type="button" className={reportType === 'current' ? 'is-on' : ''} onClick={() => loadReport('current')}>
            Current Stock <em>{summary.current}</em>
          </button>
          <button type="button" className={reportType === 'low' ? 'is-on' : ''} onClick={() => loadReport('low')}>
            <AlertTriangle size={13} /> Low Stock <em>{summary.low}</em>
          </button>
          <button type="button" className={reportType === 'out' ? 'is-on' : ''} onClick={() => loadReport('out')}>
            Out of Stock <em>{summary.out}</em>
          </button>
          <button type="button" className={reportType === 'damaged' ? 'is-on' : ''} onClick={() => loadReport('damaged')}>
            Damaged <em>{summary.damaged}</em>
          </button>
          <button type="button" className={reportType === 'movement' ? 'is-on' : ''} onClick={() => loadReport('movement')}>Movements</button>
          <button type="button" className={reportType === 'warehouse' ? 'is-on' : ''} onClick={() => loadReport('warehouse')}><Warehouse size={13} /> Warehouse</button>
        </div>

        {reportType && reportRows.length > 0 && (
          <div className="stk-report-box">
            <strong>{reportType} report</strong>
            <span>{reportRows.length} rows</span>
            <button type="button" className="stk-mini-btn" onClick={() => { setReportType(''); setReportRows([]); }}>Hide</button>
          </div>
        )}

        {loading ? (
          <div className="stk-loading"><Loader /><p>Loading inventory...</p></div>
        ) : items.length === 0 ? (
          <div className="stk-empty">No stock rows. Create products/variants in Product Management first.</div>
        ) : (
          <>
            <div className={`stk-table-wrap ${view === 'table' ? '' : 'is-hidden-desktop'}`}>
              <table className="stk-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th className="stk-col-hide-lg">Type</th>
                    <th className="stk-col-hide-md">Category</th>
                    <th className="stk-col-hide-md">Brand</th>
                    <th>Size</th>
                    <th>Colour</th>
                    <th>SKU</th>
                    <th className="stk-col-hide-lg">Barcode</th>
                    <th className="stk-col-hide-md">MRP</th>
                    <th className="stk-col-hide-md">Selling</th>
                    <th>Available</th>
                    <th className="stk-col-hide-lg">Min</th>
                    <th className="stk-col-hide-md">Warehouse</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={`${row.inventory_id}-${row.variant_id}`}>
                      <td>
                        <div className="stk-name-cell">
                          <span className="stk-thumb">{row.image || row.variant_image ? <img src={row.image || row.variant_image} alt="" /> : <Package size={14} />}</span>
                          <strong>{row.product_name}</strong>
                        </div>
                      </td>
                      <td className="mono">{row.product_code}</td>
                      <td className="stk-col-hide-lg">{row.product_type_name || '—'}</td>
                      <td className="stk-col-hide-md">{row.category_name || '—'}</td>
                      <td className="stk-col-hide-md">{row.brand || '—'}</td>
                      <td>{row.size}</td>
                      <td>{row.color}</td>
                      <td className="mono">{row.stock_code}</td>
                      <td className="mono stk-col-hide-lg">{row.barcode}</td>
                      <td className="stk-col-hide-md">₹{Number(row.mrp || 0).toFixed(0)}</td>
                      <td className="stk-col-hide-md">₹{Number(row.sale_price || row.variant_price || row.mrp || 0).toFixed(0)}</td>
                      <td><strong className={row.stock_status !== 'in_stock' ? 'is-low' : ''}>{row.available_qty}</strong></td>
                      <td className="stk-col-hide-lg">{row.min_stock}</td>
                      <td className="stk-col-hide-md">{row.warehouse_name}</td>
                      <td><span className={`stk-badge status-${row.stock_status}`}>{STATUS_LABEL[row.stock_status] || row.stock_status}</span></td>
                      <td>
                        <div className="stk-actions">
                          {canEdit && (
                            <>
                              <button type="button" title="Stock In" onClick={() => openMove(row, 'in')}><ArrowDownToLine size={14} /></button>
                              <button type="button" title="Stock Out" onClick={() => openMove(row, 'out')}><ArrowUpFromLine size={14} /></button>
                              <button type="button" title="Adjust" onClick={() => openMove(row, 'adjust')}><SlidersHorizontal size={14} /></button>
                              <button type="button" title="Transfer" onClick={() => openMove(row, 'transfer')}><ArrowLeftRight size={14} /></button>
                            </>
                          )}
                          <button type="button" title="History" onClick={() => openMove(row, 'history')}><History size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`stk-grid ${view === 'grid' ? '' : 'is-mobile-only'}`}>
              {items.map((row) => renderCard(row))}
            </div>
          </>
        )}
      </div>

      {filtersOpen && createPortal(
        <div className={`stk-overlay ${filtersVisible ? 'is-open' : ''}`}>
          <div className="stk-backdrop" onClick={closeFilters} />
          <aside className={`stk-offcanvas stk-filter-offcanvas ${filtersVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Stock filters">
            <button type="button" className="stk-close" onClick={closeFilters} aria-label="Close filters"><X size={18} /></button>
            <div className="stk-oc-head">
              <h2>Filters</h2>
              <p>Choose any filters and submit to refresh stock list</p>
            </div>
            <div className="stk-form">
              <div>
                <label>Category</label>
                <select
                  className="stk-input"
                  value={draftFilters.category_id}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, category_id: e.target.value }))}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label>Brand</label>
                <select
                  className="stk-input"
                  value={draftFilters.brand}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, brand: e.target.value }))}
                >
                  <option value="">All brands</option>
                  {lookups.brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label>Size</label>
                <select
                  className="stk-input"
                  value={draftFilters.size}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, size: e.target.value }))}
                >
                  <option value="">All sizes</option>
                  {lookups.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Colour</label>
                <select
                  className="stk-input"
                  value={draftFilters.color}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, color: e.target.value }))}
                >
                  <option value="">All colours</option>
                  {lookups.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Warehouse</label>
                <select
                  className="stk-input"
                  value={draftFilters.warehouse_id}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, warehouse_id: e.target.value }))}
                >
                  <option value="">All warehouses</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label>Stock Status</label>
                <select
                  className="stk-input"
                  value={draftFilters.status}
                  onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="">All statuses</option>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="stk-oc-actions">
                <button type="button" className="stk-btn ghost" onClick={clearFilters}>Clear</button>
                <button type="button" className="stk-btn primary" disabled={loading} onClick={applyFilters}>
                  {loading ? 'Loading...' : 'Submit Filters'}
                </button>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      {panelOpen && selected && createPortal(
        <div className={`stk-overlay ${panelVisible ? 'is-open' : ''}`}>
          <div className="stk-backdrop" onClick={closePanel} />
          <aside className={`stk-offcanvas ${panelVisible ? 'is-open' : ''}`}>
            <button type="button" className="stk-close" onClick={closePanel}><X size={18} /></button>
            <div className="stk-oc-head">
              <h2>
                {mode === 'in' && 'Stock In'}
                {mode === 'out' && 'Stock Out'}
                {mode === 'adjust' && 'Stock Adjustment'}
                {mode === 'transfer' && 'Stock Transfer'}
                {mode === 'history' && 'Stock History'}
              </h2>
              <p>{selected.product_name} · {selected.color} / {selected.size} · {selected.stock_code}</p>
            </div>

            {mode === 'history' ? (
              <div className="stk-history">
                {history.length === 0 ? <p className="stk-empty">No movements yet.</p> : history.map((h) => (
                  <div key={h.id} className="stk-history-row">
                    <div>
                      <strong className="capitalize">{h.movement_type}</strong>
                      <p>
                        {h.qty > 0 ? '+' : ''}{h.qty} ({h.qty_before} → {h.qty_after})
                        {h.reference_no ? ` · ${h.reference_no}` : ''}
                        {h.note ? ` · ${h.note}` : ''}
                      </p>
                    </div>
                    <span>{new Date(h.movement_date || h.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="stk-form">
                <div className="stk-meta-grid">
                  <div><label>Available</label><p>{selected.available_qty}</p></div>
                  <div><label>Warehouse</label><p>{selected.warehouse_name}</p></div>
                  <div><label>MRP</label><p>₹{Number(selected.mrp || 0).toFixed(0)}</p></div>
                  <div><label>SKU</label><p className="mono">{selected.stock_code}</p></div>
                </div>

                {(mode === 'in' || mode === 'out' || mode === 'transfer') && (
                  <div>
                    <label>Quantity</label>
                    <input className="stk-input" type="number" min={1} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
                  </div>
                )}

                {mode === 'adjust' && (
                  <>
                    <div>
                      <label>Adjustment Type</label>
                      <select className="stk-input" value={form.adjustment_type} onChange={(e) => setForm((f) => ({ ...f, adjustment_type: e.target.value }))}>
                        <option value="increase">Increase</option>
                        <option value="decrease">Decrease</option>
                      </select>
                    </div>
                    <div>
                      <label>Adjustment Quantity</label>
                      <input className="stk-input" type="number" min={1} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} />
                    </div>
                    <div>
                      <label>Or set absolute quantity</label>
                      <input className="stk-input" type="number" min={0} value={form.set_qty} onChange={(e) => setForm((f) => ({ ...f, set_qty: e.target.value }))} placeholder={`Current ${selected.available_qty}`} />
                    </div>
                  </>
                )}

                {mode === 'in' && (
                  <>
                    <div>
                      <label>Supplier</label>
                      <select className="stk-input" value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))}>
                        <option value="">Optional</option>
                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Purchase / GRN Reference</label>
                      <input className="stk-input" value={form.reference_no} onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))} />
                    </div>
                    <div>
                      <label>Purchase Price</label>
                      <input className="stk-input" type="number" value={form.purchase_price} onChange={(e) => setForm((f) => ({ ...f, purchase_price: e.target.value }))} />
                    </div>
                  </>
                )}

                {mode === 'out' && (
                  <div>
                    <label>Reference Number</label>
                    <input className="stk-input" value={form.reference_no} onChange={(e) => setForm((f) => ({ ...f, reference_no: e.target.value }))} />
                  </div>
                )}

                {(mode === 'in' || mode === 'out' || mode === 'adjust' || mode === 'transfer') && (
                  <div>
                    <label>Warehouse</label>
                    <select className="stk-input" value={form.warehouse_id} onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))}>
                      {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                )}

                {mode === 'transfer' && (
                  <div>
                    <label>To Warehouse</label>
                    <select className="stk-input" value={form.to_warehouse_id} onChange={(e) => setForm((f) => ({ ...f, to_warehouse_id: e.target.value }))}>
                      <option value="">Select destination</option>
                      {warehouses.filter((w) => String(w.id) !== String(form.warehouse_id)).map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label>Date</label>
                  <input className="stk-input" type="date" value={form.movement_date} onChange={(e) => setForm((f) => ({ ...f, movement_date: e.target.value }))} />
                </div>

                {(mode === 'out' || mode === 'adjust') && (
                  <div>
                    <label>Reason *</label>
                    <input className="stk-input" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Required" />
                  </div>
                )}

                <div>
                  <label>Remarks</label>
                  <textarea className="stk-input" rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
                </div>

                <div className="stk-oc-actions">
                  <button type="button" className="stk-btn ghost" onClick={closePanel}>Cancel</button>
                  <button type="button" className="stk-btn primary" disabled={busy} onClick={submitMove}>
                    {busy ? 'Saving...' : 'Apply Movement'}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>,
        document.body
      )}
    </div>
  );
}
