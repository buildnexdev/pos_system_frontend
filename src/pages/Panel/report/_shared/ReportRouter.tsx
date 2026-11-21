/**
 * Routes /panel/reports/:type to ReportsView or FinanceBooksView.
 */
import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getReportMenuItem,
  hasRight,
  isFinanceReportType,
  resolveFinanceViewType,
} from '../../../../utils/access';
import { RootState } from '../../../../redux/store';
import ReportsView from './ReportsView';
import FinanceBooksView from '../../finance/_shared/FinanceBooksView';

export default function ReportRouter() {
  const { type: typeParam } = useParams();
  const type = String(typeParam || 'sales').toLowerCase();
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const item = getReportMenuItem(type);
  const canReport = hasRight(rights, user, 'report', 'view');
  const canFinance = hasRight(rights, user, 'finance', 'view');
  const isFin = item?.engine === 'finance' || isFinanceReportType(type);

  if (!item && !isFinanceReportType(type)) {
    return <Navigate to="/panel/reports/sales" replace />;
  }

  if (isFin && !canReport && !canFinance) {
    return <Navigate to="/panel" replace />;
  }
  if (!isFin && !canReport) {
    return <Navigate to="/panel" replace />;
  }

  if (isFin) {
    return <FinanceBooksView forcedType={resolveFinanceViewType(type)} />;
  }

  return <ReportsView />;
}
