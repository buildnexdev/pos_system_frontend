/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Generate and download CODE128 barcode PNG/SVG
 * Edit Date: 2026-11-14
 */

import JsBarcode from 'jsbarcode';

function renderBarcodeSvg(value: string, opts?: { width?: number; height?: number; fontSize?: number }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    width: opts?.width ?? 2,
    height: opts?.height ?? 70,
    displayValue: true,
    fontSize: opts?.fontSize ?? 14,
    margin: 10,
    background: '#ffffff',
    lineColor: '#0f172a',
  });
  return svg;
}

/** Download a single barcode as PNG (SVG fallback) */
export function downloadBarcodePng(code: string, fileBase = 'barcode'): Promise<void> {
  const value = String(code || '').trim();
  if (!value) return Promise.reject(new Error('Barcode value is empty'));

  return new Promise((resolve, reject) => {
    try {
      const svg = renderBarcodeSvg(value);
      const xml = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 480;
        canvas.height = img.height || 160;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileBase}.svg`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Could not export barcode'));
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${fileBase}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 'image/png');
      };
      img.onerror = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileBase}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Invalid barcode value'));
    }
  });
}

export function safeBarcodeFileName(parts: Array<string | undefined | null>) {
  return parts
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .join('-')
    .replace(/[^\w\-]+/g, '_')
    .slice(0, 80) || 'barcode';
}
