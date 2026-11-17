import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Menu,
  LogOut,
  HelpCircle,
  UserRound,
  KeyRound,
  ChevronDown,
  Package,
  ShoppingCart,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { RootState } from '../../redux/store';
import { logoutRequest } from '../../redux/auth/auth.action';
import { COMPANY_LOGO, COMPANY_NAME, COMPANY_TAGLINE, COMPANY_SUPPORT_EMAIL } from '../../utils/brand';
import { dashboardServices } from '../../redux/dashboard/dashboard.services';
import { stockServices } from '../../redux/stock/stock.services';

type NotifItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  kind: 'stock' | 'order';
};

function formatClock(d: Date) {
  const date = d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit', 
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${date} · ${time}`;
}

export default function DefaultHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSelector((s: RootState) => s.auth);

  const [now, setNow] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const clock = formatClock(now);
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const items: NotifItem[] = [];
      const [dash, stock] = await Promise.allSettled([
        dashboardServices.list(),
        stockServices.lowAlerts({ limit: 8 }),
      ]);

      if (stock.status === 'fulfilled') {
        const list = (stock.value as any[]) || [];
        list.slice(0, 6).forEach((p: any) => {
          items.push({
            id: `stock-${p.id}`,
            title: 'Low stock alert',
            detail: `${p.name || 'Product'} · qty ${p.stock ?? p.quantity ?? 0}`,
            href: '/panel/stock',
            kind: 'stock',
          });
        });
      }

      if (dash.status === 'fulfilled') {
        const orders = (dash.value as any)?.recentOrders || [];
        orders.slice(0, 4).forEach((o: any) => {
          items.push({
            id: `order-${o.id}`,
            title: 'Recent order',
            detail: `${o.order_number || `#${o.id}`} · ${o.customer_name || 'Customer'} · ₹${Number(o.total || 0).toFixed(0)}`,
            href: '/panel/orders',
            kind: 'order',
          });
        });
      }

      setNotifs(items);
      setUnread(items.length);
    } catch {
      setNotifs([]);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const t = window.setInterval(loadNotifications, 60_000);
    return () => window.clearInterval(t);
  }, []);

  const logout = () => {
    setProfileOpen(false);
    dispatch(logoutRequest());
    navigate('/login', { replace: true });
  };

  const openHelp = () => {
    window.open(
      `mailto:${COMPANY_SUPPORT_EMAIL}?subject=${encodeURIComponent(`${COMPANY_NAME} Panel Support`)}`,
      '_blank'
    );
  };

  return (
    <header className="panel-header">
      <div className="panel-header-left">
        <button type="button" className="panel-icon-btn md-only-hide" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>

        <Link to="/panel" className="panel-brand-block" title={COMPANY_NAME}>
          <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="panel-brand-logo" />
          <div className="panel-brand-text">
            <strong>{COMPANY_NAME}</strong>
            <span>{COMPANY_TAGLINE}</span>
          </div>
        </Link>
      </div>

      <div className="panel-header-center">
        <div className="panel-clock" aria-live="polite">
          {clock}
        </div>
      </div>

      <div className="panel-header-right">
        {loading && (
          <span className="panel-header-loading" title="Loading…">
            <Loader2 size={16} className="panel-spin" />
            <span>Loading</span>
          </span>
        )}

        <div className="panel-dropdown" ref={notifRef}>
          <button
            type="button"
            className={`panel-icon-btn ${notifOpen ? 'is-active' : ''}`}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => {
              setProfileOpen(false);
              setNotifOpen((v) => !v);
              if (!notifOpen) loadNotifications();
            }}
          >
            <Bell size={18} />
            {unread > 0 && <em className="panel-badge">{unread > 9 ? '9+' : unread}</em>}
          </button>

          {notifOpen && (
            <div className="panel-menu panel-menu-notif" role="menu">
              <div className="panel-menu-head">
                <strong>Notifications</strong>
                <button
                  type="button"
                  className="panel-menu-linkish"
                  onClick={() => {
                    setUnread(0);
                    setNotifs([]);
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="panel-menu-body">
                {notifLoading && (
                  <div className="panel-menu-empty">
                    <Loader2 size={16} className="panel-spin" /> Loading alerts…
                  </div>
                )}
                {!notifLoading && notifs.length === 0 && (
                  <div className="panel-menu-empty">No new notifications</div>
                )}
                {!notifLoading &&
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="panel-menu-item"
                      onClick={() => {
                        setNotifOpen(false);
                        setUnread((c) => Math.max(0, c - 1));
                        navigate(n.href);
                      }}
                    >
                      <span className={`panel-menu-icon is-${n.kind}`}>
                        {n.kind === 'stock' ? <Package size={15} /> : <ShoppingCart size={15} />}
                      </span>
                      <span>
                        <strong>{n.title}</strong>
                        <small>{n.detail}</small>
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="panel-icon-btn"
          aria-label="Help and support"
          title="Help & Support"
          onClick={openHelp}
        >
          <HelpCircle size={18} />
        </button>

        <div className="panel-dropdown" ref={profileRef}>
          <button
            type="button"
            className={`panel-user-chip is-button ${profileOpen ? 'is-open' : ''}`}
            aria-expanded={profileOpen}
            onClick={() => {
              setNotifOpen(false);
              setProfileOpen((v) => !v);
            }}
          >
            <div className="panel-user-avatar">{initials}</div>
            <div className="panel-user-meta">
              <strong>{user?.name || 'User'}</strong>
              <span className="capitalize">{user?.role || 'staff'}</span>
            </div>
            <ChevronDown size={14} className="panel-user-chevron" />
          </button>

          {profileOpen && (
            <div className="panel-menu panel-menu-profile" role="menu">
              <div className="panel-profile-card">
                <div className="panel-user-avatar lg">{initials}</div>
                <div>
                  <strong>{user?.name || 'User'}</strong>
                  <small>{user?.email || '—'}</small>
                  <span className="panel-role-pill capitalize">{user?.role || 'staff'}</span>
                </div>
              </div>
              <button
                type="button"
                className="panel-menu-item"
                onClick={() => {
                  setProfileOpen(false);
                  if (user?.id) navigate(`/panel/staff/${user.id}`);
                  else navigate('/panel');
                }}
              >
                <UserRound size={16} />
                <span>Profile</span>
              </button>
              <button
                type="button"
                className="panel-menu-item"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/change-password');
                }}
              >
                <KeyRound size={16} />
                <span>Change password</span>
              </button>
              <button type="button" className="panel-menu-item" onClick={openHelp}>
                <HelpCircle size={16} />
                <span>Help & Support</span>
                <ExternalLink size={13} className="panel-menu-ext" />
              </button>
              <button type="button" className="panel-menu-item is-danger" onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
