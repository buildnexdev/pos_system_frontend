/**
 * Author: Nandhakumar
 * Version: 0.0.3
 * Desc: Invoice (A4) + Bill (thermal) HTML builders for print/download/preview
 * Edit Date: 2026-11-20
 */

export type ReceiptCompany = {
  name?: string | null;
  location?: string | null;
  address?: string | null;
  phone?: string | null;
  gstin?: string | null;
};

export type ReceiptItem = {
  product_name: string;
  color?: string;
  size?: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  price: number;
  item_discount?: number;
  tax_percent?: number;
  description?: string;
};

export type ReceiptPayload = {
  company?: ReceiptCompany;
  invoiceNo?: string;
  orderNo?: string;
  date?: string | Date | null;
  dueDate?: string | Date | null;
  terms?: string;
  paymentMode?: string;
  billToName?: string;
  billToPhone?: string;
  billToLocation?: string;
  billToAddress?: string;
  shipToName?: string;
  shipToPhone?: string;
  shipToLocation?: string;
  shipToAddress?: string;
  items: ReceiptItem[];
  subtotal?: number;
  taxTotal?: number;
  taxPercent?: number;
  discount?: number;
  charges?: number;
  roundOff?: number;
  grandTotal?: number;
  amountReceived?: number;
  changeAmount?: number;
  balanceDue?: number;
  notes?: string;
  termsText?: string;
  payments?: Array<{ method?: string; amount?: number; reference_no?: string }>;
  autoPrint?: boolean;
};

function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function money(value: unknown) {
  const n = Number(value || 0);
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function moneyPlain(value: unknown) {
  const n = Number(value || 0);
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qtyFmt(value: unknown) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value?: string | Date | null) {
  const d = !value
    ? new Date()
    : value instanceof Date
      ? value
      : new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value || '');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function itemTitle(item: ReceiptItem) {
  return item.product_name || 'Item';
}

function itemDescription(item: ReceiptItem) {
  if (item.description) return item.description;
  const bits = [item.color, item.size, item.sku].filter(Boolean);
  return bits.length ? bits.join(' · ') : '';
}

function lineAmount(item: ReceiptItem) {
  const qty = Number(item.quantity || 0);
  const price = Number(item.price || 0);
  const disc = Number(item.item_discount || 0);
  return Math.max(0, price * qty - disc);
}

function partyBlock(name: string, address: string, phone?: string) {
  const lines = [name, address, phone ? `Ph: ${phone}` : ''].filter(Boolean);
  return lines.map((l) => `<div>${esc(l)}</div>`).join('');
}

export function buildReceiptHtml(payload: ReceiptPayload) {
  const companyName = payload.company?.name || 'BuildNex ShopOS';
  const companyAddress = [
    payload.company?.address,
    payload.company?.location,
    payload.company?.phone ? `Ph: ${payload.company.phone}` : '',
    payload.company?.gstin ? `GSTIN: ${payload.company.gstin}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const invoiceNo = payload.invoiceNo || '—';
  const invoiceDate = formatDate(payload.date);
  const dueDate = formatDate(payload.dueDate || payload.date);
  const terms = payload.terms || 'Due on Receipt';
  const mode = String(payload.paymentMode || 'Cash').toUpperCase();

  const billName = payload.billToName || 'Walk-in Customer';
  const billAddress =
    [payload.billToAddress, payload.billToLocation].filter(Boolean).join(', ') || '—';
  const shipName = payload.shipToName || billName;
  const shipAddress =
    [payload.shipToAddress || payload.billToAddress, payload.shipToLocation || payload.billToLocation]
      .filter(Boolean)
      .join(', ') || billAddress;

  const items = payload.items || [];
  let computedSub = 0;
  let taxPctHint = Number(payload.taxPercent);
  if (!Number.isFinite(taxPctHint)) taxPctHint = NaN;

  const itemRows = items
    .map((item, idx) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.price || 0);
      const amount = lineAmount(item);
      const desc = itemDescription(item);
      const taxPct = Number(item.tax_percent);
      if (!Number.isFinite(taxPctHint) && Number.isFinite(taxPct)) taxPctHint = taxPct;
      computedSub += amount;
      return `<tr>
        <td class="col-no">${idx + 1}</td>
        <td class="col-item">
          <div class="item-title">${esc(itemTitle(item))}</div>
          ${desc ? `<div class="item-desc">${esc(desc)}</div>` : ''}
        </td>
        <td class="col-qty num">${qtyFmt(qty)}</td>
        <td class="col-rate num">${money(rate)}</td>
        <td class="col-amt num">${moneyPlain(amount)}</td>
      </tr>`;
    })
    .join('');

  const subtotal = payload.subtotal != null ? Number(payload.subtotal) : computedSub;
  const taxTotal = payload.taxTotal != null ? Number(payload.taxTotal) : 0;
  const discount = Number(payload.discount || 0);
  const charges = Number(payload.charges || 0);
  const roundOff = Number(payload.roundOff || 0);
  const grand =
    payload.grandTotal != null
      ? Number(payload.grandTotal)
      : Number((subtotal - discount + taxTotal + charges + roundOff).toFixed(2));
  const received = Number(payload.amountReceived ?? grand);
  const balanceDue =
    payload.balanceDue != null
      ? Number(payload.balanceDue)
      : Math.max(0, Number((grand - received).toFixed(2)));

  let taxRateDisplay = Number.isFinite(taxPctHint) ? taxPctHint : 0;
  if ((!taxRateDisplay || taxRateDisplay <= 0) && subtotal > 0 && taxTotal > 0) {
    taxRateDisplay = Number(((taxTotal / subtotal) * 100).toFixed(2));
  }

  const notes = payload.notes || 'Thanks for shopping with us.';
  const termsText =
    payload.termsText ||
    'Please make payments within the due date. Late payments may attract additional charges as per store policy.';

  const pays = (payload.payments || [])
    .map(
      (p) =>
        `<div class="pay-line"><span>${esc(String(p.method || '').toUpperCase())}${
          p.reference_no ? ` · ${esc(p.reference_no)}` : ''
        }</span><span>${money(p.amount)}</span></div>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(invoiceNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #e8eef5;
      color: #1a1a1a;
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.45;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      margin: 16px auto;
      padding: 28px 32px 36px;
      background: #fff;
      overflow: hidden;
      box-shadow: 0 8px 28px rgba(15, 40, 80, 0.12);
    }
    .accent-tr, .accent-bl {
      position: absolute;
      width: 0;
      height: 0;
      z-index: 0;
      pointer-events: none;
    }
    .accent-tr {
      top: 0; right: 0;
      border-top: 56px solid #1e3a8a;
      border-left: 56px solid transparent;
    }
    .accent-tr::after {
      content: "";
      position: absolute;
      top: -56px; right: 0;
      border-top: 34px solid #38bdf8;
      border-left: 34px solid transparent;
    }
    .accent-bl {
      bottom: 0; left: 0;
      border-bottom: 56px solid #1e3a8a;
      border-right: 56px solid transparent;
    }
    .accent-bl::after {
      content: "";
      position: absolute;
      bottom: -56px; left: 0;
      border-bottom: 34px solid #38bdf8;
      border-right: 34px solid transparent;
    }
    .content { position: relative; z-index: 1; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 22px;
      padding-right: 48px;
    }
    .company-name {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 800;
      color: #111827;
    }
    .company-addr {
      margin: 0;
      max-width: 340px;
      color: #4b5563;
      font-size: 12.5px;
    }
    .invoice-title {
      margin: 4px 0 0;
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #1e3a8a;
      line-height: 1;
    }
    .meta {
      width: 320px;
      margin-bottom: 18px;
      border-collapse: collapse;
    }
    .meta td {
      padding: 3px 0;
      vertical-align: top;
      font-size: 13px;
    }
    .meta .label {
      width: 118px;
      font-weight: 700;
      color: #111827;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border: 1px solid #c9d3e0;
      margin-bottom: 18px;
    }
    .party { min-height: 88px; }
    .party + .party { border-left: 1px solid #c9d3e0; }
    .party-head {
      background: #eef2f7;
      color: #374151;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 10px;
      border-bottom: 1px solid #c9d3e0;
    }
    .party-body {
      padding: 10px;
      color: #1f2937;
      font-size: 12.5px;
    }
    .party-body div + div { margin-top: 2px; }
    .items {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #1e3a8a;
      margin-bottom: 0;
    }
    .items thead th {
      background: #1e3a8a;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      text-align: left;
      padding: 9px 10px;
    }
    .items thead th.num,
    .items td.num { text-align: right; }
    .items tbody td {
      border-top: 1px solid #dbe3ef;
      padding: 10px;
      vertical-align: top;
      font-size: 12.5px;
    }
    .col-no { width: 40px; }
    .col-qty { width: 70px; }
    .col-rate { width: 110px; }
    .col-amt { width: 110px; }
    .item-title { font-weight: 700; color: #111827; }
    .item-desc { margin-top: 2px; color: #6b7280; font-size: 12px; }
    .below {
      display: grid;
      grid-template-columns: 1.2fr 0.9fr;
      gap: 20px;
      margin-top: 14px;
      align-items: start;
    }
    .notes-block .thanks {
      margin: 0 0 14px;
      font-weight: 600;
      color: #111827;
    }
    .notes-block .terms-title {
      margin: 0 0 4px;
      font-weight: 800;
      font-size: 12.5px;
    }
    .notes-block .terms-text {
      margin: 0;
      color: #4b5563;
      font-size: 12px;
      max-width: 360px;
    }
    .pay {
      margin-top: 14px;
      font-size: 12px;
    }
    .pay-title { font-weight: 700; margin-bottom: 4px; }
    .pay-line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      max-width: 280px;
    }
    .summary { width: 100%; }
    .subtotal-row {
      display: flex;
      justify-content: flex-end;
      gap: 28px;
      padding: 6px 10px 10px;
      font-weight: 600;
      border-bottom: 1px solid #d1d5db;
      margin-bottom: 0;
    }
    .summary-box {
      background: #bfd5ff;
      border: 1px solid #9db8ef;
      padding: 10px 12px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 5px 0;
      font-size: 13px;
    }
    .sum-row.strong {
      font-weight: 800;
      font-size: 14px;
    }
    .extra-rows {
      margin: 6px 0 0;
      font-size: 12px;
      color: #374151;
    }
    .extra-rows .sum-row { padding: 2px 0; }
    .order-meta {
      margin: 0 0 10px;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      @page { size: A4; margin: 10mm; }
      body { background: #fff; }
      .page {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="accent-tr"></div>
    <div class="accent-bl"></div>
    <div class="content">
      <div class="header">
        <div>
          <h1 class="company-name">${esc(companyName)}</h1>
          ${companyAddress ? `<p class="company-addr">${esc(companyAddress)}</p>` : ''}
        </div>
        <div class="invoice-title">INVOICE</div>
      </div>

      <table class="meta">
        <tr><td class="label">Invoice#</td><td>: ${esc(invoiceNo)}</td></tr>
        <tr><td class="label">Invoice Date</td><td>: ${esc(invoiceDate)}</td></tr>
        <tr><td class="label">Terms</td><td>: ${esc(terms)}</td></tr>
        <tr><td class="label">Due Date</td><td>: ${esc(dueDate)}</td></tr>
        ${
          payload.orderNo
            ? `<tr><td class="label">Order No</td><td>: ${esc(payload.orderNo)}</td></tr>`
            : ''
        }
        <tr><td class="label">Mode</td><td>: ${esc(mode)}</td></tr>
      </table>

      <div class="parties">
        <div class="party">
          <div class="party-head">Bill To</div>
          <div class="party-body">${partyBlock(billName, billAddress, payload.billToPhone)}</div>
        </div>
        <div class="party">
          <div class="party-head">Ship To</div>
          <div class="party-body">${partyBlock(
            shipName,
            shipAddress,
            payload.shipToPhone || payload.billToPhone
          )}</div>
        </div>
      </div>

      <table class="items">
        <thead>
          <tr>
            <th class="col-no">#</th>
            <th>Item &amp; Description</th>
            <th class="col-qty num">Qty</th>
            <th class="col-rate num">Rate</th>
            <th class="col-amt num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows || '<tr><td colspan="5">No items</td></tr>'}
        </tbody>
      </table>

      <div class="below">
        <div class="notes-block">
          <p class="thanks">${esc(notes)}</p>
          <p class="terms-title">Terms &amp; Conditions</p>
          <p class="terms-text">${esc(termsText)}</p>
          ${
            pays
              ? `<div class="pay"><div class="pay-title">Payments</div>${pays}</div>`
              : ''
          }
        </div>
        <div class="summary">
          <div class="subtotal-row"><span>Sub Total</span><span>${money(subtotal)}</span></div>
          ${
            discount > 0 || charges > 0 || roundOff !== 0
              ? `<div class="extra-rows">
                  ${discount > 0 ? `<div class="sum-row"><span>Discount</span><span>- ${money(discount)}</span></div>` : ''}
                  ${charges > 0 ? `<div class="sum-row"><span>Charges</span><span>${money(charges)}</span></div>` : ''}
                  ${roundOff !== 0 ? `<div class="sum-row"><span>Round off</span><span>${money(roundOff)}</span></div>` : ''}
                </div>`
              : ''
          }
          <div class="summary-box">
            <div class="sum-row"><span>Tax Rate</span><span>${taxRateDisplay.toFixed(2)}%</span></div>
            <div class="sum-row strong"><span>Total</span><span>${money(grand)}</span></div>
            <div class="sum-row strong"><span>Balance Due</span><span>${money(balanceDue > 0 ? balanceDue : grand)}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  ${payload.autoPrint ? '<script>window.onload=function(){window.print();}</script>' : ''}
</body>
</html>`;
}

/** Professional A4 invoice (alias of buildReceiptHtml). */
export function buildInvoiceHtml(payload: ReceiptPayload) {
  return buildReceiptHtml(payload);
}

/** Thermal / POS-style bill receipt. */
export function buildBillHtml(payload: ReceiptPayload) {
  const companyName = payload.company?.name || 'BuildNex ShopOS';
  const companyLocation = payload.company?.location || payload.company?.address || '';
  const invoiceNo = payload.invoiceNo || '—';
  const orderNo = payload.orderNo || 'NA';
  const mode = String(payload.paymentMode || 'Cash').toUpperCase();
  const billTo = payload.billToName || 'Walk-in Customer';
  const location = payload.billToLocation || '—';
  const address = [payload.billToAddress, payload.billToPhone].filter(Boolean).join(' · ') || '—';

  const items = payload.items || [];
  let computedSub = 0;
  const itemRows = items
    .map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.price || 0);
      const amount = lineAmount(item);
      const taxPct = Number(item.tax_percent);
      const taxLine = Number.isFinite(taxPct) ? taxPct : 0;
      computedSub += amount;
      return `
        <tr class="item">
          <td colspan="4">
            <div class="item-name">${esc(itemTitle(item))}</div>
            <div class="item-tax">Tax ${taxLine.toFixed(2)}%</div>
          </td>
        </tr>
        <tr class="item-vals">
          <td></td>
          <td class="num">${qtyFmt(qty)}</td>
          <td class="num">${money(rate)}</td>
          <td class="num">${money(amount)}</td>
        </tr>
        <tr class="rule"><td colspan="4"><div class="dash"></div></td></tr>`;
    })
    .join('');

  const subtotal = payload.subtotal != null ? Number(payload.subtotal) : computedSub;
  const taxTotal = payload.taxTotal != null ? Number(payload.taxTotal) : 0;
  const discount = Number(payload.discount || 0);
  const charges = Number(payload.charges || 0);
  const roundOff = Number(payload.roundOff || 0);
  const grand =
    payload.grandTotal != null
      ? Number(payload.grandTotal)
      : Number((subtotal - discount + taxTotal + charges + roundOff).toFixed(2));

  const pays = (payload.payments || [])
    .map(
      (p) =>
        `<div class="pay-line"><span>${esc(String(p.method || '').toUpperCase())}${
          p.reference_no ? ` · ${esc(p.reference_no)}` : ''
        }</span><span>${money(p.amount)}</span></div>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(invoiceNo)} · Bill</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px 12px 28px;
      background: #fff;
      color: #111;
      font-family: "Courier New", Courier, monospace;
      font-size: 12.5px;
      line-height: 1.35;
    }
    .sheet { width: min(420px, 100%); margin: 0 auto; }
    .center { text-align: center; }
    .shop-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin: 0 0 4px;
    }
    .shop-loc { margin: 0 0 10px; font-size: 12px; }
    .dash { border-top: 1px dashed #222; margin: 8px 0; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px 12px;
      margin: 2px 0 4px;
    }
    .meta div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta .right { text-align: right; }
    .billto { margin: 4px 0; }
    .billto div { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead th {
      font-weight: 700;
      padding: 2px 0 6px;
      text-align: left;
      font-size: 12px;
    }
    thead th.num, td.num { text-align: right; }
    thead th:nth-child(2) { width: 14%; }
    thead th:nth-child(3) { width: 22%; }
    thead th:nth-child(4) { width: 24%; }
    .item-name { font-weight: 700; }
    .item-tax { font-size: 11px; opacity: 0.85; margin-top: 1px; }
    .item-vals td { padding: 2px 0 4px; }
    .rule td { padding: 0; }
    .totals { margin-top: 4px; }
    .tot-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin: 3px 0;
    }
    .grand { font-size: 15px; font-weight: 800; margin-top: 6px; }
    .pay { margin-top: 8px; }
    .pay-title { font-weight: 700; margin-bottom: 2px; }
    .pay-line { display: flex; justify-content: space-between; gap: 10px; }
    .footer { margin-top: 14px; text-align: center; }
    .footer .thanks { font-weight: 700; margin-bottom: 4px; }
    .footer .note { font-size: 11px; opacity: 0.8; }
    @media print {
      @page { size: 80mm auto; margin: 4mm; }
      body { padding: 0; }
      .sheet { width: 72mm; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="center">
      <h1 class="shop-name">${esc(companyName)}</h1>
      ${companyLocation ? `<p class="shop-loc">${esc(companyLocation)}</p>` : ''}
    </div>
    <div class="dash"></div>
    <div class="meta">
      <div>Invoice No: ${esc(invoiceNo)}</div>
      <div class="right">Date: ${esc(formatDate(payload.date))}</div>
      <div>Order No: ${esc(orderNo)}</div>
      <div class="right">Mode: ${esc(mode)}</div>
    </div>
    <div class="dash"></div>
    <div class="billto">
      <div>Bill To: ${esc(billTo)}</div>
      <div>Location: ${esc(location)}</div>
      <div>Address: ${esc(address)}</div>
    </div>
    <div class="dash"></div>
    <table>
      <thead>
        <tr>
          <th>ITEM</th>
          <th class="num">QTY</th>
          <th class="num">RATE</th>
          <th class="num">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows || '<tr><td colspan="4">No items</td></tr>'}
      </tbody>
    </table>
    <div class="totals">
      <div class="tot-row"><span>Sub Total</span><span>${money(subtotal)}</span></div>
      ${discount > 0 ? `<div class="tot-row"><span>Discount</span><span>- ${money(discount)}</span></div>` : ''}
      <div class="tot-row"><span>Tax Total</span><span>${money(taxTotal)}</span></div>
      ${charges > 0 ? `<div class="tot-row"><span>Charges</span><span>${money(charges)}</span></div>` : ''}
      ${roundOff !== 0 ? `<div class="tot-row"><span>Round off</span><span>${money(roundOff)}</span></div>` : ''}
      <div class="dash"></div>
      <div class="tot-row grand"><span>Grand Total</span><span>${money(grand)}</span></div>
      <div class="dash"></div>
      ${
        payload.amountReceived != null
          ? `<div class="tot-row"><span>Received</span><span>${money(payload.amountReceived)}</span></div>`
          : ''
      }
      ${
        payload.changeAmount != null && Number(payload.changeAmount) > 0
          ? `<div class="tot-row"><span>Change</span><span>${money(payload.changeAmount)}</span></div>`
          : ''
      }
    </div>
    ${pays ? `<div class="pay"><div class="pay-title">Payments</div>${pays}</div>` : ''}
    <div class="footer">
      <div class="thanks">Thank you for your business.</div>
      <div class="note">This is a computer-generated receipt.</div>
    </div>
  </div>
  ${payload.autoPrint ? '<script>window.onload=function(){window.print();}</script>' : ''}
</body>
</html>`;
}

export function printReceiptHtml(html: string, size: 'invoice' | 'bill' = 'invoice') {
  const features = size === 'bill' ? 'width=480,height=720' : 'width=900,height=1100';
  const w = window.open('', '_blank', features);
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}

export function downloadReceiptHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
