/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: DayReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './dayReport.scss';

/** Thin route entry for day report (shared view reads :type from URL). */
export default function DayReport() {
  return <ReportsView />;
}
