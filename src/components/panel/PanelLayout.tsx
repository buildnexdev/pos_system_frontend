import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { REPORT_MENU_ITEMS, PANEL_MODULES, hasRight } from '../../utils/access';
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
      return hasRight(rights, user, m.key, 'view');
    });

    const canReport = hasRight(rights, user, 'report', 'view');
    const canFinance = hasRight(rights, user, 'finance', 'view');

    // Finance section removed — former finance links appear under Report
    const reportMenus =
      canReport || canFinance
        ? REPORT_MENU_ITEMS.filter((r) => {
            if (r.engine === 'finance') return canReport || canFinance;
            return canReport;
          }).map((r) => ({
            key: r.key,
            label: r.label,
            path: r.path,
            group: 'Report' as const,
          }))
        : [];

    return [...base, ...reportMenus];
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
