import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Search,
  PackageSearch,
  Download,
  Printer,
  Ban,
  Undo2,
  Package,
  MapPin,
  CreditCard,
  History,
  Receipt,
  IndianRupee,
  CalendarDays,
  Eye,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { orderPanelServices } from '../../../../redux/orderPanel/orderPanel.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import {
  buildBillHtml,
  buildInvoiceHtml,
  downloadReceiptHtml,
  printReceiptHtml,
  type ReceiptPayload,
} from '../../../../utils/invoiceReceipt';
import './orderTracking.scss';

type DocKind = 'invoice' | 'bill';

const CANCELABLE = new Set(['pending', 'confirmed', 'processing', 'packed', 'delivered']);
const RETURNABLE = new Set(['shipped', 'delivered', 'return_requested']);

function money(value: unknown) {
  return `₹${Number(value || 0).toFixed(2)}`;
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

function formatDay(value: unknown) {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function labelize(s: string) {
  return String(s || '').replace(/_/g, ' ');
}

function statusClass(status: string) {
  const key = String(status || '').toLowerCase();
  if (['delivered', 'paid', 'confirmed', 'completed', 'refunded'].includes(key)) return 'is-ok';
  if (['shipped', 'processing', 'packed', 'refund_pending'].includes(key)) return 'is-info';
  if (['cancelled', 'failed', 'returned', 'return_requested'].includes(key)) return 'is-bad';
  return 'is-warn';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function docPayloadFromOrder(payload: {
  invoice: any;
  order: any;
  items: any[];
  payments: any[];
  companyName?: string | null;
  companyLocation?: string | null;
  autoPrint?: boolean;
}): ReceiptPayload {
  const { invoice, order, items, payments, companyName, companyLocation, autoPrint } = payload;
  const mode =
    (payments || [])
      .map((p) => String(p.method || '').toUpperCase())
      .filter(Boolean)
      .join(' + ') ||
    String(order?.payment_method || 'CASH').toUpperCase();
  const subtotal = Number(order?.subtotal || 0);
  const taxTotal = Number(order?.tax_amount || invoice?.tax || 0);
  const taxPercent = subtotal > 0 ? Number(((taxTotal / subtotal) * 100).toFixed(2)) : 0;

  const billAddress = [
    order?.shipping_address,
    order?.shipping_city,
    order?.shipping_state,
    order?.shipping_pincode,
  ]
    .filter(Boolean)
    .join(', ');
  const billName = order?.shipping_name || order?.customer_name || 'Customer';
  const billPhone = order?.shipping_phone || '';
  const billLocation = order?.shipping_city || 'Local';
  return {
    company: {
      name: companyName || 'BuildNex ShopOS',
      location: companyLocation || undefined,
    },
    invoiceNo: invoice?.invoice_no,
    orderNo: order?.order_number || 'NA',
    date: invoice?.created_at || order?.created_at || new Date(),
    dueDate: invoice?.created_at || order?.created_at || new Date(),
    terms: 'Due on Receipt',
    paymentMode: mode,
    billToName: billName,
    billToPhone: billPhone,
    billToLocation: billLocation,
    billToAddress: billAddress,
    shipToName: billName,
    shipToPhone: billPhone,
    shipToLocation: billLocation,
    shipToAddress: billAddress,
    items: (items || []).map((i) => ({
      product_name: i.product_name || 'Item',
      color: i.color || '',
      size: i.size || '',
      quantity: Number(i.quantity || 0),
      price: Number(i.price || 0),
      item_discount: Number(i.item_discount || 0),
      tax_percent: taxPercent,
    })),
    subtotal,
    taxTotal,
    taxPercent,
    discount: Number(order?.discount || 0) + Number(order?.coupon_discount || 0),
    charges: Number(order?.shipping_fee || 0),
    roundOff: Number(order?.round_off || 0),
    grandTotal: Number(order?.total || invoice?.total || 0),
    amountReceived: Number(order?.amount_received || invoice?.total || 0),
    changeAmount: Number(order?.change_amount || 0),
    payments,
    autoPrint,
  };
}

function buildDocHtml(kind: DocKind, payload: ReceiptPayload) {
  return kind === 'bill' ? buildBillHtml(payload) : buildInvoiceHtml(payload);
}

export default function OrderTrackingPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canEdit =
    hasRight(rights, user, 'order_tracking', 'edit') || hasRight(rights, user, 'order', 'edit');

  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [bills, setBills] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const billNo = invoice?.invoice_no || order?.order_number || '—';
  const orderId = Number(order?.orderID || order?.id || 0);
  const detailOpen = !!order;

  const orderStatus = String(order?.status || '').toLowerCase();
  const canCancel = useMemo(
    () => canEdit && !!order && CANCELABLE.has(orderStatus) && orderStatus !== 'cancelled',
    [canEdit, order, orderStatus]
  );
  const canReturn = useMemo(
    () =>
      canEdit &&
      !!order &&
      RETURNABLE.has(orderStatus) &&
      !['returned', 'refunded', 'cancelled'].includes(orderStatus),
    [canEdit, order, orderStatus]
  );

  const loadBills = useCallback(
    async (opts?: { q?: string; dateFrom?: string; dateTo?: string }) => {
      const nextQ = opts?.q ?? q;
      const nextFrom = opts?.dateFrom ?? dateFrom;
      const nextTo = opts?.dateTo ?? dateTo;
      setListLoading(true);
      try {
        const { data } = await orderPanelServices.http.get('/panel/billings', {
          params: {
            q: nextQ.trim() || undefined,
            date_from: nextFrom || undefined,
            date_to: nextTo || undefined,
          },
        });
        setBills(data.items || []);
      } catch (e: any) {
        setBills([]);
        toast.error(e.response?.data?.message || 'Failed to load bills');
      } finally {
        setListLoading(false);
      }
    },
    [q, dateFrom, dateTo]
  );

  useEffect(() => {
    loadBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearDetail = () => {
    setOrder(null);
    setItems([]);
    setHistory([]);
    setInvoice(null);
    setPayments([]);
  };

  const openBill = async (bill: any) => {
    const orderRef = bill?.orderID || bill?.order_id;
    const term = bill?.invoice_no || bill?.order_number || bill?.billingID || bill?.id;
    if (!orderRef && !term) {
      toast.error('Bill reference missing');
      return;
    }
    setDetailLoading(true);
    try {
      const { data } = orderRef
        ? await orderPanelServices.http.get(`/panel/orders/${orderRef}`)
        : await orderPanelServices.http.get('/panel/orders/track', {
            params: { q: String(term) },
          });
      setOrder(data.order || null);
      setItems(data.items || []);
      setHistory(data.history || []);
      setInvoice(data.invoice || bill || null);
      setPayments(data.payments || []);
      if (!data.order) toast.error('Order not found for this bill');
    } catch (e: any) {
      clearDetail();
      toast.error(e.response?.data?.message || 'Order not found');
    } finally {
      setDetailLoading(false);
    }
  };

  const trackSearch = async () => {
    const query = q.trim();
    if (query) {
      setDetailLoading(true);
      try {
        const { data } = await orderPanelServices.http.get('/panel/orders/track', {
          params: { q: query },
        });
        setOrder(data.order || null);
        setItems(data.items || []);
        setHistory(data.history || []);
        setInvoice(data.invoice || null);
        setPayments(data.payments || []);
        if (!data.order) toast.error('Order not found');
      } catch (e: any) {
        clearDetail();
        toast.error(e.response?.data?.message || 'Order not found');
      } finally {
        setDetailLoading(false);
      }
    } else {
      clearDetail();
    }
    await loadBills({ q: query });
  };

  const applyDatePreset = async (preset: 'today' | '7' | '30' | 'all') => {
    let from = '';
    let to = '';
    if (preset === 'today') {
      from = todayISO();
      to = todayISO();
    } else if (preset === '7') {
      from = daysAgoISO(6);
      to = todayISO();
    } else if (preset === '30') {
      from = daysAgoISO(29);
      to = todayISO();
    }
    setDateFrom(from);
    setDateTo(to);
    clearDetail();
    await loadBills({ dateFrom: from, dateTo: to });
  };

  const onDateFromChange = async (value: string) => {
    setDateFrom(value);
    clearDetail();
    await loadBills({ dateFrom: value });
  };

  const onDateToChange = async (value: string) => {
    setDateTo(value);
    clearDetail();
    await loadBills({ dateTo: value });
  };

  const refresh = async () => {
    if (!orderId) return;
    try {
      const { data } = await orderPanelServices.http.get(`/panel/orders/${orderId}`);
      setOrder(data.order || null);
      setItems(data.items || []);
      setHistory(data.history || []);
      setInvoice(data.invoice || null);
      setPayments(data.payments || []);
      await loadBills();
    } catch {
      /* keep current */
    }
  };

  const companyLocation =
    [user?.city, user?.state].filter(Boolean).join(', ') || undefined;

  const makeDoc = (kind: DocKind, autoPrint = false) => {
    if (!order) return null;
    return buildDocHtml(
      kind,
      docPayloadFromOrder({
        invoice,
        order,
        items,
        payments,
        companyName: user?.companyName,
        companyLocation,
        autoPrint,
      })
    );
  };

  const fileBase = () =>
    String(invoice?.invoice_no || order?.order_number || `order-${orderId}`).replace(
      /[^\w.-]+/g,
      '_'
    );

  const onDownloadDoc = (kind: DocKind) => {
    const html = makeDoc(kind, false);
    if (!html) return;
    downloadReceiptHtml(html, `${fileBase()}-${kind}`);
    toast.success(kind === 'bill' ? 'Bill downloaded' : 'Invoice downloaded');
  };

  const onPreviewDoc = (kind: DocKind) => {
    const html = makeDoc(kind, false);
    if (!html) return;
    if (!printReceiptHtml(html, kind)) toast.error('Allow popups to preview');
  };

  const onPrintDoc = (kind: DocKind) => {
    const html = makeDoc(kind, true);
    if (!html) return;
    if (!printReceiptHtml(html, kind)) toast.error('Allow popups to print');
  };

  const onCancel = async () => {
    if (!canCancel) {
      toast.error('Cancel is not allowed for this bill');
      return;
    }
    if (!orderId) {
      toast.error('Order id missing — reopen the bill and try again');
      return;
    }
    const reason = window.prompt('Cancel reason', 'Customer request');
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error('Cancel reason is required');
      return;
    }
    if (!confirm(`Cancel bill ${billNo}? Stock will be restored if already sold.`)) return;
    setBusy(true);
    try {
      await orderPanelServices.http.post(`/panel/orders/${orderId}/cancel`, {
        reason: reason.trim(),
        cancellation_reason: reason.trim(),
      });
      toast.success('Order cancelled');
      await refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Cancel failed');
    } finally {
      setBusy(false);
    }
  };

  const onReturn = async () => {
    if (!canReturn) {
      toast.error('Return is not allowed for this bill');
      return;
    }
    if (!orderId) {
      toast.error('Order id missing — reopen the bill and try again');
      return;
    }
    const reason = window.prompt('Return reason', 'Customer return');
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error('Return reason is required');
      return;
    }
    if (!confirm(`Mark bill ${billNo} as returned and restock items?`)) return;
    setBusy(true);
    try {
      await orderPanelServices.http.post(`/panel/orders/${orderId}/return`, {
        reason: reason.trim(),
        return_reason: reason.trim(),
      });
      toast.success('Order returned · stock restored');
      await refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Return failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="otk-page">
      <div className="otk-panel">
        <div className="otk-toolbar">
          <div className="otk-hero">
            <div className="otk-hero-icon">
              <PackageSearch size={22} />
            </div>
            <div>
              <h1>Order Tracking</h1>
              <p>
                All bills · <strong>{bills.length}</strong> shown
              </p>
            </div>
          </div>

          <div className="otk-filters">
            <label className="otk-search">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    trackSearch();
                  }
                }}
                placeholder="Bill / invoice / customer"
              />
            </label>

            <label className="otk-date">
              <CalendarDays size={15} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                disabled={listLoading}
              />
            </label>
            <span className="otk-date-sep">to</span>
            <label className="otk-date">
              <CalendarDays size={15} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                disabled={listLoading}
              />
            </label>
          </div>
        </div>

        <div className="otk-presets" role="group" aria-label="Date presets">
          <button type="button" onClick={() => applyDatePreset('today')}>Today</button>
          <button type="button" onClick={() => applyDatePreset('7')}>Last 7 days</button>
          <button type="button" onClick={() => applyDatePreset('30')}>Last 30 days</button>
          <button type="button" onClick={() => applyDatePreset('all')}>All bills</button>
        </div>

        {detailOpen || detailLoading ? (
          <div className="otk-body">
            <button type="button" className="otk-btn otk-back" onClick={clearDetail}>
              <ArrowLeft size={15} /> Back to all bills
            </button>

            {detailLoading ? (
              <div className="otk-loading">
                <Loader />
                <p>Loading bill details…</p>
              </div>
            ) : (
              <>
                <div className="otk-summary">
                  <div>
                    <span className="otk-kicker">Bill / Invoice</span>
                    <h2>{billNo}</h2>
                    <p>
                      Order <strong>{order.order_number}</strong> · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="otk-summary-side">
                    <span className={`otk-badge ${statusClass(order.status)}`}>{labelize(order.status)}</span>
                    <strong className="otk-total">{money(order.total || invoice?.total)}</strong>
                  </div>
                </div>

                <div className="otk-actions">
                  <button type="button" className="otk-btn" onClick={() => onDownloadDoc('invoice')}>
                    <Download size={15} /> Download Invoice
                  </button>
                  <button type="button" className="otk-btn" onClick={() => onDownloadDoc('bill')}>
                    <Download size={15} /> Download Bill
                  </button>
                  <button type="button" className="otk-btn" onClick={() => onPreviewDoc('invoice')}>
                    <Eye size={15} /> Preview Invoice
                  </button>
                  <button type="button" className="otk-btn" onClick={() => onPreviewDoc('bill')}>
                    <FileText size={15} /> Preview Bill
                  </button>
                  <button type="button" className="otk-btn" onClick={() => onPrintDoc('invoice')}>
                    <Printer size={15} /> Print Invoice
                  </button>
                  <button type="button" className="otk-btn" onClick={() => onPrintDoc('bill')}>
                    <Printer size={15} /> Print Bill
                  </button>
                  {canReturn && (
                    <button type="button" className="otk-btn warn" disabled={busy} onClick={onReturn}>
                      <Undo2 size={15} /> Return
                    </button>
                  )}
                  {canCancel && (
                    <button type="button" className="otk-btn danger" disabled={busy} onClick={onCancel}>
                      <Ban size={15} /> Cancel
                    </button>
                  )}
                </div>

                <div className="otk-grid">
                  <section className="otk-card">
                    <h3><Package size={16} /> Products</h3>
                    <div className="otk-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td colSpan={4}>No items</td>
                            </tr>
                          ) : (
                            items.map((item, idx) => (
                              <tr key={item.orderItemID || item.id || idx}>
                                <td>
                                  <strong>{item.product_name}</strong>
                                  <div className="otk-muted">
                                    {[item.color, item.size].filter(Boolean).join(' · ') || '—'}
                                  </div>
                                </td>
                                <td>{item.quantity}</td>
                                <td>{money(item.price)}</td>
                                <td>{money(Number(item.price || 0) * Number(item.quantity || 0))}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="otk-card">
                    <h3><IndianRupee size={16} /> Bill Price</h3>
                    <div className="otk-totals">
                      <div><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div>
                      <div><span>Discount</span><strong>{money(Number(order.discount || 0) + Number(order.coupon_discount || 0))}</strong></div>
                      <div><span>Tax / GST</span><strong>{money(order.tax_amount || invoice?.tax)}</strong></div>
                      <div><span>Charges</span><strong>{money(order.shipping_fee)}</strong></div>
                      <div><span>Round off</span><strong>{money(order.round_off)}</strong></div>
                      <div className="is-grand"><span>Grand Total</span><strong>{money(order.total || invoice?.total)}</strong></div>
                      <div><span>Received</span><strong>{money(order.amount_received)}</strong></div>
                      <div><span>Payment</span><strong>{labelize(order.payment_status)} · {String(order.payment_method || '—').toUpperCase()}</strong></div>
                    </div>
                  </section>

                  <section className="otk-card">
                    <h3><MapPin size={16} /> Customer</h3>
                    <p><strong>{order.shipping_name || order.customer_name}</strong></p>
                    <p className="otk-muted">{order.shipping_phone || '—'}</p>
                    <p className="otk-muted">
                      {[order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_pincode]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                  </section>

                  <section className="otk-card">
                    <h3><CreditCard size={16} /> Payments</h3>
                    {!payments.length ? (
                      <p className="otk-muted">No POS payment rows</p>
                    ) : (
                      <ul className="otk-list">
                        {payments.map((p) => (
                          <li key={p.posPaymentID || p.id}>
                            <strong>{String(p.method || '').toUpperCase()}</strong>
                            <span>{money(p.amount)}</span>
                            <em>{p.reference_no || p.status || ''}</em>
                          </li>
                        ))}
                      </ul>
                    )}
                    {invoice && (
                      <p className="otk-inv">
                        <Receipt size={14} /> {invoice.invoice_no} · {invoice.status}
                      </p>
                    )}
                  </section>

                  <section className="otk-card span-2">
                    <h3><History size={16} /> Status History</h3>
                    {!history.length ? (
                      <p className="otk-muted">No history yet</p>
                    ) : (
                      <ul className="otk-timeline">
                        {history.map((h) => (
                          <li key={h.orderStatusHistoryID || h.id}>
                            <span className={`otk-badge ${statusClass(h.to_status)}`}>{labelize(h.to_status)}</span>
                            <div>
                              <strong>{h.note || `${labelize(h.from_status || '—')} → ${labelize(h.to_status)}`}</strong>
                              <p className="otk-muted">
                                {formatDate(h.created_at)}
                                {h.created_by_name ? ` · ${h.created_by_name}` : ''}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        ) : listLoading ? (
          <div className="otk-loading">
            <Loader />
            <p>Loading bills…</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="otk-empty">
            <PackageSearch size={36} />
            <h3>No bills found</h3>
            <p>Try clearing the date filter or search another bill number.</p>
          </div>
        ) : (
          <div className="otk-list-wrap">
            <div className="otk-table-wrap">
              <table className="otk-bills-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Bill / Invoice</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, index) => (
                    <tr key={bill.billingID || bill.id} className="otk-bill-row" onClick={() => openBill(bill)}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{bill.invoice_no}</strong>
                        <div className="otk-muted">{bill.order_number || (bill.orderID ? `Order #${bill.orderID}` : '—')}</div>
                      </td>
                      <td>{bill.customer_name || '—'}</td>
                      <td>{formatDay(bill.created_at)}</td>
                      <td>
                        <span className={`otk-badge ${statusClass(bill.order_status || bill.status)}`}>
                          {labelize(bill.order_status || bill.status)}
                        </span>
                      </td>
                      <td><strong>{money(bill.total)}</strong></td>
                      <td>
                        <button
                          type="button"
                          className="otk-icon-btn"
                          title="View bill"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBill(bill);
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
