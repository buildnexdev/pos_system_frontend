import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ordersService } from '../../redux/orders/orders.service';
import { Loader } from '../../components/ui/Loader';

export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ordersService.getOrder(id);
      setOrder(data.order);
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading || !order) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Order {order.order_number}</h1>
      <p className="mt-2 capitalize text-slate-600">Status: {order.status}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-slate-500">{item.size} / {item.color} × {item.quantity}</p>
                </div>
                <strong>₹{(Number(item.price) * item.quantity).toFixed(0)}</strong>
              </div>
            ))}
          </div>
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              type="button"
              className="btn btn-outline mt-6"
              onClick={async () => {
                try {
                  await ordersService.cancelOrder(order.id);
                  toast.success('Order cancelled');
                  load();
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Cancel failed');
                }
              }}
            >
              Cancel Order
            </button>
          )}
        </div>
        <aside className="rounded-2xl bg-white p-5 ring-1 ring-stone-200 text-sm">
          <h2 className="font-semibold">Shipping</h2>
          <p className="mt-3">{order.shipping_name}<br />{order.shipping_phone}</p>
          <p className="mt-2">{order.shipping_address}<br />{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
          <div className="mt-4 space-y-1 border-t pt-4">
            <div className="flex justify-between"><span>Subtotal</span><strong>₹{Number(order.subtotal).toFixed(0)}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>₹{Number(order.shipping_fee).toFixed(0)}</strong></div>
            <div className="flex justify-between text-base"><span>Total</span><strong>₹{Number(order.total).toFixed(0)}</strong></div>
          </div>
          <p className="mt-3">Payment: {String(order.payment_method).toUpperCase()} ({order.payment_status})</p>
        </aside>
      </div>
      <Link to="/orders" className="mt-6 inline-block text-sm text-amber-800">← All orders</Link>
    </div>
  );
}
