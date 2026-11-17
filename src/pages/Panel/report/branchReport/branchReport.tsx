/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: BranchReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './branchReport.scss';

/** Thin route entry for branch report (shared view reads :type from URL). */
export default function BranchReport() {
  return <ReportsView />;
}
