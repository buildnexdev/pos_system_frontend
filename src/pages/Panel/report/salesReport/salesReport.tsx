/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: SalesReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './salesReport.scss';

/** Thin route entry for sales report (shared view reads :type from URL). */
export default function SalesReport() {
  return <ReportsView />;
}
