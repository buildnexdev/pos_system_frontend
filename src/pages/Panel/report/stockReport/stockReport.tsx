/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: StockReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './stockReport.scss';

/** Thin route entry for stock report (shared view reads :type from URL). */
export default function StockReport() {
  return <ReportsView />;
}
