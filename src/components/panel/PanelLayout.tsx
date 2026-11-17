import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { FINANCE_MENU_ITEMS, REPORT_MENU_ITEMS, PANEL_MODULES, hasRight } from '../../utils/access';
import PanelAside from './PanelAside';
import DefaultHeader from './DefaultHeader';
import DefaultFooter from './DefaultFooter';
import './PanelLayout.scss';

export default function PanelLayout() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visible = (() => {
    const base = PANEL_MODULES.filter((m) => {
      if ('hideInMenu' in m && m.hideInMenu) return false;
      if (hasRight(rights, user, m.key, 'view')) return true;
      // Products catalog shares Stock/product rights until catalog ACL is assigned
      if (m.key === 'catalog' && hasRight(rights, user, 'product', 'view')) return true;
      return false;
    });

    const reportMenus = hasRight(rights, user, 'report', 'view')
      ? REPORT_MENU_ITEMS.map((r) => ({
          key: r.key,
          label: r.label,
          path: r.path,
          group: 'Report' as const,
        }))
      : [];

    const financeMenus = hasRight(rights, user, 'finance', 'view')
      ? FINANCE_MENU_ITEMS.map((r) => ({
          key: r.key,
          label: r.label,
          path: r.path,
          group: 'Finance' as const,
        }))
      : [];

    return [...base, ...reportMenus, ...financeMenus];
  })();

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className="panel-shell">
      <PanelAside
        items={visible}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="panel-main">
        <DefaultHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="panel-content">
          <Outlet />
        </main>
        <DefaultFooter />
      </div>
    </div>
  );
}
