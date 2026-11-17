import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardServices } from '../../redux/dashboard/dashboard.services';
import { Loader } from '../../components/ui/Loader';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardServices.http.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-10"><Loader /></div>;

  const { stats, recentOrders, lowStock } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-4xl">Admin Dashboard</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/admin/products" className="text-amber-800">Products</Link>
          <Link to="/admin/orders" className="text-amber-800">Orders</Link>
          <Link to="/admin/categories" className="text-amber-800">Categories</Link>
          <Link to="/admin/customers" className="text-amber-800">Customers</Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Products', stats.products],
          ['Orders', stats.orders],
          ['Customers', stats.customers],
          ['Revenue', `₹${Number(stats.revenue).toFixed(0)}`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-semibold">Recent Orders</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentOrders.map((o: any) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex justify-between border-b py-2 last:border-0">
                <span>{o.order_number} · {o.customer_name}</span>
                <span>₹{Number(o.total).toFixed(0)}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-semibold">Low Stock</h2>
          <div className="mt-4 space-y-2 text-sm">
            {lowStock.map((p: any) => (
              <Link key={p.id} to={`/admin/products/${p.id}`} className="flex justify-between border-b py-2 last:border-0">
                <span>{p.name}</span>
                <span>{p.stock}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
