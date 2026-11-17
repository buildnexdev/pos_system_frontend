/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: WarehouseReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './warehouseReport.scss';

/** Thin route entry for warehouse report (shared view reads :type from URL). */
export default function WarehouseReport() {
  return <ReportsView />;
}
