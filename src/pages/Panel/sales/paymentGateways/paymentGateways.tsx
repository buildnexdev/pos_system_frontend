import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { paymentGatewayServices } from '../../../../redux/paymentGateway/paymentGateway.services';
import { Loader } from '../../../../components/ui/Loader';

export default function PaymentGatewaysPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await paymentGatewayServices.http.get('/panel/payment-gateways');
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
        <h1 className="text-2xl font-semibold">Payment Gateway</h1>
        <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-slate-500">{item.provider} · {item.mode} · {item.is_active ? 'Active' : 'Off'}</p>
              </div>
              <div className="space-x-2">
                <button type="button" className="text-amber-800" onClick={() => setEditing(item)}>Edit</button>
                <button type="button" className="text-red-600" onClick={async () => {
                  await paymentGatewayServices.http.delete(`/panel/payment-gateways/${item.id}`);
                  toast.success('Deleted');
                  load();
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          name: editing?.name || '',
          provider: editing?.provider || 'razorpay',
          api_key: editing?.api_key || '',
          secret_key: editing?.secret_key || '',
          webhook_url: editing?.webhook_url || '',
          mode: editing?.mode || 'test',
          is_active: editing ? !!editing.is_active : false,
        }}
        onSubmit={async (values, { resetForm }) => {
          if (editing) await paymentGatewayServices.http.put(`/panel/payment-gateways/${editing.id}`, values);
          else await paymentGatewayServices.http.post('/panel/payment-gateways', values);
          toast.success('Saved');
          setEditing(null);
          resetForm();
          load();
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="h-fit space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="font-semibold">{editing ? 'Edit Gateway' : 'Add Gateway'}</h2>
            <Field name="name" className="input" placeholder="Name" />
            <Field name="provider" className="input" placeholder="Provider" />
            <Field name="api_key" className="input" placeholder="API Key" />
            <Field name="secret_key" className="input" placeholder="Secret Key" />
            <Field name="webhook_url" className="input" placeholder="Webhook URL" />
            <Field as="select" name="mode" className="select">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.is_active} onChange={(e) => setFieldValue('is_active', e.target.checked)} /> Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              {editing && <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
