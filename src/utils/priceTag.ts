/**
 * Author: Nandhakumar
 * Version: 0.0.2
 * Desc: Price tag HTML for print/download — uses login company brand when provided
 * Edit Date: 2026-11-14
 */

import JsBarcode from 'jsbarcode';
import { COMPANY_NAME, COMPANY_TAGLINE, companyLogoSrc } from './brand';

export { COMPANY_NAME, COMPANY_TAGLINE, companyLogoSrc };

export type PriceTagBrand = {
  name?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  tagline?: string | null;
};

export type PriceTagDocOpts = {
  autoPrint?: boolean;
  single?: boolean;
  brand?: PriceTagBrand;
};

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/i, '')
  .replace(/\/$/, '');

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Absolute URL for logos so print/download windows can load company uploads */
export function resolveMediaUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('/')) {
    const origin = API_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${origin}${path}`;
  }
  return path;
}

function formatWebsite(url?: string | null) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return raw.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function brandInitials(name: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'BN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function renderBarcodeSvg(value: string, opts?: { width?: number; height?: number; fontSize?: number }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    width: opts?.width ?? 1.7,
    height: opts?.height ?? 52,
    displayValue: true,
    fontSize: opts?.fontSize ?? 11,
    margin: 10,
    background: '#ffffff',
    lineColor: '#0f172a',
  });
  return svg;
}

function resolveVariantPrice(item: any, variant: any) {
  const mrp = Number(variant?.price ?? item?.price) || 0;
  const sale =
    item?.sale_price !== '' && item?.sale_price != null
      ? Number(item.sale_price) || mrp
      : mrp;
  const discount =
    mrp > 0 && sale < mrp ? Math.round(((mrp - sale) / mrp) * 100) : Number(variant?.discount) || 0;
  return { mrp, discount, sale: sale || mrp };
}

export function buildPriceTagRows(item: any, onlyVariant?: any) {
  if (onlyVariant) return [onlyVariant];
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  if (variants.length) return variants;
  return [
    {
      size: '—',
      color: '—',
      barcode: item.barcode || item.sku,
      stock_code: item.stock_code || item.sku,
      price: item.price,
    },
  ];
}

export function buildPriceTagDocument(item: any, rows: any[], opts?: PriceTagDocOpts) {
  const brandNameRaw =
    opts?.brand?.name || item?.companyName || item?.brand || COMPANY_NAME;
  const brand = escapeHtml(brandNameRaw);
  const tagline = escapeHtml(opts?.brand?.tagline || COMPANY_TAGLINE);
  const logo =
    resolveMediaUrl(opts?.brand?.logoUrl || item?.companyLogo) || companyLogoSrc();
  const website =
    formatWebsite(opts?.brand?.website || item?.companyWebsite) || 'www.buildnexshopos.com';
  const initials = escapeHtml(brandInitials(String(brandNameRaw)));
  const productName = escapeHtml(item.name || 'Product');

  const barcodeSvgs = rows.map((v: any) => {
    const code = String(v.barcode || v.stock_code || item.barcode || item.sku || '').trim();
    if (!code) return '';
    try {
      return renderBarcodeSvg(code, { width: 1.7, height: 52, fontSize: 11 }).outerHTML;
    } catch {
      return '';
    }
  });

  const cards = rows
    .map((v: any, i: number) => {
      const code = escapeHtml(v.barcode || v.stock_code || item.barcode || item.sku || '');
      const stockCode = escapeHtml(v.stock_code || v.barcode || item.sku || '');
      const { mrp, discount, sale } = resolveVariantPrice(item, v);
      const color = escapeHtml(v.color || '—');
      const size = escapeHtml(v.size || '—');
      return `<article class="tag">
          <header class="tag-brand">
            <div class="tag-brand-left">
              ${logo ? `<img class="tag-logo" src="${escapeHtml(logo)}" alt="${brand}" />` : `<span class="tag-logo-fallback">${initials}</span>`}
              <div>
                <p class="tag-company">${brand}</p>
                <p class="tag-tagline">${tagline}</p>
              </div>
            </div>
            <span class="tag-badge">PRICE TAG</span>
          </header>
          <div class="tag-body">
            <h1 class="tag-name">${productName}</h1>
            <p class="tag-meta">${color} · ${size} · ${stockCode}</p>
            <div class="tag-price-row">
              <p class="tag-price">₹${Number(sale).toFixed(0)}</p>
              ${
                discount > 0 && mrp > sale
                  ? `<div class="tag-price-side"><span class="tag-mrp">MRP ₹${Number(mrp).toFixed(0)}</span><span class="tag-off">${discount}% OFF</span></div>`
                  : mrp > sale
                    ? `<span class="tag-mrp">MRP ₹${Number(mrp).toFixed(0)}</span>`
                    : ''
              }
            </div>
            <div class="tag-barcode">${barcodeSvgs[i] || `<div class="tag-barcode-empty">No barcode</div>`}</div>
            <p class="tag-code">${code}</p>
          </div>
          <footer class="tag-foot">
            <span>${brand}</span>
            <span>${escapeHtml(website)}</span>
          </footer>
        </article>`;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${opts?.single ? 'Price Tag' : 'Price Tags'} · ${brand}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap');
    :root { --ink:#0f172a; --muted:#64748b; --line:#dbe3f0; --brand:#1d4ed8; --accent:#b45309; }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 18px; color: var(--ink);
      background: radial-gradient(circle at top left, rgba(29,78,216,0.08), transparent 34%), linear-gradient(180deg, #eef2f7 0%, #f8fafc 100%);
      font-family: Manrope, Arial, sans-serif;
    }
    .sheet {
      display: grid;
      grid-template-columns: ${opts?.single ? 'minmax(280px, 360px)' : 'repeat(auto-fill, minmax(280px, 1fr))'};
      gap: 16px;
      justify-content: ${opts?.single ? 'center' : 'stretch'};
    }
    .tag { background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; box-shadow:0 12px 28px rgba(15,23,42,0.08); break-inside:avoid; page-break-inside:avoid; }
    .tag-brand { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:linear-gradient(135deg,#0f172a,#1e3a8a); color:#fff; }
    .tag-brand-left { display:flex; align-items:center; gap:10px; min-width:0; }
    .tag-logo { width:38px; height:38px; border-radius:10px; object-fit:cover; background:#fff; padding:3px; flex-shrink:0; }
    .tag-logo-fallback { width:38px; height:38px; border-radius:10px; display:grid; place-items:center; background:#fff; color:var(--brand); font-weight:800; font-size:12px; flex-shrink:0; }
    .tag-company { margin:0; font-size:14px; font-weight:800; }
    .tag-tagline { margin:2px 0 0; font-size:10px; color:rgba(255,255,255,0.72); text-transform:uppercase; letter-spacing:0.08em; }
    .tag-badge { font-size:9px; font-weight:700; letter-spacing:0.08em; border:1px solid rgba(255,255,255,0.35); border-radius:999px; padding:4px 8px; white-space:nowrap; }
    .tag-body { padding:14px 14px 10px; }
    .tag-name { margin:0; font-size:16px; font-weight:800; line-height:1.25; }
    .tag-meta { margin:6px 0 0; font-size:12px; color:var(--muted); font-weight:600; }
    .tag-price-row { display:flex; align-items:flex-end; gap:10px; margin-top:12px; }
    .tag-price { margin:0; font-size:30px; font-weight:800; line-height:1; }
    .tag-price-side { display:grid; gap:2px; padding-bottom:2px; }
    .tag-mrp { font-size:12px; color:var(--muted); text-decoration:line-through; font-weight:600; }
    .tag-off { font-size:11px; font-weight:800; color:var(--accent); }
    .tag-barcode { margin-top:14px; padding:10px 8px 6px; border:1px dashed #c7d2fe; border-radius:12px; background:linear-gradient(180deg,#f8fbff,#fff); text-align:center; overflow:hidden; }
    .tag-barcode svg { max-width:100%; height:auto; display:inline-block; }
    .tag-barcode-empty { color:var(--muted); font-size:12px; padding:18px 0; }
    .tag-code { margin:8px 0 0; text-align:center; font-family:"IBM Plex Mono",monospace; font-size:12px; font-weight:500; color:#334155; letter-spacing:0.04em; }
    .tag-foot { display:flex; justify-content:space-between; gap:8px; padding:8px 14px 12px; font-size:10px; color:var(--muted); font-weight:600; border-top:1px solid #eef2f7; }
    @media print { body { background:#fff; padding:0; } .sheet { gap:10px; } .tag { box-shadow:none; } }
  </style>
</head>
<body>
  <div class="sheet">${cards}</div>
  ${opts?.autoPrint ? '<script>window.onload=function(){window.print();}</script>' : ''}
</body>
</html>`;
}

export function downloadPriceTagsHtml(
  item: any,
  rows: any[],
  fileBase?: string,
  brand?: PriceTagBrand
) {
  const html = buildPriceTagDocument(item, rows, { single: rows.length === 1, brand });
  const safeName = (fileBase || item.name || 'price-tags').replace(/[^\w\-]+/g, '_').slice(0, 80);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `price-tag-${safeName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printPriceTags(item: any, rows: any[], brand?: PriceTagBrand) {
  const html = buildPriceTagDocument(item, rows, {
    autoPrint: true,
    single: rows.length === 1,
    brand,
  });
  const win = window.open('', '_blank', 'width=920,height=740');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}
