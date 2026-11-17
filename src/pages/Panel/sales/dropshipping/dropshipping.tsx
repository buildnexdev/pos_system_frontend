import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { dropshippingServices } from '../../../../redux/dropshipping/dropshipping.services';
import { Loader } from '../../../../components/ui/Loader';

export default function DropshippingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await dropshippingServices.http.get('/panel/dropshipping');
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Loader />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold">Dropshipping</h1>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-slate-500">{item.reference_no} · {item.supplier_name}</p>
                  <p className="mt-1">Qty {item.quantity} · Cost ₹{Number(item.cost_price).toFixed(0)} · Sell ₹{Number(item.sell_price).toFixed(0)}</p>
                  <p className="capitalize text-slate-600">Status: {item.status}</p>
                </div>
                <div className="space-x-2">
                  <button type="button" className="text-amber-800" onClick={() => setEditing(item)}>Edit</button>
                  <button type="button" className="text-red-600" onClick={async () => {
                    await dropshippingServices.http.delete(`/panel/dropshipping/${item.id}`);
                    toast.success('Deleted');
                    load();
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          reference_no: editing?.reference_no || '',
          supplier_name: editing?.supplier_name || '',
          product_name: editing?.product_name || '',
          quantity: editing?.quantity || 1,
          cost_price: editing?.cost_price || 0,
          sell_price: editing?.sell_price || 0,
          customer_name: editing?.customer_name || '',
          shipping_address: editing?.shipping_address || '',
          status: editing?.status || 'pending',
          tracking_no: editing?.tracking_no || '',
        }}
        onSubmit={async (values, { resetForm }) => {
          if (editing) await dropshippingServices.http.put(`/panel/dropshipping/${editing.id}`, values);
          else await dropshippingServices.http.post('/panel/dropshipping', values);
          toast.success('Saved');
          setEditing(null);
          resetForm();
          load();
        }}
      >
        <Form className="h-fit space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold">{editing ? 'Edit Dropship' : 'New Dropship Order'}</h2>
          <Field name="supplier_name" className="input" placeholder="Supplier" />
          <Field name="product_name" className="input" placeholder="Product" />
          <Field name="quantity" type="number" className="input" placeholder="Qty" />
          <Field name="cost_price" type="number" className="input" placeholder="Cost" />
          <Field name="sell_price" type="number" className="input" placeholder="Sell Price" />
          <Field name="customer_name" className="input" placeholder="Customer" />
          <Field as="textarea" name="shipping_address" className="input" rows={2} placeholder="Shipping Address" />
          <Field as="select" name="status" className="select">
            {['pending', 'ordered', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Field>
          <Field name="tracking_no" className="input" placeholder="Tracking No" />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            {editing && <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>}
          </div>
        </Form>
      </Formik>
    </div>
  );
}
