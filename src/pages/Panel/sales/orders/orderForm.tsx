import { Formik, Form, Field, FieldArray } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  MapPin,
  CreditCard,
  Save,
  Plus,
  Package,
  Truck,
  Ban,
  ArrowLeft,
  X,
} from 'lucide-react';
import { orderPanelServices } from '../../../../redux/orderPanel/orderPanel.services';
import { Loader } from '../../../../components/ui/Loader';
import './orders.scss';

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered',
  'cancelled', 'return_requested', 'returned', 'refund_pending', 'refunded',
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

export default function OrderFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orderMeta, setOrderMeta] = useState<any | null>(null);
  const [existingItems, setExistingItems] = useState<any[]>([]);

  const [initial, setInitial] = useState({
    user_id: '',
    order_source: 'admin',
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
    notes: '',
    shipping_fee: '0',
    discount: '0',
    coupon_discount: '0',
    tax_amount: '0',
    status: 'pending',
    payment_method: 'cod',
    payment_status: 'pending',
    courier: '',
    tracking_number: '',
    tracking_url: '',
    expected_delivery_date: '',
    shipped_at: '',
    delivered_at: '',
    cancellation_reason: '',
    return_reason: '',
    refund_amount: '',
    refund_method: '',
    refund_status: 'none',
    is_active: true,
    inspection_done: false,
    items: [emptyItem()] as OrderItemForm[],
  });

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [prod, cust] = await Promise.all([
          orderPanelServices.http.get('/panel/products').catch(() => ({ data: { products: [] } })),
          orderPanelServices.http.get('/panel/customers').catch(() => ({ data: { customers: [] } })),
        ]);
        if (!alive) return;
        setProducts(prod.data.products || []);
        setCustomers(cust.data.customers || []);

        if (isEdit && id) {
          setLoading(true);
          const { data } = await orderPanelServices.http.get(`/panel/orders/${id}`);
          if (!alive) return;
          const order = data.order;
          const items = data.items || [];
          setOrderMeta(order);
          setExistingItems(items);
          setInitial({
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
            items: items.length
              ? items.map((item: any) => ({
                  product_id: String(item.product_id || ''),
                  product_name: item.product_name || '',
                  size: item.size || '',
                  color: item.color || '',
                  quantity: String(item.quantity || 1),
                  price: String(item.price || ''),
                  variantKey: `${item.product_id}-${item.color || ''}-${item.size || ''}`,
                }))
              : [emptyItem()],
          });
        }
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Failed to load order form');
        if (isEdit) navigate('/panel/orders');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isEdit, navigate]);

  if (loading) {
    return (
      <div className="ord-page">
        <div className="ord-loading"><Loader /><p>Loading order form...</p></div>
      </div>
    );
  }

  return (
    <div className="ord-page">
      <div className="ord-panel ord-form-page">
        <div className="ord-toolbar">
          <div className="ord-hero">
            <span className="ord-hero-icon"><ShoppingCart size={22} /></span>
            <div>
              <h1>{isEdit ? `Update ${orderMeta?.order_number || ''}` : 'Add Order'}</h1>
              <p>
                {isEdit
                  ? 'Update shipping, fulfillment, payment, active and returns'
                  : 'Create a manual panel order (starts Pending)'}
              </p>
            </div>
          </div>
          <div className="ord-toolbar-actions">
            <Link to="/panel/orders" className="ord-mini-btn">
              <ArrowLeft size={15} /> Back to Orders
            </Link>
          </div>
        </div>

        <Formik
          enableReinitialize
          initialValues={initial}
          onSubmit={async (values) => {
            setSaving(true);
            try {
              if (isEdit && id) {
                await orderPanelServices.http.put(`/panel/orders/${id}`, {
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
                  .filter((item) => item.product_id && item.product_name)
                  .map((item) => ({
                    product_id: Number(item.product_id),
                    product_name: item.product_name,
                    size: item.size || null,
                    color: item.color || null,
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || 0,
                  }));
                if (!lineItems.length) {
                  toast.error('Add at least one product item');
                  setSaving(false);
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
              navigate('/panel/orders');
            } catch (e: any) {
              toast.error(e.response?.data?.message || 'Could not save order');
            } finally {
              setSaving(false);
            }
          }}
        >
          {({ values, setFieldValue }) => {
            const subtotal = isEdit
              ? Number(orderMeta?.subtotal) || 0
              : (values.items || []).reduce(
                  (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
                  0
                );
            const total = calcTotal({ ...values, subtotal });
            return (
              <Form className="ord-form-page-body">
                <section className="ord-card">
                  <div className="ord-card-head"><MapPin size={16} /><h3>Customer & shipping</h3></div>
                  <div className="ord-form-grid">
                    {!isEdit && (
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
                    {isEdit && (
                      <label>
                        <span>Order date</span>
                        <input className="ord-input" disabled value={formatDate(orderMeta?.created_at)} />
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
                    {isEdit && (
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

                {isEdit && (
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

                {!isEdit && (
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
                          {values.items.map((item, index) => (
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

                {isEdit && (
                  <section className="ord-card">
                    <div className="ord-card-head"><Package size={16} /><h3>Items summary</h3></div>
                    <div className="ord-items">
                      {existingItems.map((item) => (
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

                <div className="ord-form-page-actions">
                  <Link to="/panel/orders" className="ord-mini-btn">Cancel</Link>
                  <button type="submit" className="ord-btn-primary" disabled={saving}>
                    <Save size={15} /> {saving ? 'Saving…' : isEdit ? 'Update Order' : 'Create Order'}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
