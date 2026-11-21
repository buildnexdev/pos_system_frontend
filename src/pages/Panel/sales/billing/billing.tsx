import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  CircleDollarSign,
  Search,
  Camera,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  Pause,
  Play,
  Receipt,
  Printer,
  RefreshCw,
  Package,
  Share2,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react';
import { billingServices } from '../../../../redux/billing/billing.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import {
  buildReceiptHtml,
  downloadReceiptHtml,
  printReceiptHtml,
} from '../../../../utils/invoiceReceipt';
import './billing.scss';

type CartLine = {
  key: string;
  product_id: number;
  product_name: string;
  image?: string;
  size: string;
  color: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: number;
  item_discount: number;
  available_qty: number;
};

type HeldBill = {
  id: string;
  savedAt: string;
  cart: CartLine[];
  customer: typeof emptyCustomer;
  walkIn: boolean;
  billDiscount: string;
  couponDiscount: string;
  taxPercent: string;
  additionalCharges: string;
  roundOff: string;
  notes: string;
};

type InvoiceRow = {
  id: number;
  billingID?: number;
  invoice_no: string;
  customer_name: string;
  total: number;
  status: string;
  created_at?: string;
  order_id?: number;
  orderID?: number;
};

const emptyCustomer = {
  id: null as number | null,
  name: '',
  phone: '',
  address: '',
  email: '',
  city: 'Local',
  state: 'N/A',
  pincode: '000000',
};

const HOLD_KEY = 'pos_held_bills';
const PAY_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'credit', label: 'Credit' },
] as const;

function money(n: unknown) {
  return `₹${Number(n || 0).toFixed(2)}`;
}

function lineKey(row: { product_id: number; size?: string; color?: string; barcode?: string }) {
  return `${row.product_id}|${row.color || ''}|${row.size || ''}|${row.barcode || ''}`;
}

function loadHolds(): HeldBill[] {
  try {
    return JSON.parse(localStorage.getItem(HOLD_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHolds(rows: HeldBill[]) {
  localStorage.setItem(HOLD_KEY, JSON.stringify(rows));
}

function stockToCart(row: any): CartLine {
  return {
    key: lineKey({
      product_id: row.product_id,
      size: row.size,
      color: row.color,
      barcode: row.barcode || row.stock_code,
    }),
    product_id: Number(row.product_id),
    product_name: row.product_name,
    image: row.image || row.variant_image || '',
    size: row.size || '',
    color: row.color || '',
    sku: row.stock_code || row.sku || row.product_code || '',
    barcode: row.barcode || row.stock_code || '',
    quantity: 1,
    price: Number(row.sale_price ?? row.variant_price ?? row.mrp ?? 0),
    item_discount: 0,
    available_qty: Number(row.available_qty || 0),
  };
}

function receiptFromSale(payload: {
  invoice: any;
  orderNumber: string;
  customer: typeof emptyCustomer;
  items: Array<{
    product_name: string;
    color?: string;
    size?: string;
    sku?: string;
    barcode?: string;
    quantity: number;
    price: number;
    item_discount?: number;
  }>;
  totals: any;
  payments: any[];
  company?: { name?: string | null; location?: string | null };
  taxPercent?: number;
  autoPrint?: boolean;
}) {
  const mode =
    (payload.payments || [])
      .map((p) => String(p.method || '').toUpperCase())
      .filter(Boolean)
      .join(' + ') || 'CASH';
  const taxPct = Number(payload.taxPercent);
  const billAddress = [
    payload.customer?.address,
    payload.customer?.city,
    payload.customer?.state,
    payload.customer?.pincode,
  ]
    .filter(Boolean)
    .join(', ');
  return buildReceiptHtml({
    company: {
      name: payload.company?.name || 'BuildNex ShopOS',
      location: payload.company?.location || undefined,
    },
    invoiceNo: payload.invoice?.invoice_no,
    orderNo: payload.orderNumber || 'NA',
    date: payload.invoice?.created_at || new Date(),
    dueDate: payload.invoice?.created_at || new Date(),
    terms: 'Due on Receipt',
    paymentMode: mode,
    billToName: payload.customer?.name || 'Walk-in Customer',
    billToPhone: payload.customer?.phone || '',
    billToLocation: payload.customer?.city || 'Local',
    billToAddress: billAddress,
    shipToName: payload.customer?.name || 'Walk-in Customer',
    shipToPhone: payload.customer?.phone || '',
    shipToLocation: payload.customer?.city || 'Local',
    shipToAddress: billAddress,
    items: (payload.items || []).map((i) => ({
      ...i,
      tax_percent: Number.isFinite(taxPct) ? taxPct : 0,
    })),
    subtotal: payload.totals?.subtotal,
    taxTotal: payload.totals?.tax_amount,
    taxPercent: Number.isFinite(taxPct) ? taxPct : 0,
    discount: Number(payload.totals?.discount || 0) + Number(payload.totals?.coupon_discount || 0),
    charges: payload.totals?.additional_charges,
    roundOff: payload.totals?.round_off,
    grandTotal: payload.totals?.total,
    amountReceived: payload.totals?.amount_received,
    changeAmount: payload.totals?.change_amount,
    payments: payload.payments,
    autoPrint: payload.autoPrint,
  });
}

function printInvoice(payload: Parameters<typeof receiptFromSale>[0]) {
  const html = receiptFromSale({ ...payload, autoPrint: true });
  if (!printReceiptHtml(html)) toast.error('Allow popups to print invoice');
}

function downloadInvoice(payload: Parameters<typeof receiptFromSale>[0]) {
  const html = receiptFromSale({ ...payload, autoPrint: false });
  const name = String(payload.invoice?.invoice_no || payload.orderNumber || 'invoice').replace(
    /[^\w.-]+/g,
    '_'
  );
  downloadReceiptHtml(html, name);
}

export default function BillingPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'billing', 'create');
  const canEdit = hasRight(rights, user, 'billing', 'edit');

  const scanRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const scanLoopRef = useRef<number | null>(null);

  const [scan, setScan] = useState('');
  const [hits, setHits] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [walkIn, setWalkIn] = useState(true);
  const [billDiscount, setBillDiscount] = useState('0');
  const [couponDiscount, setCouponDiscount] = useState('0');
  const [taxPercent, setTaxPercent] = useState('5');
  const [additionalCharges, setAdditionalCharges] = useState('0');
  const [roundOff, setRoundOff] = useState('0');
  const [notes, setNotes] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'card' | 'credit'>('cash');
  const [splitMode, setSplitMode] = useState(false);
  const [splitPays, setSplitPays] = useState([{ method: 'cash', amount: '', reference_no: '' }]);
  const [amountReceived, setAmountReceived] = useState('');
  const [payRef, setPayRef] = useState('');
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [holdsOpen, setHoldsOpen] = useState(false);
  const [holdsVisible, setHoldsVisible] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [invoiceBusyId, setInvoiceBusyId] = useState<number | null>(null);
  const [invVisible, setInvVisible] = useState(false);
  const [invQuery, setInvQuery] = useState('');
  const [holds, setHolds] = useState<HeldBill[]>(() => loadHolds());
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(`pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    const syncFs = () => {
      const el = pageRef.current;
      const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
      const on = fsEl === el || !!el?.classList.contains('is-fullscreen');
      if (!fsEl && el) el.classList.remove('is-fullscreen');
      setIsFullscreen(on && !!el && (fsEl === el || el.classList.contains('is-fullscreen')));
    };
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs as any);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pageRef.current?.classList.contains('is-fullscreen')) {
        pageRef.current.classList.remove('is-fullscreen');
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', syncFs);
      document.removeEventListener('webkitfullscreenchange', syncFs as any);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggleFullscreen = async () => {
    const el = pageRef.current;
    if (!el) return;
    try {
      const current =
        document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (current === el) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        el.classList.remove('is-fullscreen');
        setIsFullscreen(false);
        return;
      }
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        setIsFullscreen(true);
        return;
      }
      if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
        setIsFullscreen(true);
        return;
      }
      // Fallback: CSS immersive mode when browser blocks Fullscreen API
      el.classList.toggle('is-fullscreen');
      setIsFullscreen(el.classList.contains('is-fullscreen'));
    } catch {
      el.classList.toggle('is-fullscreen');
      setIsFullscreen(el.classList.contains('is-fullscreen'));
      toast(el.classList.contains('is-fullscreen') ? 'Fullscreen on' : 'Fullscreen off');
    }
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + Math.max(0, l.price * l.quantity - l.item_discount), 0);
    const discount = Math.max(0, Number(billDiscount) || 0);
    const coupon_discount = Math.max(0, Number(couponDiscount) || 0);
    const taxable = Math.max(0, subtotal - discount - coupon_discount);
    const tax_amount = Number(((taxable * (Number(taxPercent) || 0)) / 100).toFixed(2));
    const additional_charges = Math.max(0, Number(additionalCharges) || 0);
    const round_off = Number(roundOff) || 0;
    const total = Number((taxable + tax_amount + additional_charges + round_off).toFixed(2));
    const amount_received = Math.max(0, Number(amountReceived || total) || 0);
    const change_amount = Math.max(0, Number((amount_received - total).toFixed(2)));
    const outstanding = Math.max(0, Number((total - amount_received).toFixed(2)));
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount,
      coupon_discount,
      tax_amount,
      additional_charges,
      round_off,
      total,
      amount_received,
      change_amount,
      outstanding,
    };
  }, [cart, billDiscount, couponDiscount, taxPercent, additionalCharges, roundOff, amountReceived]);

  const loadInvoices = useCallback(async (q = '') => {
    try {
      const { data } = await billingServices.http.get('/panel/billings', {
        params: q.trim() ? { q: q.trim() } : undefined,
      });
      setInvoices(data.items || []);
    } catch {
      setInvoices([]);
    }
  }, []);

  const invoiceKey = (inv: InvoiceRow) =>
    Number(inv.billingID || inv.id || 0) || String(inv.invoice_no || '');

  const exportInvoice = async (inv: InvoiceRow, mode: 'download' | 'print') => {
    const billingId = Number(inv.billingID || inv.id || 0);
    const lookup = billingId || inv.invoice_no;
    if (!lookup) {
      toast.error('Invoice id missing');
      return;
    }
    setInvoiceBusyId(billingId || -1);
    try {
      const data = await billingServices.getOne(lookup);
      const invoice = data.invoice || inv;
      const order = data.order || {};
      const items = (data.items || []).map((row: any) => ({
        product_name: row.product_name || 'Item',
        color: row.color || '',
        size: row.size || '',
        sku: row.sku || row.stock_code || '',
        barcode: row.barcode || '',
        quantity: Number(row.quantity || 0),
        price: Number(row.price || 0),
        item_discount: Number(row.item_discount || 0),
      }));
      const payload = {
        invoice,
        orderNumber: order.order_number || String(order.orderID || order.id || ''),
        customer: {
          ...emptyCustomer,
          name: order.shipping_name || invoice.customer_name || 'Walk-in Customer',
          phone: order.shipping_phone || '',
          address: order.shipping_address || '',
          email: invoice.customer_email || '',
          city: order.shipping_city || 'Local',
          state: order.shipping_state || 'N/A',
          pincode: order.shipping_pincode || '000000',
        },
        items,
        totals: data.totals || {
          subtotal: Number(invoice.amount || invoice.total || 0),
          discount: 0,
          coupon_discount: 0,
          tax_amount: Number(invoice.tax || 0),
          additional_charges: 0,
          round_off: 0,
          total: Number(invoice.total || 0),
          amount_received: Number(invoice.total || 0),
          change_amount: 0,
        },
        payments: data.payments || [],
        company: {
          name: user?.companyName || 'BuildNex ShopOS',
          location: [user?.city, user?.state].filter(Boolean).join(', ') || undefined,
        },
        taxPercent: Number(taxPercent) || 0,
      };
      if (mode === 'download') {
        downloadInvoice(payload);
        toast.success('Invoice downloaded');
      } else {
        printInvoice(payload);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not load invoice');
    } finally {
      setInvoiceBusyId(null);
    }
  };

  useEffect(() => {
    loadInvoices();
    scanRef.current?.focus();
  }, [loadInvoices]);

  useEffect(() => {
    if (holdsOpen) requestAnimationFrame(() => setHoldsVisible(true));
    else setHoldsVisible(false);
  }, [holdsOpen]);

  useEffect(() => {
    if (invOpen) requestAnimationFrame(() => setInvVisible(true));
    else setInvVisible(false);
  }, [invOpen]);

  useEffect(() => () => {
    stopCamera();
  }, []);

  const searchProducts = async (term: string) => {
    const q = term.trim();
    if (!q) {
      setHits([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await billingServices.http.get('/panel/pos/lookup', { params: { q } });
      const rows = (data.items || (data.item ? [data.item] : [])).filter(
        (r: any) => Number(r.available_qty) > 0
      );
      setHits(rows);
    } catch {
      setHits([]);
    } finally {
      setSearching(false);
    }
  };

  const addToCart = (row: any) => {
    const line = stockToCart(row);
    if (line.available_qty <= 0) {
      toast.error('Out of stock');
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.key === line.key);
      if (idx >= 0) {
        const next = [...prev];
        const qty = next[idx].quantity + 1;
        if (qty > next[idx].available_qty) {
          toast.error(`Only ${next[idx].available_qty} available`);
          return prev;
        }
        next[idx] = { ...next[idx], quantity: qty };
        return next;
      }
      return [...prev, line];
    });
    setScan('');
    setHits([]);
    scanRef.current?.focus();
  };

  const resolveScan = async (code: string) => {
    const q = code.trim();
    if (!q) return;
    try {
      const { data } = await billingServices.http.get('/panel/pos/lookup', { params: { code: q } });
      const item = data.item;
      if (!item) {
        toast.error('Product not found');
        setHits(data.items || []);
        return;
      }
      addToCart(item);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Product not found');
    }
  };

  const updateQty = (key: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.key !== key) return l;
          const nextQty = Math.max(0, qty);
          if (nextQty > l.available_qty) {
            toast.error(`Only ${l.available_qty} available`);
            return l;
          }
          return { ...l, quantity: nextQty };
        })
        .filter((l) => l.quantity > 0)
    );
  };

  const lookupCustomer = async () => {
    const phone = customer.phone.trim();
    if (!phone) {
      toast.error('Enter mobile number');
      return;
    }
    try {
      const { data } = await billingServices.http.get('/panel/pos/customers', { params: { phone } });
      const c = data.customer || data.customers?.[0];
      if (!c) {
        toast('No saved customer — fill details to create');
        setWalkIn(false);
        return;
      }
      setWalkIn(false);
      setCustomer({
        id: c.id,
        name: c.name || '',
        phone: c.phone || phone,
        address: c.address || '',
        email: c.email || '',
        city: c.city || 'Local',
        state: c.state || 'N/A',
        pincode: c.pincode || '000000',
      });
      toast.success('Customer loaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Customer lookup failed');
    }
  };

  const clearSale = () => {
    setCart([]);
    setCustomer(emptyCustomer);
    setWalkIn(true);
    setBillDiscount('0');
    setCouponDiscount('0');
    setAdditionalCharges('0');
    setRoundOff('0');
    setNotes('');
    setAmountReceived('');
    setPayRef('');
    setSplitMode(false);
    setSplitPays([{ method: 'cash', amount: '', reference_no: '' }]);
    setPayMethod('cash');
    setLastSale(null);
    requestIdRef.current = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    scanRef.current?.focus();
  };

  const holdBill = () => {
    if (!cart.length) {
      toast.error('Cart is empty');
      return;
    }
    const row: HeldBill = {
      id: `hold-${Date.now()}`,
      savedAt: new Date().toISOString(),
      cart,
      customer,
      walkIn,
      billDiscount,
      couponDiscount,
      taxPercent,
      additionalCharges,
      roundOff,
      notes,
    };
    const next = [row, ...loadHolds()].slice(0, 30);
    saveHolds(next);
    setHolds(next);
    clearSale();
    toast.success('Bill held');
  };

  const resumeBill = (row: HeldBill) => {
    setCart(row.cart);
    setCustomer(row.customer);
    setWalkIn(row.walkIn);
    setBillDiscount(row.billDiscount);
    setCouponDiscount(row.couponDiscount);
    setTaxPercent(row.taxPercent);
    setAdditionalCharges(row.additionalCharges);
    setRoundOff(row.roundOff);
    setNotes(row.notes);
    const next = loadHolds().filter((h) => h.id !== row.id);
    saveHolds(next);
    setHolds(next);
    setHoldsOpen(false);
    toast.success('Bill resumed');
  };

  const stopCamera = () => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      toast.error('Camera barcode not supported in this browser');
      return;
    }
    try {
      detectorRef.current = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a', 'upc_e'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
      const loop = async () => {
        if (!videoRef.current || !detectorRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          if (codes?.[0]?.rawValue) {
            const value = String(codes[0].rawValue);
            stopCamera();
            setScan(value);
            await resolveScan(value);
            return;
          }
        } catch {
          /* keep scanning */
        }
        scanLoopRef.current = requestAnimationFrame(loop);
      };
      scanLoopRef.current = requestAnimationFrame(loop);
    } catch {
      toast.error('Could not open camera');
      stopCamera();
    }
  };

  const buildPayments = () => {
    if (splitMode) {
      return splitPays
        .map((p) => ({
          method: p.method,
          amount: Number(p.amount) || 0,
          reference_no: p.reference_no,
          status: p.method === 'credit' ? 'pending' : 'paid',
        }))
        .filter((p) => p.amount > 0);
    }
    return [
      {
        method: payMethod,
        amount: totals.total,
        reference_no: payRef,
        status: payMethod === 'credit' ? 'pending' : 'paid',
      },
    ];
  };

  const checkout = async (print = true) => {
    if (!canCreate) {
      toast.error('No billing create permission');
      return;
    }
    if (!cart.length) {
      toast.error('Cart is empty');
      return;
    }
    if (!walkIn) {
      if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
        toast.error('Customer name, mobile and address are required');
        return;
      }
    }
    if (payMethod === 'credit' && !canEdit) {
      toast.error('Credit sale needs billing edit permission');
      return;
    }
    if (splitMode && splitPays.some((p) => p.method === 'credit') && !canEdit) {
      toast.error('Credit sale needs billing edit permission');
      return;
    }

    const payments = buildPayments();
    const paySum = payments.reduce((s, p) => s + p.amount, 0);
    if (Math.abs(paySum - totals.total) > 0.05 && payMethod !== 'credit' && !payments.some((p) => p.method === 'credit')) {
      toast.error('Payment total must match grand total');
      return;
    }

    setBusy(true);
    try {
      const { data } = await billingServices.http.post('/panel/pos/checkout', {
        client_request_id: requestIdRef.current,
        walk_in: walkIn,
        user_id: customer.id || undefined,
        customer: walkIn ? undefined : customer,
        shipping_name: walkIn ? 'Walk-in Customer' : customer.name,
        shipping_phone: walkIn ? '0000000000' : customer.phone,
        shipping_address: walkIn ? 'Store pickup' : customer.address,
        shipping_city: walkIn ? 'Local' : customer.city || 'Local',
        shipping_state: walkIn ? 'N/A' : customer.state || 'N/A',
        shipping_pincode: walkIn ? '000000' : customer.pincode || '000000',
        items: cart.map((l) => ({
          product_id: l.product_id,
          product_name: l.product_name,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
          price: l.price,
          item_discount: l.item_discount,
          barcode: l.barcode,
        })),
        discount: totals.discount,
        coupon_discount: totals.coupon_discount,
        tax_amount: totals.tax_amount,
        additional_charges: totals.additional_charges,
        round_off: totals.round_off,
        total: totals.total,
        amount_received: Number(amountReceived || totals.total),
        payment_method: splitMode ? 'split' : payMethod,
        payments,
        notes,
      });

      setLastSale(data);
      toast.success(data.duplicate ? 'Already processed' : 'Sale completed');
      if (print) {
        printInvoice({
          invoice: data.invoice,
          orderNumber: data.orderNumber,
          customer: walkIn
            ? { ...emptyCustomer, name: 'Walk-in Customer', phone: '0000000000', address: 'Store pickup' }
            : customer,
          items: cart,
          totals: data.totals || totals,
          payments: data.payments || payments,
          company: {
            name: user?.companyName || 'BuildNex ShopOS',
            location: [user?.city, user?.state].filter(Boolean).join(', ') || undefined,
          },
          taxPercent: Number(taxPercent) || 0,
        });
      }
      clearSale();
      loadInvoices();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  const shareWhatsApp = () => {
    if (!lastSale?.invoice) {
      toast.error('Complete a sale first');
      return;
    }
    const text = encodeURIComponent(
      `Invoice ${lastSale.invoice.invoice_no}\nOrder ${lastSale.orderNumber}\nTotal ${money(lastSale.totals?.total || lastSale.invoice.total)}\nThank you!`
    );
    const phone = (customer.phone || '').replace(/\D/g, '');
    window.open(phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`pos-page ${isFullscreen ? 'is-fullscreen' : ''}`} ref={pageRef}>
      <div className="pos-shell">
        <section className="pos-main">
          <div className="pos-topbar">
            <div className="pos-brand">
              <span className="pos-brand-mark"><CircleDollarSign size={22} /></span>
              <div>
                <h1>POS Billing</h1>
                <p>{cart.length} items in cart · {money(totals.total)}</p>
              </div>
            </div>
            <div className="pos-top-actions">
              <button type="button" className="pos-chip" onClick={() => { setHolds(loadHolds()); setHoldsOpen(true); }}>
                <Pause size={14} /> Held ({holds.length})
              </button>
              <button type="button" className="pos-chip" onClick={() => { setInvQuery(''); loadInvoices(''); setInvOpen(true); }}>
                <Receipt size={14} /> Invoices
              </button>
              <button type="button" className="pos-chip" onClick={() => scanRef.current?.focus()}>
                <RefreshCw size={14} /> Focus Scan
              </button>
              <button
                type="button"
                className={`pos-chip ${isFullscreen ? 'is-on' : ''}`}
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                {isFullscreen ? 'Exit Full' : 'Full Screen'}
              </button>
            </div>
          </div>

          <div className="pos-body">
            <div className="pos-scan-block">
              <label className="pos-scan">
                <Search size={18} />
                <input
                  ref={scanRef}
                  value={scan}
                  onChange={(e) => {
                    setScan(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      resolveScan(scan);
                    }
                  }}
                  placeholder="Scan barcode / search name, SKU, code"
                  autoFocus
                />
                <button
                  type="button"
                  className={`pos-scan-cam ${cameraOn ? 'is-on' : ''}`}
                  onClick={() => (cameraOn ? stopCamera() : startCamera())}
                  title="Camera scan"
                >
                  <Camera size={16} />
                </button>
              </label>
              {cameraOn && (
                <div className="pos-camera">
                  <video ref={videoRef} muted playsInline />
                </div>
              )}
            </div>

            <div className="pos-products-head">
              <h2>Available products</h2>
              <span>{searching ? 'Searching…' : `${hits.length} in stock`}</span>
            </div>

            {!hits.length ? (
              <div className="pos-empty">
                <strong>Ready to scan</strong>
                Scan a barcode or type a product name to see in-stock items
              </div>
            ) : (
              <div className="pos-grid">
                {hits.map((h) => (
                  <button
                    key={`${h.inventory_id || h.variant_id}-${h.product_id}`}
                    type="button"
                    className="pos-product"
                    onClick={() => addToCart(h)}
                  >
                    <div className="pos-product-media">
                      {h.image || h.variant_image ? (
                        <img src={h.image || h.variant_image} alt="" />
                      ) : (
                        <Package size={22} />
                      )}
                    </div>
                    <div className="pos-product-body">
                      <strong>{h.product_name}</strong>
                      <span>{h.color || '—'} / {h.size || '—'} · {h.stock_code || h.barcode || h.sku || '—'}</span>
                      <div className="pos-product-foot">
                        <em>{money(h.sale_price ?? h.variant_price ?? h.mrp)}</em>
                        <span className="pos-stock">Stock {h.available_qty}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="pos-customer">
              <div className="pos-customer-top">
                <h2><User size={16} /> Customer</h2>
                <label className="pos-toggle">
                  <input
                    type="checkbox"
                    checked={walkIn}
                    onChange={(e) => {
                      setWalkIn(e.target.checked);
                      if (e.target.checked) setCustomer(emptyCustomer);
                    }}
                  />
                  Walk-in
                </label>
              </div>
              {!walkIn && (
                <div className="pos-form-grid">
                  <label className="span-2">
                    Mobile *
                    <div className="pos-inline">
                      <input
                        className="pos-input"
                        value={customer.phone}
                        onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                        placeholder="10-digit mobile"
                      />
                      <button type="button" className="pos-btn" onClick={lookupCustomer}>Find</button>
                    </div>
                  </label>
                  <label className="span-2">
                    Name *
                    <input className="pos-input" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
                  </label>
                  <label className="span-2">
                    Address *
                    <input className="pos-input" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
                  </label>
                  <label>
                    City
                    <input className="pos-input" value={customer.city} onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value }))} />
                  </label>
                  <label>
                    Email
                    <input className="pos-input" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="pos-checkout">
          <div className="pos-checkout-head">
            <h2>Checkout</h2>
            <p>{cart.length ? `${cart.length} line(s) ready` : 'Add products to begin'}</p>
          </div>

          <div className="pos-cart">
            {!cart.length ? (
              <div className="pos-empty">Cart is empty</div>
            ) : (
              cart.map((l) => (
                <div key={l.key} className="pos-cart-row">
                  {l.image ? <img className="pos-thumb" src={l.image} alt="" /> : <span className="pos-thumb"><Package size={14} /></span>}
                  <div className="pos-cart-meta">
                    <strong>{l.product_name}</strong>
                    <span>{l.color || '—'} / {l.size || '—'} · {l.sku || l.barcode || '—'}</span>
                    <div className="pos-cart-controls">
                      <div className="pos-qty">
                        <button type="button" onClick={() => updateQty(l.key, l.quantity - 1)}><Minus size={12} /></button>
                        <input
                          type="number"
                          min={1}
                          value={l.quantity}
                          onChange={(e) => updateQty(l.key, Number(e.target.value) || 1)}
                        />
                        <button type="button" onClick={() => updateQty(l.key, l.quantity + 1)}><Plus size={12} /></button>
                      </div>
                      <input
                        className="pos-input disc"
                        type="number"
                        min={0}
                        title="Item discount"
                        value={l.item_discount}
                        onChange={(e) =>
                          setCart((prev) =>
                            prev.map((x) =>
                              x.key === l.key ? { ...x, item_discount: Math.max(0, Number(e.target.value) || 0) } : x
                            )
                          )
                        }
                      />
                      <span className="pos-line-total">{money(l.price * l.quantity - l.item_discount)}</span>
                      <button type="button" className="pos-btn danger" style={{ padding: '0.35rem' }} onClick={() => updateQty(l.key, 0)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {l.quantity >= l.available_qty && <span className="pos-warn">Max stock reached</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pos-footer">
            <div className="pos-form-grid">
              <label>Bill discount
                <input className="pos-input" type="number" value={billDiscount} onChange={(e) => setBillDiscount(e.target.value)} />
              </label>
              <label>Coupon
                <input className="pos-input" type="number" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} />
              </label>
              <label>GST %
                <input className="pos-input" type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
              </label>
              <label>Charges
                <input className="pos-input" type="number" value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value)} />
              </label>
              <label>Round off
                <input className="pos-input" type="number" value={roundOff} onChange={(e) => setRoundOff(e.target.value)} />
              </label>
              <label>Received
                <input className="pos-input" type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} placeholder={String(totals.total)} />
              </label>
            </div>

            <div className="pos-totals">
              <div><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
              <div><span>Discount</span><span>{money(totals.discount + totals.coupon_discount)}</span></div>
              <div><span>GST</span><span>{money(totals.tax_amount)}</span></div>
              <div><span>Charges</span><span>{money(totals.additional_charges)}</span></div>
              <div className="grand"><span>Grand Total</span><span>{money(totals.total)}</span></div>
              <div><span>Change</span><span>{money(totals.change_amount)}</span></div>
              {totals.outstanding > 0 && <div><span>Outstanding</span><span>{money(totals.outstanding)}</span></div>}
            </div>

            <label className="pos-toggle">
              <input type="checkbox" checked={splitMode} onChange={(e) => setSplitMode(e.target.checked)} />
              Split payment
            </label>

            {!splitMode ? (
              <>
                <div className="pos-pay-methods">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={payMethod === m.id ? 'is-on' : ''}
                      disabled={m.id === 'credit' && !canEdit}
                      onClick={() => setPayMethod(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {(payMethod === 'upi' || payMethod === 'card') && (
                  <label className="pos-field">
                    Transaction reference
                    <input className="pos-input" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UTR / Auth code" />
                  </label>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gap: '0.45rem' }}>
                {splitPays.map((p, idx) => (
                  <div key={idx} className="pos-form-grid">
                    <label>
                      Method
                      <select
                        className="pos-input"
                        value={p.method}
                        onChange={(e) =>
                          setSplitPays((rows) => rows.map((r, i) => (i === idx ? { ...r, method: e.target.value } : r)))
                        }
                      >
                        {PAY_METHODS.map((m) => (
                          <option key={m.id} value={m.id} disabled={m.id === 'credit' && !canEdit}>{m.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Amount
                      <input
                        className="pos-input"
                        type="number"
                        value={p.amount}
                        onChange={(e) =>
                          setSplitPays((rows) => rows.map((r, i) => (i === idx ? { ...r, amount: e.target.value } : r)))
                        }
                      />
                    </label>
                    <label className="span-2">
                      Reference
                      <input
                        className="pos-input"
                        value={p.reference_no}
                        onChange={(e) =>
                          setSplitPays((rows) => rows.map((r, i) => (i === idx ? { ...r, reference_no: e.target.value } : r)))
                        }
                      />
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className="pos-btn"
                  onClick={() => setSplitPays((rows) => [...rows, { method: 'upi', amount: '', reference_no: '' }])}
                >
                  <Plus size={14} /> Add tender
                </button>
              </div>
            )}

            <label className="pos-field">
              Notes
              <input className="pos-input" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>

            <div className="pos-actions">
              <button type="button" className="pos-btn" onClick={holdBill}><Pause size={14} /> Hold</button>
              <button type="button" className="pos-btn danger" onClick={clearSale}><Trash2 size={14} /> Clear</button>
              <button
                type="button"
                className="pos-pay-btn"
                disabled={busy || !canCreate}
                onClick={() => checkout(true)}
              >
                <Printer size={15} />
                {busy ? 'Processing…' : 'Pay & Print'}
              </button>
            </div>
            {lastSale && (
              <button type="button" className="pos-btn ghost" onClick={shareWhatsApp}>
                <Share2 size={14} /> Share last invoice on WhatsApp
              </button>
            )}
          </div>
        </aside>
      </div>

      {holdsOpen &&
        createPortal(
          <div className={`pos-overlay ${holdsVisible ? 'is-open' : ''}`}>
            <div className="pos-backdrop" onClick={() => setHoldsOpen(false)} />
            <aside className={`pos-offcanvas ${holdsVisible ? 'is-open' : ''}`}>
              <button type="button" className="pos-oc-close" onClick={() => setHoldsOpen(false)}><X size={18} /></button>
              <div className="pos-oc-head">
                <h2>Held Bills</h2>
                <p>Resume a parked bill on this device</p>
              </div>
              <div className="pos-oc-body">
                {!holds.length ? (
                  <div className="pos-empty">No held bills</div>
                ) : (
                  holds.map((h) => (
                    <div key={h.id} className="pos-hold-row">
                      <div>
                        <strong>{h.cart.length} items · {money(h.cart.reduce((s, l) => s + l.price * l.quantity - l.item_discount, 0))}</strong>
                        <div style={{ color: '#627d98', fontSize: '0.78rem' }}>
                          {new Date(h.savedAt).toLocaleString()} · {h.walkIn ? 'Walk-in' : h.customer.name || h.customer.phone}
                        </div>
                      </div>
                      <button type="button" className="pos-chip is-on" onClick={() => resumeBill(h)}>
                        <Play size={14} /> Resume
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>,
          document.body
        )}

      {invOpen &&
        createPortal(
          <div className={`pos-overlay ${invVisible ? 'is-open' : ''}`}>
            <div className="pos-backdrop" onClick={() => setInvOpen(false)} />
            <aside className={`pos-offcanvas ${invVisible ? 'is-open' : ''}`}>
              <button type="button" className="pos-oc-close" onClick={() => setInvOpen(false)}><X size={18} /></button>
              <div className="pos-oc-head">
                <h2>Recent Invoices</h2>
                <p>POS and billing invoices</p>
              </div>
              <div className="pos-oc-body">
                <label className="pos-inv-search">
                  <Search size={15} />
                  <input
                    value={invQuery}
                    onChange={(e) => setInvQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        loadInvoices(invQuery);
                      }
                    }}
                    placeholder="Search invoice no / customer"
                  />
                  <button
                    type="button"
                    className="pos-inv-btn"
                    title="Search"
                    onClick={() => loadInvoices(invQuery)}
                  >
                    <RefreshCw size={14} />
                  </button>
                </label>
                {!invoices.length ? (
                  <div className="pos-empty">{invQuery.trim() ? 'No invoices match your search' : 'No invoices yet'}</div>
                ) : (
                  invoices.slice(0, 40).map((inv) => (
                    <div key={String(invoiceKey(inv))} className="pos-inv-row">
                      <div>
                        <strong>{inv.invoice_no}</strong>
                        <div style={{ color: '#627d98', fontSize: '0.78rem' }}>
                          {inv.customer_name} · {inv.status}
                        </div>
                      </div>
                      <div className="pos-inv-actions">
                        <strong>{money(inv.total)}</strong>
                        <button
                          type="button"
                          className="pos-inv-btn"
                          title="Download invoice"
                          disabled={invoiceBusyId === Number(inv.billingID || inv.id)}
                          onClick={() => exportInvoice(inv, 'download')}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          className="pos-inv-btn"
                          title="Print invoice"
                          disabled={invoiceBusyId === Number(inv.billingID || inv.id)}
                          onClick={() => exportInvoice(inv, 'print')}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
