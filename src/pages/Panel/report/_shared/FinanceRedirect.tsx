import { Navigate, useParams } from 'react-router-dom';

/** Legacy /panel/finance/:type → /panel/reports/:type */
export default function FinanceRedirect() {
  const { type } = useParams();
  const map: Record<string, string> = {
    accounts: 'finance',
  };
  const next = map[String(type || '').toLowerCase()] || type || 'finance';
  return <Navigate to={`/panel/reports/${next}`} replace />;
}
