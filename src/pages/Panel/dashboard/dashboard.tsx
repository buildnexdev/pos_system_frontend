import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Clock3,
  ArrowUpRight,
  Cake,
  CalendarHeart,
  Trophy,
  BellRing,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardServices } from '../../../redux/dashboard/dashboard.services';
import { Loader } from '../../../components/ui/Loader';
import './dashboard.scss';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#6366f1',
  packed: '#8b5cf6',
  shipped: '#0ea5e9',
  delivered: '#10b981',
  cancelled: '#ef4444',
  returned: '#f43f5e',
  in_stock: '#10b981',
  low_stock: '#f59e0b',
  out_of_stock: '#ef4444',
  reserved: '#6366f1',
  damaged: '#db2777',
};

const PIE_FALLBACK = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#14b8a6'];

type RevenueRange = '7d' | '4w' | '8w';

const REVENUE_FILTERS: { value: RevenueRange; label: string; hint: string }[] = [
  { value: '7d', label: 'Last 7 days', hint: 'Daily · paid/non-cancelled totals' },
  { value: '4w', label: 'Last 4 weeks', hint: 'Weekwise · Mon–Sun totals' },
  { value: '8w', label: 'Last 8 weeks', hint: 'Weekwise · Mon–Sun totals' },
];

function money(n: unknown) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function prettyStatus(value: string) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function daysLabel(days: number) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('7d');
  const [weekKey, setWeekKey] = useState<string>('all');

  useEffect(() => {
    dashboardServices
      .list()
      .then((res) => setData(res))
      .catch((e: any) => setError(e?.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentOrders = data?.recentOrders || [];
  const lowStock = data?.lowStock || [];
  const notifications = data?.notifications || {};
  const stockAlerts = notifications.stockAlerts || lowStock || [];
  const topStocks = notifications.topStocks || [];
  const birthdays = notifications.birthdays || [];
  const festivals = notifications.festivals || [];

  const weekOptions = useMemo(
    () =>
      (charts.revenueByWeek || []).map((row: any) => ({
        value: String(row.week_key || row.week_start || ''),
        label: String(row.label || row.week || ''),
      })),
    [charts.revenueByWeek]
  );

  useEffect(() => {
    if (revenueRange === '7d') setWeekKey('all');
  }, [revenueRange]);

  const revenueMeta = REVENUE_FILTERS.find((f) => f.value === revenueRange) || REVENUE_FILTERS[0];

  const revenueSeries = useMemo(() => {
    if (revenueRange === '7d') {
      return (charts.revenueByDay || []).map((row: any) => ({
        label: row.label || row.day,
        revenue: Number(row.revenue) || 0,
        orders: Number(row.orders) || 0,
      }));
    }

    const weeks = (charts.revenueByWeek || []).map((row: any) => ({
      label: row.label || row.week,
      week_key: String(row.week_key || row.week_start || ''),
      revenue: Number(row.revenue) || 0,
      orders: Number(row.orders) || 0,
    }));

    const sliced = revenueRange === '4w' ? weeks.slice(-4) : weeks;
    if (weekKey !== 'all') {
      return sliced.filter((row: { week_key: string }) => row.week_key === weekKey);
    }
    return sliced;
  }, [charts.revenueByDay, charts.revenueByWeek, revenueRange, weekKey]);

  const orderStatusSeries = useMemo(
    () =>
      (charts.ordersByStatus || []).map((row: any, i: number) => ({
        name: prettyStatus(row.name),
        value: Number(row.value) || 0,
        color: STATUS_COLORS[row.name] || PIE_FALLBACK[i % PIE_FALLBACK.length],
      })),
    [charts.ordersByStatus]
  );

  const stockStatusSeries = useMemo(
    () =>
      (charts.stockByStatus || []).map((row: any, i: number) => ({
        name: prettyStatus(row.name),
        value: Number(row.value) || 0,
        fill: STATUS_COLORS[row.name] || PIE_FALLBACK[i % PIE_FALLBACK.length],
      })),
    [charts.stockByStatus]
  );

  const topProducts = useMemo(
    () =>
      (charts.topProducts || []).map((row: any) => ({
        name: String(row.name || 'Product').slice(0, 18),
        sold: Number(row.sold) || 0,
        amount: Number(row.amount) || 0,
      })),
    [charts.topProducts]
  );

  if (error) {
    return (
      <div className="dash-page">
        <div className="dash-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dash-loading">
        <Loader />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Revenue',
      value: money(stats.revenue),
      hint: `${money(stats.today_revenue)} today`,
      icon: IndianRupee,
      tone: 'amber',
    },
    {
      label: 'Orders',
      value: Number(stats.orders || 0).toLocaleString('en-IN'),
      hint: `${Number(stats.today_orders || 0)} today · ${Number(stats.open_orders || 0)} open`,
      icon: ShoppingCart,
      tone: 'blue',
    },
    {
      label: 'Products',
      value: Number(stats.products || 0).toLocaleString('en-IN'),
      hint: `${Number(stats.variants || 0)} variants`,
      icon: Package,
      tone: 'violet',
    },
    {
      label: 'Customers',
      value: Number(stats.customers || 0).toLocaleString('en-IN'),
      hint: 'Registered buyers',
      icon: Users,
      tone: 'teal',
    },
    {
      label: 'Low / Out Stock',
      value: Number(stats.low_stock || 0).toLocaleString('en-IN'),
      hint: 'Needs attention',
      icon: AlertTriangle,
      tone: 'rose',
      href: '/panel/stock',
    },
    {
      label: 'Today Revenue',
      value: money(stats.today_revenue),
      hint: `${Number(stats.today_orders || 0)} orders today`,
      icon: TrendingUp,
      tone: 'emerald',
    },
  ];

  return (
    <div className="dash-page">
      <section className="dash-kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const body = (
            <>
              <div className="dash-kpi-top">
                <span className={`dash-kpi-icon tone-${kpi.tone}`}><Icon size={18} /></span>
                {kpi.href && <ArrowUpRight size={16} className="dash-kpi-arrow" />}
              </div>
              <p className="dash-kpi-label">{kpi.label}</p>
              <p className="dash-kpi-value">{kpi.value}</p>
              <p className="dash-kpi-hint">{kpi.hint}</p>
            </>
          );
          return kpi.href ? (
            <Link key={kpi.label} to={kpi.href} className={`dash-kpi tone-${kpi.tone}`}>
              {body}
            </Link>
          ) : (
            <article key={kpi.label} className={`dash-kpi tone-${kpi.tone}`}>
              {body}
            </article>
          );
        })}
      </section>

      <section className="dash-notify-grid">
        <article className="dash-card dash-notify-card tone-rose">
          <div className="dash-card-head">
            <div>
              <h2><BellRing size={16} /> Stock alerts</h2>
              <p>Low / out / damaged · next actions</p>
            </div>
            <Link to="/panel/stock" className="dash-text-link">Manage</Link>
          </div>
          <div className="dash-list">
            {stockAlerts.length === 0 ? (
              <p className="dash-empty">All stock looks healthy</p>
            ) : (
              stockAlerts.slice(0, 6).map((p: any) => (
                <div key={p.id || p.inventoryID || `${p.sku}-${p.size}-${p.color}`} className="dash-list-row">
                  <div>
                    <strong>{p.name}</strong>
                    <p>{[p.color, p.size, p.warehouse_name].filter(Boolean).join(' · ') || p.sku || 'Variant'}</p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-status status-${p.status || 'low_stock'}`}>
                      {prettyStatus(p.status || 'low_stock')}
                    </span>
                    <strong className="is-warn"><Clock3 size={13} /> {p.available_qty ?? p.stock ?? 0}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dash-card dash-notify-card tone-teal">
          <div className="dash-card-head">
            <div>
              <h2><Trophy size={16} /> Top stocks</h2>
              <p>Highest available quantity</p>
            </div>
            <Link to="/panel/stock" className="dash-text-link">View</Link>
          </div>
          <div className="dash-list">
            {topStocks.length === 0 ? (
              <p className="dash-empty">No stock rows yet</p>
            ) : (
              topStocks.slice(0, 6).map((p: any, i: number) => (
                <div key={p.inventoryID || `${p.sku}-${p.size}-${i}`} className="dash-list-row">
                  <div>
                    <strong>{p.name}</strong>
                    <p>{[p.color, p.size, p.warehouse_name].filter(Boolean).join(' · ') || p.sku || 'Variant'}</p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-status status-${p.status || 'in_stock'}`}>
                      {prettyStatus(p.status || 'in_stock')}
                    </span>
                    <strong>{Number(p.available_qty || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dash-card dash-notify-card tone-violet">
          <div className="dash-card-head">
            <div>
              <h2><Cake size={16} /> Employee birthdays</h2>
              <p>Next 30 days</p>
            </div>
            <Link to="/panel/staff" className="dash-text-link">Staff</Link>
          </div>
          <div className="dash-list">
            {birthdays.length === 0 ? (
              <p className="dash-empty">No upcoming birthdays</p>
            ) : (
              birthdays.map((b: any) => (
                <div key={b.id || b.name} className="dash-list-row">
                  <div>
                    <strong>{b.name}</strong>
                    <p>{b.employee_code ? `Emp · ${b.employee_code}` : 'Staff'} · {b.birthday_label}</p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-chip ${b.is_today ? 'is-hot' : ''}`}>{daysLabel(Number(b.days_until) || 0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dash-card dash-notify-card tone-amber">
          <div className="dash-card-head">
            <div>
              <h2><CalendarHeart size={16} /> Festival dates</h2>
              <p>Next 45 days · retail calendar</p>
            </div>
            <span className="dash-pill tone-amber">Calendar</span>
          </div>
          <div className="dash-list">
            {festivals.length === 0 ? (
              <p className="dash-empty">No festivals soon</p>
            ) : (
              festivals.map((f: any) => (
                <div key={`${f.name}-${f.date}`} className="dash-list-row">
                  <div>
                    <strong>{f.name}</strong>
                    <p>{f.date_label} · {prettyStatus(f.kind || 'festival')}</p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-chip ${Number(f.days_until) === 0 ? 'is-hot' : ''}`}>
                      {daysLabel(Number(f.days_until) || 0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="dash-chart-grid">
        <article className="dash-card dash-span-2">
          <div className="dash-card-head">
            <div>
              <h2>Revenue trend</h2>
              <p>{revenueMeta.hint}</p>
            </div>
            <div className="dash-revenue-filters">
              <label className="dash-filter">
                <span>Period</span>
                <select
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value as RevenueRange)}
                  aria-label="Revenue period filter"
                >
                  {REVENUE_FILTERS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {revenueRange !== '7d' && (
                <label className="dash-filter">
                  <span>Week</span>
                  <select
                    value={weekKey}
                    onChange={(e) => setWeekKey(e.target.value)}
                    aria-label="Weekwise filter"
                  >
                    <option value="all">All weeks</option>
                    {(revenueRange === '4w' ? weekOptions.slice(-4) : weekOptions).map(
                      (opt: { value: string; label: string }) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}
              <span className="dash-pill tone-amber"><IndianRupee size={14} /> Sales</span>
            </div>
          </div>
          <div className="dash-chart-box">
            {revenueSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    interval="preserveStartEnd"
                    minTickGap={8}
                    angle={revenueRange === '7d' ? 0 : -25}
                    textAnchor={revenueRange === '7d' ? 'middle' : 'end'}
                    height={revenueRange === '7d' ? 28 : 50}
                  />
                  <YAxis width={42} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: any, name: string) =>
                      name === 'revenue' ? money(value) : value
                    }
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#d97706" fill="url(#revFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#2563eb" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="dash-empty">No revenue data yet</p>
            )}
          </div>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2>Orders by status</h2>
              <p>Current pipeline mix</p>
            </div>
            <span className="dash-pill tone-blue"><ShoppingCart size={14} /> Orders</span>
          </div>
          <div className="dash-chart-box">
            {orderStatusSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusSeries}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {orderStatusSeries.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="dash-empty">No orders yet</p>
            )}
          </div>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2>Stock health</h2>
              <p>Inventory status across warehouses</p>
            </div>
            <span className="dash-pill tone-teal"><Boxes size={14} /> Stock</span>
          </div>
          <div className="dash-chart-box">
            {stockStatusSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockStatusSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="SKUs" radius={[10, 10, 0, 0]}>
                    {stockStatusSeries.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="dash-empty">No inventory rows yet</p>
            )}
          </div>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2>Top selling products</h2>
              <p>By units sold</p>
            </div>
            <span className="dash-pill tone-violet"><Package size={14} /> Catalog</span>
          </div>
          <div className="dash-chart-box">
            {topProducts.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip formatter={(value: any, name: string) => (name === 'amount' ? money(value) : value)} />
                  <Bar dataKey="sold" name="Units" fill="#8b5cf6" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="dash-empty">No sales yet</p>
            )}
          </div>
        </article>
      </section>

      <section className="dash-lists">
        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2>Recent orders</h2>
              <p>Latest activity</p>
            </div>
            <Link to="/panel/orders" className="dash-text-link">View all</Link>
          </div>
          <div className="dash-list">
            {recentOrders.length === 0 ? (
              <p className="dash-empty">No recent orders</p>
            ) : (
              recentOrders.map((o: any) => (
                <div key={o.id || o.orderID} className="dash-list-row">
                  <div>
                    <strong>{o.order_number || `#${o.id}`}</strong>
                    <p>{o.customer_name || 'Customer'}</p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-status status-${o.status}`}>{prettyStatus(o.status)}</span>
                    <strong>{money(o.total)}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <div>
              <h2>Stock alerts</h2>
              <p>Low / out / damaged</p>
            </div>
            <Link to="/panel/stock" className="dash-text-link">Manage</Link>
          </div>
          <div className="dash-list">
            {lowStock.length === 0 ? (
              <p className="dash-empty">All stock looks healthy</p>
            ) : (
              lowStock.map((p: any) => (
                <div key={p.id || p.inventoryID || `${p.sku}-${p.size}-${p.color}`} className="dash-list-row">
                  <div>
                    <strong>{p.name}</strong>
                    <p>
                      {[p.color, p.size, p.warehouse_name].filter(Boolean).join(' · ') || p.sku || 'Variant'}
                    </p>
                  </div>
                  <div className="dash-list-meta">
                    <span className={`dash-status status-${p.status || 'low_stock'}`}>
                      {prettyStatus(p.status || 'low_stock')}
                    </span>
                    <strong className="is-warn">
                      <Clock3 size={13} /> {p.available_qty ?? p.stock ?? 0}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
