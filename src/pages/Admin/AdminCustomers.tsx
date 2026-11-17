import { useEffect, useState } from 'react';
import { billingServices } from '../../redux/billing/billing.services';
import { Loader } from '../../components/ui/Loader';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingServices.http.get('/admin/customers')
      .then((res) => setCustomers(res.data.customers || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10"><Loader /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Customers</h1>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-stone-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.order_count}</td>
                <td className="px-4 py-3">₹{Number(c.spent).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
