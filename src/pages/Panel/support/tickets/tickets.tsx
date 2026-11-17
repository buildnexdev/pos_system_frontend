import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';
import { supportServices } from '../../../../redux/support/support.services';
import { RootState } from '../../../../redux/store';
import { Loader } from '../../../../components/ui/Loader';
import { isSuperAdminUser } from '../../../../utils/access';
import '../_shared/SupportPages.scss';

function statusLabel(s: string) {
  return String(s || '').replace(/_/g, ' ');
}

export default function SupportTicketsPage({ manage = false }: { manage?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s: RootState) => s.auth);
  const isManage = manage || location.pathname.includes('/manage');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [shop, setShop] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supportServices.http.get('/panel/support/tickets', {
        params: {
          q: q || undefined,
          status: status || undefined,
          priority: priority || undefined,
          shop: isManage && shop ? shop : undefined,
          scope: isManage && (isSuperAdminUser(user) || user?.role === 'admin') ? 'all' : 'mine',
          limit: 50,
        },
      });
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
    } catch {
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isManage]);

  return (
    <div className="sup-page">
      <section className="sup-hero">
        <div>
          <p className="sup-kicker">{isManage ? 'Super Admin' : 'Support'}</p>
          <h1>{isManage ? 'Support Ticket Management' : 'My Support Tickets'}</h1>
          <p>
            {isManage
              ? 'Search tenant tickets, assign staff, update priority/status, and resolve issues.'
              : 'Track your tickets, reply to support, and reopen resolved issues when needed.'}
          </p>
        </div>
        <div className="sup-actions">
          {!isManage && (
            <Link to="/panel/support/tickets/new" className="sup-btn primary">
              <PlusCircle size={16} /> Create Ticket
            </Link>
          )}
          <button type="button" className="sup-btn" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </section>

      <div className="sup-panel">
        <div className="sup-filters">
          <label className="sup-search" style={{ flex: 1, minWidth: 180 }}>
            <Search size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder={isManage ? 'Search ticket ID, subject, shop…' : 'Search tickets…'}
            />
          </label>
          {isManage && (
            <input
              className="sup-input"
              style={{ maxWidth: 180 }}
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="Shop name"
            />
          )}
          <select className="sup-select" style={{ maxWidth: 170 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <select className="sup-select" style={{ maxWidth: 150 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {['low', 'medium', 'high', 'critical'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button type="button" className="sup-btn primary" onClick={load}>Apply</button>
        </div>

        {loading ? (
          <div className="sup-empty"><Loader /></div>
        ) : tickets.length === 0 ? (
          <div className="sup-empty">No tickets found.</div>
        ) : (
          <div className="sup-table-wrap">
            <table className="sup-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  {isManage && <th>Shop</th>}
                  <th>Assigned</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/panel/support/tickets/${t.id}`)}>
                    <td><strong>{t.ticket_no}</strong></td>
                    <td>{t.subject}</td>
                    <td>{t.category}</td>
                    <td><span className={`sup-pill ${t.priority}`}>{t.priority}</span></td>
                    <td><span className={`sup-pill ${t.status}`}>{statusLabel(t.status)}</span></td>
                    {isManage && <td>{t.shop_name || '—'}</td>}
                    <td>{t.assigned_to_name || 'Unassigned'}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</td>
                    <td>{t.updated_at ? new Date(t.updated_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="sup-panel-head">
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{total} ticket(s)</span>
        </div>
      </div>
    </div>
  );
}
