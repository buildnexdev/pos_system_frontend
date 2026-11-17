/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Full-screen spinner shown while any API request is in flight
 * Edit Date: 2026-11-14
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { subscribeGlobalLoading } from '../../utils/globalLoading';
import './GlobalLoadingOverlay.scss';

export default function GlobalLoadingOverlay() {
  const [active, setActive] = useState(false);

  useEffect(() => subscribeGlobalLoading((isActive) => setActive(isActive)), []);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div className="global-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="global-loading-card">
        <span className="global-loading-spinner" />
        <p>Please wait…</p>
      </div>
    </div>,
    document.body
  );
}
