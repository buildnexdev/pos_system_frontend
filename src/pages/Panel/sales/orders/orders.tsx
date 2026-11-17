import { Formik, Form, Field, FieldArray } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  RefreshCw,
  Package,
  MapPin,
  CreditCard,
  Save,
  Plus,
  Pencil,
  Archive,
  Ban,
  Truck,
  History,
  Power,
  Filter,
} from 'lucide-react';
import { orderPanelServices } from '../../../../redux/orderPanel/orderPanel.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './orders.scss';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
  'refund_pending',
  'refunded',
] as const;

const SUMMARY_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
] as const;

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refund_pending', 'refunded'] as const;
const PAYMENT_METHODS = ['cod', 'online'] as const;
const ORDER_SOURCES = ['online', 'pos', 'admin'] as const;
const REFUND_STATUSES = ['none', 'pending', 'completed', 'failed'] as const;

type OrderItemForm = {
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: string;
  price: string;
  variantKey: string;
};

function money(value: unknown) {
  return `₹${Number(value || 0).toFixed(0)}`;
}

function formatDate(value: unknown) {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status: string) {
  const key = String(status || '').toLowerCase();
  if (['delivered', 'paid', 'confirmed', 'completed', 'refunded'].includes(key)) return 'is-ok';
  if (['shipped', 'processing', 'packed', 'refund_pending'].includes(key)) return 'is-info';
  if (['cancelled', 'failed', 'returned', 'return_requested'].includes(key)) return 'is-bad';
  return 'is-warn';
}

function labelStatus(s: string) {
  return String(s || '').replace(/_/g, ' ');
}

function emptyItem(): OrderItemForm {
  return {
    product_id: '',
    product_name: '',
    size: '',
    color: '',
    quantity: '1',
    price: '',
    variantKey: '',
  };
}

function calcTotal(values: {
  items?: OrderItemForm[];
  discount?: string | number;
  coupon_discount?: string | number;
  tax_amount?: string | number;
  shipping_fee?: string | number;
  subtotal?: number;
}) {
  const subtotal =
    values.subtotal != null
      ? Number(values.subtotal) || 0
      : (values.items || []).reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
          0
        );
  const discount = Number(values.discount) || 0;
  const coupon = Number(values.coupon_discount) || 0;
  const tax = Number(values.tax_amount) || 0;
  const ship = Number(values.shipping_fee) || 0;
  return Math.max(0, subtotal - discount - coupon + tax + ship);
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'order', 'create');
  const canEdit = hasRight(rights, user, 'order', 'edit');
  // Shop Admin / panel users with order access should see Add & Update controls
  const canAdd = canCreate || canEdit || user?.role === 'admin';
  const canUpdate = canEdit || user?.role === 'admin';

  const emptyFilters = {
    status: '',
    payment_status: '',
    payment_method: '',
    order_source: '',
    is_active: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
    archived: false,
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  const productOptions = useMemo(() => {
    const rows: Array<{
      key: string;
      product_id: number;
      product_name: string;
      size: string;
      color: string;
      price: number;
      label: string;
    }> = [];
    products.forEach((p) => {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      if (variants.length) {
        variants.forEach((v: any) => {
          const size = v.size || '';
          const color = v.color || '';
          const price = Number(v.price ?? p.sale_price ?? p.price) || 0;
          rows.push({
            key: `${p.id}-${color}-${size}-${v.id || 'x'}`,
            product_id: p.id,
            product_name: p.name,
            size,
            color,
            price,
            label: `${p.name} · ${color || '—'} / ${size || '—'} · ₹${price}`,
          });
        });
      } else {
        const price = Number(p.sale_price ?? p.price) || 0;
        rows.push({
          key: `${p.id}-base`,
          product_id: p.id,
          product_name: p.name,
          size: '',
          color: '',
          price,
          label: `${p.name} · ₹${price}`,
        });
      }
    });
    return rows;
  }, [products]);

  const load = async (overrides?: { filters?: typeof emptyFilters }) => {
    const nextFilters = overrides?.filters ?? appliedFilters;
    setLoading(true);
    try {
      const [ord, prod, cust] = await Promise.all([
        orderPanelServices.http.get('/panel/orders', {
          params: {
            is_archived: nextFilters.archived ? '1' : '0',
            order_source: nextFilters.order_source || undefined,
            date_from: nextFilters.date_from || undefined,
            date_to: nextFilters.date_to || undefined,
            amount_min: nextFilters.amount_min || undefined,
            amount_max: nextFilters.amount_max || undefined,
          },
        }),
        orderPanelServices.http.get('/panel/products').catch(() => ({ data: { products: [] } })),
        orderPanelServices.http.get('/panel/customers').catch(() => ({ data: { customers: [] } })),
      ]);
      setOrders(ord.data.orders || []);
      setProducts(prod.data.products || []);
      setCustomers(cust.data.customers || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, appliedFilters, pageSize]);

  useEffect(() => {
    if (detailOpen) {
      requestAnimationFrame(() => setDetailVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setDetailVisible(false);
      if (!formOpen && !filtersOpen) document.body.style.overflow = '';
    }
    return () => {
      if (!formOpen && !filtersOpen) document.body.style.overflow = '';
    };
  }, [detailOpen, formOpen, filtersOpen]);

  useEffect(() => {
    if (formOpen) {
      requestAnimationFrame(() => setFormVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFormVisible(false);
      if (!detailOpen && !filtersOpen) document.body.style.overflow = '';
    }
    return () => {
      if (!detailOpen && !filtersOpen) document.body.style.overflow = '';
    };
  }, [formOpen, detailOpen, filtersOpen]);

  useEffect(() => {
    if (filtersOpen) {
      requestAnimationFrame(() => setFiltersVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFiltersVisible(false);
      if (!detailOpen && !formOpen) document.body.style.overflow = '';
    }
    return () => {
      if (!detailOpen && !formOpen) document.body.style.overflow = '';
    };
  }, [filtersOpen, detailOpen, formOpen]);

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
    setPage(1);
    await load();
  };

  const setStatusChip = async (status: string) => {
    const next = {
      ...appliedFilters,
      status: appliedFilters.status === status ? '' : status,
    };
    setAppliedFilters(next);
    setDraftFilters(next);
    await load({ filters: next });
  };

  const activeFilterCount = Object.entries(appliedFilters).filter(([key, value]) => {
    if (key === 'archived') return Boolean(value);
    return Boolean(value);
  }).length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (appliedFilters.status && String(o.status) !== appliedFilters.status) return false;
      if (appliedFilters.payment_status && String(o.payment_status) !== appliedFilters.payment_status) return false;
      if (appliedFilters.payment_method && String(o.payment_method) !== appliedFilters.payment_method) return false;
      if (appliedFilters.is_active === '1' && !Number(o.is_active)) return false;
      if (appliedFilters.is_active === '0' && Number(o.is_active)) return false;
      if (!term) return true;
      const hay = `${o.order_number} ${o.customer_name} ${o.customer_email} ${o.shipping_name} ${o.shipping_phone}`.toLowerCase();
      return hay.includes(term);
    });
  }, [orders, q, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    SUMMARY_STATUSES.forEach((s) => {
      counts[s] = 0;
    });
    orders.forEach((o) => {
      const key = String(o.status || 'pending');
      counts[key] = (counts[key] || 0) + 1;
    });
    const revenue = orders
      .filter((o) => !['cancelled', 'refunded'].includes(String(o.status)))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    return { counts, revenue, total: orders.length };
  }, [orders]);

  const openOrder = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await orderPanelServices.http.get(`/panel/orders/${id}`);
      setSelected(data.order);
      setItems(data.items || []);
      setHistory(data.history || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load order');
      setDetailOpen(false);
      setSelected(null);
      setItems([]);
      setHistory([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelected(null);
    setItems([]);
    setHistory([]);
  };

  const openCreate = () => {
    navigate('/panel/orders/new');
  };

  /** Full-page update */
  const openEditPage = (order: any) => {
    navigate(`/panel/orders/${order.id}/edit`);
  };

  /** Keep update in the side drawer as well */
  const openEditDrawer = async (order: any) => {
    try {
      const { data } = await orderPanelServices.http.get(`/panel/orders/${order.id}`);
      setEditing({ order: data.order, items: data.items || [], history: data.history || [] });
      setFormOpen(true);
      setDetailOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load order');
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const toggleActive = async (order: any) => {
    if (!canUpdate) return;
    const next = Number(order.is_active) ? 0 : 1;
    try {
      await orderPanelServices.http.put(`/panel/orders/${order.id}`, { is_active: next });
      toast.success(next ? 'Order set Active' : 'Order set Inactive');
      await load();
      if (selected?.id === order.id) {
        setSelected((prev: any) => (prev ? { ...prev, is_active: next } : prev));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not update active status');
    }
  };

  const onCancel = async (order: any) => {
    if (!canUpdate) return;
    const reason = prompt(`Cancel order ${order.order_number}. Reason required:`, order.cancellation_reason || '');
    if (reason == null) return;
    if (!String(reason).trim()) {
      toast.error('Cancellation reason is required');
      return;
    }
    try {
      await orderPanelServices.http.post(`/panel/orders/${order.id}/cancel`, { cancellation_reason: reason.trim() });
      toast.success('Order cancelled');
      if (selected?.id === order.id) closeDetail();
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Cancel failed');
    }
  };

  const onArchive = async (order: any, archived = true) => {
    if (!canUpdate) return;
    try {
      await orderPanelServices.http.post(`/panel/orders/${order.id}/archive`, { is_archived: archived ? 1 : 0 });
      toast.success(archived ? 'Order archived' : 'Order restored');
      if (selected?.id === order.id) closeDetail();
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Archive failed');
    }
  };

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error('No orders to export');
      return;
    }
    const headers = [
      'S.No', 'Order Number', 'Source', 'Date', 'Customer', 'Email', 'Phone', 'Payment Method', 'Payment Status',
      'Order Status', 'Fulfillment', 'Subtotal', 'Discount', 'Coupon', 'Tax', 'Shipping', 'Total', 'City', 'State', 'Pincode',
    ];
    const lines = [headers.join(',')];
    filtered.forEach((o, index) => {
      const cols = [
        index + 1,
        o.order_number || '',
        o.order_source || '',
        `"${formatDate(o.created_at)}"`,
        `"${String(o.customer_name || o.shipping_name || '').replace(/"/g, '""')}"`,
        o.customer_email || '',
        o.shipping_phone || '',
        o.payment_method || '',
        o.payment_status || '',
        o.status || '',
        o.fulfillment_status || '',
        Number(o.subtotal || 0).toFixed(2),
        Number(o.discount || 0).toFixed(2),
        Number(o.coupon_discount || 0).toFixed(2),
        Number(o.tax_amount || 0).toFixed(2),
        Number(o.shipping_fee || 0).toFixed(2),
        Number(o.total || 0).toFixed(2),
        `"${String(o.shipping_city || '').replace(/"/g, '""')}"`,
        `"${String(o.shipping_state || '').replace(/"/g, '""')}"`,
        o.shipping_pincode || '',
      ];
      lines.push(cols.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported');
  };

  const downloadOrderSlip = (order: any, orderItems: any[]) => {
    if (!order) return;
    const rows = orderItems
      .map(
        (item) => `
      <tr>
        <td>${item.product_name || '—'}</td>
        <td>${item.color || '—'} / ${item.size || '—'}</td>
        <td>${item.quantity}</td>
        <td>₹${Number(item.price || 0).toFixed(2)}</td>
        <td>₹${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
      </tr>`
      )
      .join('');
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Order ${order.order_number}</title>
<style>
  body{font-family:Arial,sans-serif;color:#0f172a;padding:24px}
  h1{margin:0 0 4px;font-size:22px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}
  th{background:#f8fafc}
</style></head><body>
  <h1>Order ${order.order_number}</h1>
  <p>${order.customer_name || order.shipping_name || '—'} · ${formatDate(order.created_at)} · ${order.order_source || ''}</p>
  <p><strong>Ship to:</strong> ${order.shipping_name}, ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
  <p><strong>Status:</strong> ${order.status} · <strong>Payment:</strong> ${order.payment_method} / ${order.payment_status} · <strong>Fulfillment:</strong> ${order.fulfillment_status || '—'}</p>
  <table>
    <thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5">No items</td></tr>'}</tbody>
  </table>
  <p style="text-align:right">
    Subtotal ₹${Number(order.subtotal || 0).toFixed(2)} · Discount ₹${Number(order.discount || 0).toFixed(2)} ·
    Tax ₹${Number(order.tax_amount || 0).toFixed(2)} · Shipping ₹${Number(order.shipping_fee || 0).toFixed(2)}<br/>
    <strong>Total ₹${Number(order.total || 0).toFixed(2)}</strong>
  </p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.order_number || order.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Order slip downloaded');
  };

  const printOrderSlip = (order: any, orderItems: any[]) => {
    if (!order) return;
    const rows = orderItems
      .map(
        (item) =>
          `<tr><td>${item.product_name || '—'}</td><td>${item.color || '—'} / ${item.size || '—'}</td><td>${item.quantity}</td><td>₹${Number(item.price || 0).toFixed(2)}</td></tr>`
      )
      .join('');
    const html = `<!doctype html><html><head><title>${order.order_number}</title>
<style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}</style>
</head><body>
<h2>Order ${order.order_number}</h2>
<p>${order.customer_name || order.shipping_name} · ${formatDate(order.created_at)}</p>
<table><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
<p style="text-align:right"><strong>Total ₹${Number(order.total || 0).toFixed(2)}</strong></p>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      toast.error('Allow popups to print order');
      return;
    }
    win.document.write(html);
    win.document.close();
  };

  const formInitial = useMemo(() => {
    const order = editing?.order;
    const orderItems: OrderItemForm[] = (editing?.items || []).map((item: any) => ({
      product_id: String(item.product_id || ''),
      product_name: item.product_name || '',
      size: item.size || '',
      color: item.color || '',
      quantity: String(item.quantity || 1),
      price: String(item.price || ''),
      variantKey: `${item.product_id}-${item.color || ''}-${item.size || ''}`,
    }));
    return {
      user_id: order?.user_id ? String(order.user_id) : '',
      order_source: order?.order_source || 'admin',
      shipping_name: order?.shipping_name || '',
      shipping_phone: order?.shipping_phone || '',
      shipping_address: order?.shipping_address || '',
      shipping_city: order?.shipping_city || '',
      shipping_state: order?.shipping_state || '',
      shipping_pincode: order?.shipping_pincode || '',
      notes: order?.notes || '',
      shipping_fee: String(order?.shipping_fee ?? '0'),
      discount: String(order?.discount ?? '0'),
      coupon_discount: String(order?.coupon_discount ?? '0'),
      tax_amount: String(order?.tax_amount ?? '0'),
      status: order?.status || 'pending',
      payment_method: order?.payment_method || 'cod',
      payment_status: order?.payment_status || 'pending',
      courier: order?.courier || '',
      tracking_number: order?.tracking_number || '',
      tracking_url: order?.tracking_url || '',
      expected_delivery_date: order?.expected_delivery_date
        ? String(order.expected_delivery_date).slice(0, 10)
        : '',
      shipped_at: order?.shipped_at ? String(order.shipped_at).slice(0, 16) : '',
      delivered_at: order?.delivered_at ? String(order.delivered_at).slice(0, 16) : '',
      cancellation_reason: order?.cancellation_reason || '',
      return_reason: order?.return_reason || '',
      refund_amount: order?.refund_amount != null ? String(order.refund_amount) : '',
      refund_method: order?.refund_method || '',
      refund_status: order?.refund_status || 'none',
      is_active: order ? !!Number(order.is_active) : true,
      inspection_done: false,
      items: orderItems.length ? orderItems : [emptyItem()],
    };
  }, [editing]);

  return (
    <div className="ord-page">
      <div className="ord-panel">
        <div className="ord-toolbar">
          <div className="ord-hero">
            <span className="ord-hero-icon"><ShoppingCart size={22} /></span>
            <div>
              <h1>Order Management {summary.total} orders</h1>
              <p>
                Revenue {money(summary.revenue)} · Pending {summary.counts.pending || 0}
              </p>
            </div>
          </div>

          <label className="ord-search">
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
              placeholder="Search order, customer, phone"
            />
          </label>

          <div className="ord-toolbar-end">
            <button type="button" className="ord-mini-btn" onClick={runSearch} title="Refresh">
              <RefreshCw size={14} /> <span className="ord-btn-label">Refresh</span>
            </button>
            <button
              type="button"
              className={`ord-mini-btn ord-filter-btn ${activeFilterCount ? 'is-on' : ''}`}
              onClick={openFilters}
              title="Open filters"
            >
              <Filter size={14} />
              <span>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</span>
            </button>
            <button type="button" className="ord-mini-btn" onClick={exportCsv} title="Export CSV">
              <Download size={14} /> <span className="ord-btn-label">Export</span>
            </button>
            {canAdd && (
              <button type="button" className="ord-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Order
              </button>
            )}
          </div>
        </div>

        <div className="ord-stats ord-stats-wide" role="tablist" aria-label="Order status">
          {SUMMARY_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`ord-stat ${appliedFilters.status === s ? 'is-active' : ''}`}
              onClick={() => setStatusChip(s)}
            >
              <em className="capitalize">{labelStatus(s)}</em>
              <strong>{summary.counts[s] || 0}</strong>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ord-loading"><Loader /><p>Loading orders...</p></div>
        ) : (
          <div className="ord-table-wrap">
            <table className="ord-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="ord-empty">
                      No orders found. Use Add Order or place one from the shop.
                    </td>
                  </tr>
                ) : (
                  paged.map((o, index) => (
                    <tr key={o.id} className={!Number(o.is_active) ? 'is-inactive' : ''}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td><strong className="ord-code">{o.order_number}</strong></td>
                      <td className="capitalize">{o.order_source || '—'}</td>
                      <td>{formatDate(o.created_at)}</td>
                      <td>
                        <div className="ord-customer">
                          <strong>{o.customer_name || o.shipping_name || '—'}</strong>
                          <span>{o.shipping_phone || o.customer_email || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ord-pay">
                          <span className="capitalize">{o.payment_method || '—'}</span>
                          <em className={`ord-badge ${statusClass(o.payment_status)}`}>{labelStatus(o.payment_status)}</em>
                        </div>
                      </td>
                      <td><strong>{money(o.total)}</strong></td>
                      <td>
                        <span className={`ord-badge ${statusClass(o.status)} capitalize`}>{labelStatus(o.status)}</span>
                      </td>
                      <td>
                        <span className={`ord-badge ${statusClass(o.fulfillment_status || '')} capitalize`}>
                          {labelStatus(o.fulfillment_status || 'unfulfilled')}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`ord-active-toggle ${Number(o.is_active) ? 'is-on' : 'is-off'}`}
                          disabled={!canUpdate}
                          title={Number(o.is_active) ? 'Set Inactive' : 'Set Active'}
                          onClick={() => toggleActive(o)}
                        >
                          <Power size={13} />
                          {Number(o.is_active) ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className="ord-actions">
                          <button type="button" className="icon-action" title="View" onClick={() => openOrder(o.id)}>
                            <Eye size={15} />
                          </button>
                          {canUpdate && (
                            <button type="button" className="icon-action edit" title="Update page" onClick={() => openEditPage(o)}>
                              <Pencil size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="icon-action download"
                            title="Download order slip"
                            onClick={async () => {
                              try {
                                const { data } = await orderPanelServices.http.get(`/panel/orders/${o.id}`);
                                downloadOrderSlip(data.order || o, data.items || []);
                              } catch (e: any) {
                                toast.error(e.response?.data?.message || 'Download failed');
                              }
                            }}
                          >
                            <Download size={15} />
                          </button>
                          {canUpdate && o.status !== 'cancelled' && o.status !== 'refunded' && (
                            <button type="button" className="icon-action danger" title="Cancel" onClick={() => onCancel(o)}>
                              <Ban size={15} />
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              type="button"
                              className="icon-action"
                              title={Number(o.is_archived) ? 'Restore' : 'Archive'}
                              onClick={() => onArchive(o, !Number(o.is_archived))}
                            >
                              <Archive size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="ord-pagination">
              <select className="ord-filter" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <span>{filtered.length} orders · Page {currentPage} / {totalPages}</span>
              <div className="ord-actions">
                <button type="button" className="icon-action" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={15} />
                </button>
                <button type="button" className="icon-action" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filtersOpen &&
        createPortal(
          <div className={`ord-overlay ${filtersVisible ? 'is-open' : ''}`}>
            <div className="ord-backdrop" onClick={closeFilters} />
            <aside
              className={`ord-offcanvas ord-filter-offcanvas ${filtersVisible ? 'is-open' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label="Order filters"
            >
              <button type="button" className="ord-oc-close" onClick={closeFilters} aria-label="Close filters">
                <X size={18} />
              </button>
              <div className="ord-oc-head">
                <span className="ord-oc-icon"><Filter size={20} /></span>
                <div>
                  <h2>Filters</h2>
                  <p>Choose filters and apply to refresh the order list</p>
                </div>
              </div>
              <div className="ord-update-form ord-filter-form">
                <div>
                  <label>Order Status</label>
                  <select
                    className="ord-input"
                    value={draftFilters.status}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">All Status</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{labelStatus(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Payment Status</label>
                  <select
                    className="ord-input"
                    value={draftFilters.payment_status}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, payment_status: e.target.value }))}
                  >
                    <option value="">All Payment Status</option>
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{labelStatus(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Payment Method</label>
                  <select
                    className="ord-input"
                    value={draftFilters.payment_method}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, payment_method: e.target.value }))}
                  >
                    <option value="">All Methods</option>
                    {PAYMENT_METHODS.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Order Source</label>
                  <select
                    className="ord-input"
                    value={draftFilters.order_source}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, order_source: e.target.value }))}
                  >
                    <option value="">All Sources</option>
                    {ORDER_SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Active</label>
                  <select
                    className="ord-input"
                    value={draftFilters.is_active}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, is_active: e.target.value }))}
                  >
                    <option value="">All Active</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div className="ord-form-grid">
                  <div>
                    <label>From Date</label>
                    <input
                      className="ord-input"
                      type="date"
                      value={draftFilters.date_from}
                      onChange={(e) => setDraftFilters((f) => ({ ...f, date_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>To Date</label>
                    <input
                      className="ord-input"
                      type="date"
                      value={draftFilters.date_to}
                      onChange={(e) => setDraftFilters((f) => ({ ...f, date_to: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="ord-form-grid">
                  <div>
                    <label>Min Amount (₹)</label>
                    <input
                      className="ord-input"
                      type="number"
                      placeholder="Min ₹"
                      value={draftFilters.amount_min}
                      onChange={(e) => setDraftFilters((f) => ({ ...f, amount_min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>Max Amount (₹)</label>
                    <input
                      className="ord-input"
                      type="number"
                      placeholder="Max ₹"
                      value={draftFilters.amount_max}
                      onChange={(e) => setDraftFilters((f) => ({ ...f, amount_max: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="ord-check-inline">
                  <input
                    type="checkbox"
                    checked={draftFilters.archived}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, archived: e.target.checked }))}
                  />
                  Show archived orders
                </label>
                <div className="ord-oc-actions">
                  <button type="button" className="ord-mini-btn" onClick={clearFilters}>Clear</button>
                  <button type="button" className="ord-btn-primary" disabled={loading} onClick={applyFilters}>
                    {loading ? 'Applying…' : 'Apply Filters'}
                  </button>
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )}

      {detailOpen &&
        createPortal(
          <div className={`ord-overlay ${detailVisible ? 'is-open' : ''}`}>
            <div className="ord-backdrop" onClick={closeDetail} />
            <aside className={`ord-offcanvas wide ${detailVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <button type="button" className="ord-oc-close" onClick={closeDetail} aria-label="Close">
                <X size={18} />
              </button>
              <div className="ord-oc-head">
                <span className="ord-oc-icon"><Package size={20} /></span>
                <div>
                  <h2>{selected?.order_number || 'Order detail'}</h2>
                  <p>{selected ? `${formatDate(selected.created_at)} · ${selected.order_source || ''}` : 'Loading…'}</p>
                </div>
              </div>

              {detailLoading || !selected ? (
                <div className="ord-loading"><Loader /><p>Loading order…</p></div>
              ) : (
                <div className="ord-oc-body">
                  <section className="ord-card">
                    <div className="ord-card-head"><CreditCard size={16} /><h3>Order summary</h3></div>
                    <div className="ord-grid">
                      <div><label>Customer</label><p>{selected.customer_name || selected.shipping_name || '—'}</p></div>
                      <div><label>Email</label><p>{selected.customer_email || '—'}</p></div>
                      <div><label>Phone</label><p>{selected.shipping_phone || '—'}</p></div>
                      <div><label>Source</label><p className="capitalize">{selected.order_source || '—'}</p></div>
                      <div><label>Order status</label><p><span className={`ord-badge ${statusClass(selected.status)} capitalize`}>{labelStatus(selected.status)}</span></p></div>
                      <div><label>Fulfillment</label><p><span className={`ord-badge ${statusClass(selected.fulfillment_status || '')} capitalize`}>{labelStatus(selected.fulfillment_status || 'unfulfilled')}</span></p></div>
                      <div><label>Payment</label><p className="capitalize">{selected.payment_method} · {labelStatus(selected.payment_status)}</p></div>
                      <div>
                        <label>Active</label>
                        <p>
                          <span className={`ord-badge ${Number(selected.is_active) ? 'is-ok' : 'is-bad'}`}>
                            {Number(selected.is_active) ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div><label>Subtotal</label><p>{money(selected.subtotal)}</p></div>
                      <div><label>Discount</label><p>{money(selected.discount)}</p></div>
                      <div><label>Coupon</label><p>{money(selected.coupon_discount)}</p></div>
                      <div><label>GST / Tax</label><p>{money(selected.tax_amount)}</p></div>
                      <div><label>Shipping</label><p>{money(selected.shipping_fee)}</p></div>
                      <div><label>Grand Total</label><p><strong>{money(selected.total)}</strong></p></div>
                    </div>
                  </section>

                  <section className="ord-card">
                    <div className="ord-card-head"><MapPin size={16} /><h3>Shipping & delivery</h3></div>
                    <p className="ord-address">
                      {selected.shipping_name}<br />
                      {selected.shipping_address}<br />
                      {selected.shipping_city}, {selected.shipping_state} - {selected.shipping_pincode}<br />
                      Phone: {selected.shipping_phone}
                    </p>
                    <div className="ord-grid" style={{ marginTop: '0.75rem' }}>
                      <div><label>Courier</label><p>{selected.courier || '—'}</p></div>
                      <div><label>Tracking</label><p>{selected.tracking_number || '—'}</p></div>
                      <div><label>Expected</label><p>{selected.expected_delivery_date || '—'}</p></div>
                      <div><label>Shipped</label><p>{formatDate(selected.shipped_at)}</p></div>
                      <div><label>Delivered</label><p>{formatDate(selected.delivered_at)}</p></div>
                    </div>
                    {!!selected.notes && <p className="ord-notes">Notes: {selected.notes}</p>}
                  </section>

                  <section className="ord-card">
                    <div className="ord-card-head"><Package size={16} /><h3>Items ({items.length})</h3></div>
                    <div className="ord-items">
                      {items.map((item) => (
                        <div key={item.id} className="ord-item-row">
                          <div>
                            <strong>{item.product_name}</strong>
                            <span>{item.color || '—'} · {item.size || '—'} · Qty {item.quantity}</span>
                          </div>
                          <strong>{money(Number(item.price) * Number(item.quantity))}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="ord-card">
                    <div className="ord-card-head"><History size={16} /><h3>Status history</h3></div>
                    <div className="ord-history">
                      {history.length === 0 ? (
                        <p className="ord-empty-inline">No history yet.</p>
                      ) : (
                        history.map((h) => (
                          <div key={h.id} className="ord-history-row">
                            <strong className="capitalize">{labelStatus(h.to_status)}</strong>
                            <span>{formatDate(h.created_at)} · {h.created_by_name || 'System'}</span>
                            {h.note ? <em>{h.note}</em> : null}
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <div className="ord-detail-actions">
                    <button type="button" className="ord-mini-btn" onClick={() => downloadOrderSlip(selected, items)}>
                      <Download size={14} /> Download Slip
                    </button>
                    <button type="button" className="ord-mini-btn" onClick={() => printOrderSlip(selected, items)}>
                      <Printer size={14} /> Print
                    </button>
                    {canUpdate && (
                      <button type="button" className="ord-mini-btn" onClick={() => openEditPage(selected)}>
                        <Pencil size={14} /> Update Page
                      </button>
                    )}
                    {canUpdate && (
                      <button type="button" className="ord-mini-btn" onClick={() => openEditDrawer(selected)}>
                        <Pencil size={14} /> Update Here
                      </button>
                    )}
                    {canUpdate && (
                      <button type="button" className="ord-mini-btn" onClick={() => toggleActive(selected)}>
                        <Power size={14} /> {Number(selected.is_active) ? 'Set Inactive' : 'Set Active'}
                      </button>
                    )}
                    {canUpdate && selected.status !== 'cancelled' && selected.status !== 'refunded' && (
                      <button type="button" className="ord-mini-btn danger" onClick={() => onCancel(selected)}>
                        <Ban size={14} /> Cancel
                      </button>
                    )}
                    {canUpdate && (
                      <button type="button" className="ord-mini-btn" onClick={() => onArchive(selected, !Number(selected.is_archived))}>
                        <Archive size={14} /> {Number(selected.is_archived) ? 'Restore' : 'Archive'}
                      </button>
                    )}
                  </div>

                  {canUpdate && (
                    <Formik
                      enableReinitialize
                      initialValues={{
                        status: selected.status || 'pending',
                        payment_status: selected.payment_status || 'pending',
                        is_active: !!Number(selected.is_active),
                        inspection_done: false,
                      }}
                      onSubmit={async (values) => {
                        setSaving(true);
                        try {
                          await orderPanelServices.http.put(`/panel/orders/${selected.id}`, values);
                          toast.success('Order updated');
                          await load();
                          await openOrder(selected.id);
                        } catch (e: any) {
                          toast.error(e.response?.data?.message || 'Could not update order');
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      <Form className="ord-card ord-update-form">
                        <div className="ord-card-head"><Save size={16} /><h3>Quick status update</h3></div>
                        <div className="ord-form-grid">
                          <label>
                            <span>Order status</span>
                            <Field as="select" name="status" className="ord-input">
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{labelStatus(s)}</option>
                              ))}
                            </Field>
                          </label>
                          <label>
                            <span>Payment status</span>
                            <Field as="select" name="payment_status" className="ord-input">
                              {PAYMENT_STATUSES.map((s) => (
                                <option key={s} value={s}>{labelStatus(s)}</option>
                              ))}
                            </Field>
                          </label>
                        </div>
                        <label className="ord-check">
                          <Field type="checkbox" name="is_active" />
                          <span>Order is Active</span>
                        </label>
                        <label className="ord-check">
                          <Field type="checkbox" name="inspection_done" />
                          <span>Return inspection done (restock sellable)</span>
                        </label>
                        <button type="submit" className="ord-btn-primary" disabled={saving}>
                          <Save size={15} /> {saving ? 'Saving…' : 'Update Order'}
                        </button>
                      </Form>
                    </Formik>
                  )}
                </div>
              )}
            </aside>
          </div>,
          document.body
        )}

      {formOpen &&
        createPortal(
          <div className={`ord-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="ord-backdrop" onClick={closeForm} />
            <aside className={`ord-offcanvas wide ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <button type="button" className="ord-oc-close" onClick={closeForm} aria-label="Close">
                <X size={18} />
              </button>
              <div className="ord-oc-head">
                <span className="ord-oc-icon"><ShoppingCart size={20} /></span>
                <div>
                  <h2>{editing ? `Update ${editing.order?.order_number}` : 'Add Order'}</h2>
                  <p>{editing ? 'Update shipping, fulfillment, payment and returns' : 'Create a manual panel order (starts Pending)'}</p>
                </div>
              </div>
              <Formik
                enableReinitialize
                initialValues={formInitial}
                onSubmit={async (values) => {
                  setFormSaving(true);
                  try {
                    if (editing?.order?.id) {
                      await orderPanelServices.http.put(`/panel/orders/${editing.order.id}`, {
                        shipping_name: values.shipping_name,
                        shipping_phone: values.shipping_phone,
                        shipping_address: values.shipping_address,
                        shipping_city: values.shipping_city,
                        shipping_state: values.shipping_state,
                        shipping_pincode: values.shipping_pincode,
                        notes: values.notes,
                        shipping_fee: Number(values.shipping_fee) || 0,
                        discount: Number(values.discount) || 0,
                        coupon_discount: Number(values.coupon_discount) || 0,
                        tax_amount: Number(values.tax_amount) || 0,
                        status: values.status,
                        payment_method: values.payment_method,
                        payment_status: values.payment_status,
                        order_source: values.order_source,
                        courier: values.courier,
                        tracking_number: values.tracking_number,
                        tracking_url: values.tracking_url,
                        expected_delivery_date: values.expected_delivery_date || null,
                        shipped_at: values.shipped_at || null,
                        delivered_at: values.delivered_at || null,
                        cancellation_reason: values.cancellation_reason,
                        return_reason: values.return_reason,
                        refund_amount: values.refund_amount !== '' ? Number(values.refund_amount) : null,
                        refund_method: values.refund_method,
                        refund_status: values.refund_status,
                        is_active: values.is_active,
                        inspection_done: values.inspection_done,
                      });
                      toast.success('Order updated');
                    } else {
                      const lineItems = (values.items || [])
                        .filter((item: OrderItemForm) => item.product_id && item.product_name)
                        .map((item: OrderItemForm) => ({
                          product_id: Number(item.product_id),
                          product_name: item.product_name,
                          size: item.size || null,
                          color: item.color || null,
                          quantity: Number(item.quantity) || 1,
                          price: Number(item.price) || 0,
                        }));
                      if (!lineItems.length) {
                        toast.error('Add at least one product item');
                        setFormSaving(false);
                        return;
                      }
                      await orderPanelServices.http.post('/panel/orders', {
                        user_id: values.user_id ? Number(values.user_id) : null,
                        order_source: values.order_source || 'admin',
                        shipping_name: values.shipping_name,
                        shipping_phone: values.shipping_phone,
                        shipping_address: values.shipping_address,
                        shipping_city: values.shipping_city,
                        shipping_state: values.shipping_state,
                        shipping_pincode: values.shipping_pincode,
                        notes: values.notes,
                        shipping_fee: Number(values.shipping_fee) || 0,
                        discount: Number(values.discount) || 0,
                        coupon_discount: Number(values.coupon_discount) || 0,
                        tax_amount: Number(values.tax_amount) || 0,
                        payment_method: values.payment_method,
                        payment_status: values.payment_status,
                        is_active: values.is_active,
                        courier: values.courier,
                        tracking_number: values.tracking_number,
                        tracking_url: values.tracking_url,
                        expected_delivery_date: values.expected_delivery_date || null,
                        items: lineItems,
                      });
                      toast.success('Order created');
                    }
                    closeForm();
                    await load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Could not save order');
                  } finally {
                    setFormSaving(false);
                  }
                }}
              >
                {({ values, setFieldValue }) => {
                  const subtotal = editing
                    ? Number(editing.order?.subtotal) || 0
                    : (values.items || []).reduce(
                        (sum: number, item: OrderItemForm) =>
                          sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
                        0
                      );
                  const total = calcTotal({ ...values, subtotal });
                  return (
                    <Form className="ord-oc-body">
                      <section className="ord-card">
                        <div className="ord-card-head"><MapPin size={16} /><h3>Customer & shipping</h3></div>
                        <div className="ord-form-grid">
                          {!editing && (
                            <label>
                              <span>Customer</span>
                              <Field as="select" name="user_id" className="ord-input">
                                <option value="">Walk-in Customer</option>
                                {customers.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                                ))}
                              </Field>
                            </label>
                          )}
                          <label>
                            <span>Order source</span>
                            <Field as="select" name="order_source" className="ord-input">
                              {ORDER_SOURCES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </Field>
                          </label>
                          {editing && (
                            <label>
                              <span>Order date</span>
                              <input className="ord-input" disabled value={formatDate(editing.order?.created_at)} />
                            </label>
                          )}
                          <label>
                            <span>Shipping name</span>
                            <Field name="shipping_name" className="ord-input" />
                          </label>
                          <label>
                            <span>Phone</span>
                            <Field name="shipping_phone" className="ord-input" />
                          </label>
                          <label className="ord-span-2">
                            <span>Address</span>
                            <Field name="shipping_address" className="ord-input" />
                          </label>
                          <label>
                            <span>City</span>
                            <Field name="shipping_city" className="ord-input" />
                          </label>
                          <label>
                            <span>State</span>
                            <Field name="shipping_state" className="ord-input" />
                          </label>
                          <label>
                            <span>Pincode</span>
                            <Field name="shipping_pincode" className="ord-input" />
                          </label>
                          <label className="ord-span-2">
                            <span>Notes</span>
                            <Field name="notes" className="ord-input" />
                          </label>
                        </div>
                      </section>

                      <section className="ord-card">
                        <div className="ord-card-head"><Truck size={16} /><h3>Shipping & delivery</h3></div>
                        <div className="ord-form-grid">
                          <label>
                            <span>Courier / partner</span>
                            <Field name="courier" className="ord-input" placeholder="Delhivery / BlueDart" />
                          </label>
                          <label>
                            <span>Tracking number</span>
                            <Field name="tracking_number" className="ord-input" />
                          </label>
                          <label className="ord-span-2">
                            <span>Tracking URL</span>
                            <Field name="tracking_url" className="ord-input" />
                          </label>
                          <label>
                            <span>Expected delivery</span>
                            <Field name="expected_delivery_date" type="date" className="ord-input" />
                          </label>
                          <label>
                            <span>Shipped date</span>
                            <Field name="shipped_at" type="datetime-local" className="ord-input" />
                          </label>
                          <label>
                            <span>Delivered date</span>
                            <Field name="delivered_at" type="datetime-local" className="ord-input" />
                          </label>
                        </div>
                      </section>

                      <section className="ord-card">
                        <div className="ord-card-head"><CreditCard size={16} /><h3>Status, payment & totals</h3></div>
                        <div className="ord-form-grid">
                          {editing && (
                            <label>
                              <span>Order status</span>
                              <Field as="select" name="status" className="ord-input">
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s}>{labelStatus(s)}</option>
                                ))}
                              </Field>
                            </label>
                          )}
                          <label>
                            <span>Payment method</span>
                            <Field as="select" name="payment_method" className="ord-input">
                              {PAYMENT_METHODS.map((s) => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                              ))}
                            </Field>
                          </label>
                          <label>
                            <span>Payment status</span>
                            <Field as="select" name="payment_status" className="ord-input">
                              {PAYMENT_STATUSES.map((s) => (
                                <option key={s} value={s}>{labelStatus(s)}</option>
                              ))}
                            </Field>
                          </label>
                          <label className="ord-check" style={{ alignSelf: 'end' }}>
                            <Field type="checkbox" name="is_active" />
                            <span>Is Active</span>
                          </label>
                          <label>
                            <span>Discount</span>
                            <Field name="discount" type="number" className="ord-input" />
                          </label>
                          <label>
                            <span>Coupon discount</span>
                            <Field name="coupon_discount" type="number" className="ord-input" />
                          </label>
                          <label>
                            <span>GST / Tax</span>
                            <Field name="tax_amount" type="number" className="ord-input" />
                          </label>
                          <label>
                            <span>Shipping fee</span>
                            <Field name="shipping_fee" type="number" className="ord-input" />
                          </label>
                        </div>
                        <div className="ord-form-totals">
                          <span>Subtotal {money(subtotal)}</span>
                          <strong>Grand Total {money(total)}</strong>
                        </div>
                      </section>

                      {editing && (
                        <section className="ord-card">
                          <div className="ord-card-head"><Ban size={16} /><h3>Cancellation & return</h3></div>
                          <div className="ord-form-grid">
                            <label className="ord-span-2">
                              <span>Cancellation reason</span>
                              <Field name="cancellation_reason" className="ord-input" />
                            </label>
                            <label className="ord-span-2">
                              <span>Return reason</span>
                              <Field name="return_reason" className="ord-input" />
                            </label>
                            <label>
                              <span>Refund amount</span>
                              <Field name="refund_amount" type="number" className="ord-input" />
                            </label>
                            <label>
                              <span>Refund method</span>
                              <Field name="refund_method" className="ord-input" placeholder="UPI / Bank / COD reverse" />
                            </label>
                            <label>
                              <span>Refund status</span>
                              <Field as="select" name="refund_status" className="ord-input">
                                {REFUND_STATUSES.map((s) => (
                                  <option key={s} value={s}>{labelStatus(s)}</option>
                                ))}
                              </Field>
                            </label>
                            <label className="ord-check" style={{ alignSelf: 'end' }}>
                              <Field type="checkbox" name="inspection_done" />
                              <span>Inspection done (restock)</span>
                            </label>
                          </div>
                        </section>
                      )}

                      {!editing && (
                        <section className="ord-card">
                          <div className="ord-card-head">
                            <Package size={16} />
                            <h3>Order items</h3>
                            <button
                              type="button"
                              className="ord-mini-btn"
                              style={{ marginLeft: 'auto' }}
                              onClick={() => setFieldValue('items', [...values.items, emptyItem()])}
                            >
                              <Plus size={14} /> Add item
                            </button>
                          </div>
                          <FieldArray name="items">
                            {({ remove }) => (
                              <div className="ord-items-form">
                                {values.items.map((item: OrderItemForm, index: number) => (
                                  <div key={index} className="ord-item-form-row">
                                    <select
                                      className="ord-input"
                                      value={item.variantKey}
                                      onChange={(e) => {
                                        const opt = productOptions.find((p) => p.key === e.target.value);
                                        if (!opt) {
                                          setFieldValue(`items.${index}`, emptyItem());
                                          return;
                                        }
                                        setFieldValue(`items.${index}`, {
                                          product_id: String(opt.product_id),
                                          product_name: opt.product_name,
                                          size: opt.size,
                                          color: opt.color,
                                          quantity: item.quantity || '1',
                                          price: String(opt.price),
                                          variantKey: opt.key,
                                        });
                                      }}
                                    >
                                      <option value="">Select product / variant</option>
                                      {productOptions.map((p) => (
                                        <option key={p.key} value={p.key}>{p.label}</option>
                                      ))}
                                    </select>
                                    <Field name={`items.${index}.quantity`} type="number" min="1" className="ord-input qty" />
                                    <Field name={`items.${index}.price`} type="number" className="ord-input price" />
                                    {values.items.length > 1 && (
                                      <button type="button" className="icon-action delete" onClick={() => remove(index)}>
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </FieldArray>
                        </section>
                      )}

                      {editing && (
                        <section className="ord-card">
                          <div className="ord-card-head"><Package size={16} /><h3>Items summary</h3></div>
                          <div className="ord-items">
                            {(editing.items || []).map((item: any) => (
                              <div key={item.id} className="ord-item-row">
                                <div>
                                  <strong>{item.product_name}</strong>
                                  <span>{item.color || '—'} · {item.size || '—'} · Qty {item.quantity}</span>
                                </div>
                                <strong>{money(Number(item.price) * Number(item.quantity))}</strong>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <button type="submit" className="ord-btn-primary" disabled={formSaving}>
                        <Save size={15} /> {formSaving ? 'Saving…' : editing ? 'Update Order' : 'Create Order'}
                      </button>
                    </Form>
                  );
                }}
              </Formik>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
