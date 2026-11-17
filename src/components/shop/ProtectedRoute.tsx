import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { hasRight, isPanelUser, isSuperAdminUser, SUPER_ADMIN_MODULE_KEYS } from '../../utils/access';

export default function ProtectedRoute({
  children,
  panelOnly = false,
  moduleKey,
  action = 'view',
}: {
  children: React.ReactNode;
  panelOnly?: boolean;
  moduleKey?: string;
  action?: 'view' | 'create' | 'edit' | 'delete';
}) {
  const location = useLocation();
  const { isAuthenticated, user, rights } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (panelOnly && !isPanelUser(user)) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin may only open platform modules
  if (isSuperAdminUser(user) && moduleKey && !SUPER_ADMIN_MODULE_KEYS.has(moduleKey)) {
    return <Navigate to="/panel/companies" replace />;
  }

  // Super Admin–only pages — company admin / staff redirected away
  if (moduleKey && SUPER_ADMIN_MODULE_KEYS.has(moduleKey) && !isSuperAdminUser(user)) {
    return <Navigate to="/panel" replace />;
  }

  if (moduleKey && !hasRight(rights, user, moduleKey, action)) {
    if (isSuperAdminUser(user)) {
      return <Navigate to="/panel/companies" replace />;
    }
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-600">You do not have permission for this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
