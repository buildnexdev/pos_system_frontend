import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../../redux/orders/orders.service';
import { Loader } from '../../components/ui/Loader';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">My Orders</h1>
      {!orders.length ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p>No orders yet.</p>
          <Link to="/shop" className="btn btn-primary mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-stone-50">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{order.order_number}</td>
                  <td className="px-4 py-3">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                  <td className="px-4 py-3">₹{Number(order.total).toFixed(0)}</td>
                  <td className="px-4 py-3"><Link to={`/orders/${order.id}`} className="text-amber-800">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
