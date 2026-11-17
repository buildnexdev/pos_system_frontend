import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { orderPanelServices } from '../../redux/orderPanel/orderPanel.services';
import { Loader } from '../../components/ui/Loader';

export function AdminOrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    orderPanelServices.http.get('/admin/orders').then((res) => setOrders(res.data.orders || []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Orders</h1>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-stone-50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="px-4 py-3">{o.order_number}</td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3 capitalize">{o.status}</td>
                <td className="px-4 py-3">₹{Number(o.total).toFixed(0)}</td>
                <td className="px-4 py-3"><Link to={`/admin/orders/${o.id}`} className="text-amber-800">Manage</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOrderDetail() {
  const { id = '' } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await orderPanelServices.http.get(`/admin/orders/${id}`);
    setOrder(data.order);
    setItems(data.items || []);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!order) return <div className="p-10"><Loader /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl">{order.order_number}</h1>
      <p className="mt-2 text-sm text-slate-600">{order.customer_name} · {order.customer_email}</p>
      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-2 text-sm last:border-0">
            <span>{item.product_name} ({item.size}/{item.color}) × {item.quantity}</span>
            <strong>₹{(Number(item.price) * item.quantity).toFixed(0)}</strong>
          </div>
        ))}
      </div>
      <Formik
        enableReinitialize
        initialValues={{ status: order.status, payment_status: order.payment_status }}
        onSubmit={async (values) => {
          await orderPanelServices.http.put(`/admin/orders/${id}`, values);
          toast.success('Order updated');
          load();
        }}
      >
        <Form className="mt-6 grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Status</label>
            <Field as="select" name="status" className="select">
              {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
          </div>
          <div>
            <label className="mb-1 block text-sm">Payment</label>
            <Field as="select" name="payment_status" className="select">
              {['pending', 'paid', 'failed', 'refunded'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
          </div>
          <button type="submit" className="btn btn-primary">Update</button>
        </Form>
      </Formik>
    </div>
  );
}
