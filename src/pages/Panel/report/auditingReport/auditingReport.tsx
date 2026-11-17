/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: AuditingReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './auditingReport.scss';

/** Thin route entry for auditing report (shared view reads :type from URL). */
export default function AuditingReport() {
  return <ReportsView />;
}
