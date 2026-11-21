import type { ReportColumn } from './reportUi.types';

const MONEY_KEYS = new Set([
  'spent', 'total', 'amount', 'tax', 'tax_amount', 'revenue', 'avg_spend', 'avg_ticket',
  'subtotal', 'discount', 'coupon_discount', 'shipping_fee', 'round_off', 'amount_received',
  'change_amount', 'total_discount', 'refund_amount', 'gross_sales', 'net_revenue',
  'avg_order_value', 'total_discounts', 'income', 'expense', 'balance',
]);

const QTY_KEYS = new Set([
  'qty', 'item_qty', 'quantity', 'available_qty', 'reserved_qty', 'stock', 'orders', 'available',
]);

export function moneyInr(n: unknown) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function isMoneyKey(key: string) {
  return MONEY_KEYS.has(key) || key.endsWith('_amount') || key.endsWith('_total');
}

export function isQtyKey(key: string) {
  return QTY_KEYS.has(key);
}

export function formatReportCell(key: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (String(key).includes('created') || key === 'latest' || key === 'join_date' || key === 'paid_at' || key === 'entry_date') {
    if (key === 'entry_date') return String(value).slice(0, 10);
    const d = new Date(String(value));
    if (!Number.isNaN(d.getTime())) {
      return key === 'join_date' ? d.toLocaleDateString('en-IN') : d.toLocaleString('en-IN');
    }
  }
  if (isMoneyKey(key)) return moneyInr(value);
  if (key === 'is_active') return Number(value) ? 'Yes' : 'No';
  return String(value);
}

export function cellAlign(key: string, col?: ReportColumn): 'left' | 'right' | 'center' {
  if (col?.align) return col.align;
  if (isMoneyKey(key) || isQtyKey(key) || key === 'orders' || key === 'item_count') return 'right';
  if (key === 'sno' || key === 'is_active') return 'center';
  return 'left';
}

export function parseNumeric(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(String(value).replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function columnShouldTotal(col: ReportColumn): boolean {
  if (col.total === false) return false;
  if (col.total === true || col.money) return true;
  return isMoneyKey(col.key) || isQtyKey(col.key);
}

export function sumColumn(rows: any[], key: string): number {
  return rows.reduce((s, row) => {
    const n = parseNumeric(row?.[key]);
    return s + (n == null ? 0 : n);
  }, 0);
}

export function compareValues(a: unknown, b: unknown): number {
  const na = parseNumeric(a);
  const nb = parseNumeric(b);
  if (na != null && nb != null) return na - nb;
  const da = a != null ? new Date(String(a)).getTime() : NaN;
  const db = b != null ? new Date(String(b)).getTime() : NaN;
  if (!Number.isNaN(da) && !Number.isNaN(db) && String(a).length > 6 && String(b).length > 6) {
    return da - db;
  }
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base', numeric: true });
}

export function rowsToCsv(columns: ReportColumn[], rows: any[]) {
  const head = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => `"${String(formatReportCell(c.key, row[c.key])).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

export function downloadBlob(filename: string, content: string | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
