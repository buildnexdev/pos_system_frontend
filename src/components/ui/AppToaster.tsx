/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: ShopOS dark accent-bar toast toaster
 * Edit Date: 2026-11-14
 */

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { Check, X, Info, Loader2 } from 'lucide-react';
import './AppToaster.scss';

const icon = (kind: 'success' | 'error' | 'loading' | 'info', node: ReactNode) => (
  <span className={`bnx-toast-icon is-${kind}`}>{node}</span>
);

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerClassName="bnx-toaster"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        className: 'bnx-toast',
        success: {
          className: 'bnx-toast bnx-toast-success',
          icon: icon('success', <Check size={15} strokeWidth={2.8} />),
          duration: 2600,
        },
        error: {
          className: 'bnx-toast bnx-toast-error',
          icon: icon('error', <X size={15} strokeWidth={2.8} />),
          duration: 4000,
        },
        loading: {
          className: 'bnx-toast bnx-toast-loading',
          icon: icon('loading', <Loader2 size={15} className="bnx-toast-spin" />),
        },
        blank: {
          className: 'bnx-toast bnx-toast-blank',
          icon: icon('info', <Info size={15} strokeWidth={2.5} />),
        },
      }}
    />
  );
}
