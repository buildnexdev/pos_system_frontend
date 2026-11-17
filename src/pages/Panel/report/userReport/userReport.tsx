/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: UserReport panel page entry
 * Edit Date: 2026-11-13
 */
import ReportsView from '../_shared/ReportsView';
import './userReport.scss';

/** Thin route entry for users report (shared view reads :type from URL). */
export default function UserReport() {
  return <ReportsView />;
}
