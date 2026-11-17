/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: ProductReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './productReport.scss';

/** Thin route entry for product report (shared view reads :type from URL). */
export default function ProductReport() {
  return <ReportsView />;
}
