import { useEffect, useState } from 'react';
import { dashboardServices } from '../../../redux/dashboard/dashboard.services';
import { Loader } from '../../../components/ui/Loader';
import './dashboard.scss';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashboardServices.http.get('/panel/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <Loader />;

  const { stats, recentOrders, lowStock } = data;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Products', stats.products],
          ['Orders', stats.orders],
          ['Customers', stats.customers],
          ['Revenue', `₹${Number(stats.revenue).toFixed(0)}`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold">Recent Orders</h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="flex justify-between border-b py-2 last:border-0">
                <span>{o.order_number} · {o.customer_name}</span>
                <span>₹{Number(o.total).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold">Low Stock</h2>
          <div className="mt-3 space-y-2 text-sm">
            {lowStock.map((p: any) => (
              <div key={p.id} className="flex justify-between border-b py-2 last:border-0">
                <span>{p.name}</span>
                <span>{p.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
