import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LifeBuoy,
  BookOpen,
  Ticket,
  PlusCircle,
  Mail,
  Phone,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { supportServices } from '../../../../redux/support/support.services';
import { Loader } from '../../../../components/ui/Loader';
import '../_shared/SupportPages.scss';

const CAT_ICONS: Record<string, React.ReactNode> = {
  'getting-started': <BookOpen size={16} />,
  'product-management': <BookOpen size={16} />,
  'inventory-management': <BookOpen size={16} />,
  'pos-billing': <Ticket size={16} />,
  'order-management': <Ticket size={16} />,
  'online-store': <LifeBuoy size={16} />,
  'payment-finance': <LifeBuoy size={16} />,
  'account-settings': <LifeBuoy size={16} />,
  faq: <LifeBuoy size={16} />,
};

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [activeCat, setActiveCat] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const load = async (query = q, category = activeCat) => {
    setLoading(true);
    try {
      const [cats, arts, set] = await Promise.all([
        supportServices.http.get('/panel/support/categories'),
        supportServices.http.get('/panel/support/articles', { params: { q: query || undefined, category: category || undefined } }),
        supportServices.http.get('/panel/support/settings'),
      ]);
      setCategories(cats.data.categories || []);
      setArticles(arts.data.articles || []);
      setSettings(set.data.settings || null);
    } catch {
      setCategories([]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openArticle = async (slug: string) => {
    try {
      const { data } = await supportServices.http.get(`/panel/support/articles/${slug}`);
      setSelected(data.article);
    } catch {
      setSelected(null);
    }
  };

  const filteredHint = useMemo(() => {
    if (activeCat) {
      const cat = categories.find((c) => c.slug === activeCat);
      return cat?.name || 'Category';
    }
    return 'All guides';
  }, [activeCat, categories]);

  return (
    <div className="sup-page">
      <section className="sup-hero">
        <div>
          <p className="sup-kicker">BuildNex ShopOS</p>
          <h1>Help & Support Center</h1>
          <p>Search guides, raise a support ticket, and track resolutions with BuildNex support.</p>
        </div>
        <div className="sup-actions">
          <Link to="/panel/support/tickets/new" className="sup-btn primary">
            <PlusCircle size={16} /> Create Ticket
          </Link>
          <Link to="/panel/support/tickets" className="sup-btn">
            <Ticket size={16} /> My Tickets
          </Link>
        </div>
      </section>

      <label className="sup-search">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') load(q, activeCat);
          }}
          placeholder="Search help articles…"
        />
        <button type="button" className="sup-btn" onClick={() => load(q, activeCat)}>
          Search
        </button>
      </label>

      {settings && (
        <div className="sup-contact">
          <div className="sup-contact-item">
            <span><Mail size={12} /> Support Email</span>
            <strong>{settings.support_email || '—'}</strong>
          </div>
          <div className="sup-contact-item">
            <span><Phone size={12} /> Phone</span>
            <strong>{settings.support_phone || '—'}</strong>
          </div>
          <div className="sup-contact-item">
            <span><MessageCircle size={12} /> WhatsApp</span>
            <strong>{settings.whatsapp_number || '—'}</strong>
          </div>
          <div className="sup-contact-item">
            <span><Clock size={12} /> Hours / Response</span>
            <strong>{settings.business_hours || '—'}</strong>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.75rem' }}>
              {settings.response_time_info}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="sup-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="sup-card"
                onClick={() => {
                  const next = activeCat === cat.slug ? '' : cat.slug;
                  setActiveCat(next);
                  setSelected(null);
                  load(q, next);
                }}
              >
                <div className="sup-card-icon">{CAT_ICONS[cat.slug] || <LifeBuoy size={16} />}</div>
                <h3>{cat.name}</h3>
                <p>{cat.article_count || 0} articles · click to filter</p>
              </button>
            ))}
          </div>

          <section className="sup-panel">
            <div className="sup-panel-head">
              <h2>{filteredHint}</h2>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{articles.length} results</span>
            </div>
            {selected ? (
              <article className="sup-article">
                <button type="button" className="sup-btn" onClick={() => setSelected(null)}>
                  Back to list
                </button>
                <h2 style={{ marginTop: '0.85rem' }}>{selected.title}</h2>
                <div className="meta">
                  {selected.category_name || 'Guide'} · updated{' '}
                  {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : '—'}
                </div>
                <div className="sup-article-body">{selected.body}</div>
              </article>
            ) : articles.length === 0 ? (
              <div className="sup-empty">No articles found. Try another search or create a ticket.</div>
            ) : (
              <div className="sup-table-wrap">
                <table className="sup-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Module</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a) => (
                      <tr key={a.id} onClick={() => openArticle(a.slug)}>
                        <td>
                          <strong>{a.title}</strong>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>{a.summary}</div>
                        </td>
                        <td>{a.category_name || '—'}</td>
                        <td>{a.module_key || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <div className="sup-actions">
        <button type="button" className="sup-btn primary" onClick={() => navigate('/panel/support/tickets/new')}>
          Still need help? Create a support ticket
        </button>
      </div>
    </div>
  );
}
