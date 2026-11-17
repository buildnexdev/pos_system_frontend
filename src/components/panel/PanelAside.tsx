import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Layers,
  Tags,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Factory,
  Building2,
  Warehouse,
  BarChart3,
  Wallet,
  ChevronDown,
  ClipboardList,
  Boxes,
  CircleDollarSign,
  ShoppingBag,
  LifeBuoy,
  Ticket,
  PlusCircle,
  Settings,
  BookOpen,
  Folder,
  FolderOpen,
  FileText,
} from 'lucide-react';
import { COMPANY_LOGO, COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/brand';

const ICONS: Record<string, React.ReactNode> = {
  role: <Layers size={16} />,
  access_control: <ShieldCheck size={16} />,
  staff: <Users size={16} />,
  company: <Building2 size={16} />,
  payment_history: <CreditCard size={16} />,
  invoice_agreement: <FileText size={16} />,
  manage_ticket: <Ticket size={16} />,
  product_type: <Tags size={16} />,
  supplier: <Factory size={16} />,
  branch: <Building2 size={16} />,
  warehouse: <Warehouse size={16} />,
  catalog: <ShoppingBag size={16} />,
  product: <Package size={16} />,
  order: <ShoppingCart size={16} />,
  customer: <Users size={16} />,
  payment_gateway: <CreditCard size={16} />,
  billing: <CircleDollarSign size={16} />,
  dropshipping: <Truck size={16} />,
  report: <BarChart3 size={16} />,
  report_users: <Users size={16} />,
  report_sales: <ShoppingCart size={16} />,
  report_product: <ShoppingBag size={16} />,
  report_stock: <Package size={16} />,
  report_warehouse: <Warehouse size={16} />,
  report_branch: <Building2 size={16} />,
  report_billing: <CircleDollarSign size={16} />,
  report_day: <ClipboardList size={16} />,
  report_auditing: <ShieldCheck size={16} />,
  finance: <Wallet size={16} />,
  fin_accounts: <Wallet size={16} />,
  fin_bank: <Building2 size={16} />,
  fin_cash: <CircleDollarSign size={16} />,
  fin_ledger: <ClipboardList size={16} />,
  fin_journal: <Layers size={16} />,
  fin_daybook: <ClipboardList size={16} />,
  fin_expense: <Package size={16} />,
  fin_spent: <ShoppingCart size={16} />,
  fin_billing: <CircleDollarSign size={16} />,
  support: <LifeBuoy size={16} />,
  support_help: <BookOpen size={16} />,
  support_new: <PlusCircle size={16} />,
  support_tickets: <Ticket size={16} />,
  support_manage: <LifeBuoy size={16} />,
  support_settings: <Settings size={16} />,
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  'User Control': <ClipboardList size={16} />,
  Catalog: <Boxes size={16} />,
  Sales: <ShoppingCart size={16} />,
  Report: <BarChart3 size={16} />,
  Finance: <Wallet size={16} />,
  Support: <LifeBuoy size={16} />,
};

type ModuleItem = {
  key: string;
  label: string;
  path: string;
  group: string;
  hideInMenu?: boolean;
};

export default function PanelAside({
  items,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  items: ModuleItem[];
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const location = useLocation();

  const { topLinks, groups } = useMemo(() => {
    const top: ModuleItem[] = [];
    const grouped: Record<string, ModuleItem[]> = {};
    items.forEach((item) => {
      if (!item.group) {
        top.push(item);
        return;
      }
      if (!grouped[item.group]) grouped[item.group] = [];
      grouped[item.group].push(item);
    });
    return { topLinks: top, groups: grouped };
  }, [items]);

  const groupNames = Object.keys(groups);

  const activeGroup = useMemo(() => {
    const match = items.find((m) =>
      m.path === '/panel' ? location.pathname === '/panel' : location.pathname.startsWith(m.path)
    );
    return match?.group || '';
  }, [items, location.pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      groupNames.forEach((name) => {
        if (next[name] === undefined) next[name] = true;
      });
      if (activeGroup) next[activeGroup] = true;
      return next;
    });
  }, [groupNames.join('|'), activeGroup]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {mobileOpen && (
        <button type="button" className="panel-aside-backdrop" aria-label="Close menu" onClick={onCloseMobile} />
      )}

      <aside className={`panel-aside ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <Link
          to="/panel"
          className={`panel-aside-brand ${collapsed ? 'is-collapsed' : ''}`}
          onClick={onCloseMobile}
          title={COMPANY_NAME}
        >
          <span className="panel-aside-brand-mark" aria-hidden>
            <img src={COMPANY_LOGO} alt="" />
          </span>
          {!collapsed && (
            <span className="panel-aside-brand-text">
              <span className="panel-aside-brand-word">
                BuildNex <em>ShopOS</em>
              </span>
              <span className="panel-aside-brand-tag">{COMPANY_TAGLINE}</span>
            </span>
          )}
        </Link>

        <nav className="panel-aside-nav" aria-label="Panel modules">
          {topLinks.length > 0 && (
            <div className="panel-aside-group-items panel-aside-top-links">
              {topLinks.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === '/panel'}
                  title={item.label}
                  onClick={onCloseMobile}
                  className={({ isActive }) => `panel-aside-link panel-aside-file ${isActive ? 'is-active' : ''}`}
                >
                  <span className="panel-aside-icon panel-aside-file-icon">
                    {ICONS[item.key] || <FileText size={16} />}
                  </span>
                  {!collapsed && <span className="panel-aside-label">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          )}

          {Object.entries(groups).map(([group, links]) => {
            const isOpen = collapsed ? true : !!openGroups[group];
            const hasActive = links.some((item) =>
              item.path === '/panel' ? location.pathname === '/panel' : location.pathname.startsWith(item.path)
            );

            return (
              <div key={group} className={`panel-aside-group ${hasActive ? 'has-active' : ''} ${isOpen ? 'is-open' : ''}`}>
                {!collapsed && (
                  <button
                    type="button"
                    className={`panel-aside-group-toggle ${isOpen ? 'is-open' : ''}`}
                    onClick={() => toggleGroup(group)}
                    aria-expanded={isOpen}
                  >
                    <span className="panel-aside-group-left">
                      <span className="panel-aside-group-icon panel-aside-folder-icon">
                        {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
                      </span>
                      <span className="panel-aside-folder-name">{group}</span>
                    </span>
                    <span className="panel-aside-group-meta">
                      <span className="panel-aside-group-count">{links.length}</span>
                      <ChevronDown size={14} className="panel-aside-chevron" />
                    </span>
                  </button>
                )}

                {collapsed && (
                  <div className="panel-aside-group-collapsed-icon" title={group}>
                    {GROUP_ICONS[group] || <Folder size={16} />}
                  </div>
                )}

                {isOpen && (
                  <div className={`panel-aside-group-items ${collapsed ? '' : 'is-tree'}`}>
                    {links.map((item) => (
                      <NavLink
                        key={item.key}
                        to={item.path}
                        end={item.path === '/panel'}
                        title={item.label}
                        onClick={onCloseMobile}
                        className={({ isActive }) => `panel-aside-link panel-aside-file ${isActive ? 'is-active' : ''}`}
                      >
                        <span className="panel-aside-icon panel-aside-file-icon">
                          {ICONS[item.key] || <FileText size={16} />}
                        </span>
                        {!collapsed && <span className="panel-aside-label">{item.label}</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
