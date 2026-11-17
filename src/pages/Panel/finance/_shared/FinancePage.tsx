import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { financeServices } from '../../../../redux/finance/finance.services';
import { Loader } from '../../../../components/ui/Loader';

export default function FinancePage() {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await financeServices.http.get('/panel/finance');
      setItems(data.items || []);
      setSummary(data.summary || { income: 0, expense: 0, balance: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Finance</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="text-sm text-slate-500">Income</p><p className="text-xl font-semibold">₹{summary.income.toFixed(0)}</p></div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="text-sm text-slate-500">Expense</p><p className="text-xl font-semibold">₹{summary.expense.toFixed(0)}</p></div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"><p className="text-sm text-slate-500">Balance</p><p className="text-xl font-semibold">₹{summary.balance.toFixed(0)}</p></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{String(item.entry_date).slice(0, 10)}</td>
                  <td className="px-4 py-3 capitalize">{item.type}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">₹{Number(item.amount).toFixed(0)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button type="button" className="text-amber-800" onClick={() => setEditing(item)}>Edit</button>
                    <button type="button" className="text-red-600" onClick={async () => {
                      await financeServices.http.delete(`/panel/finance/${item.id}`);
                      toast.success('Deleted');
                      load();
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            entry_date: editing?.entry_date ? String(editing.entry_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
            type: editing?.type || 'income',
            category: editing?.category || '',
            amount: editing?.amount || '',
            reference_no: editing?.reference_no || '',
            description: editing?.description || '',
          }}
          onSubmit={async (values, { resetForm }) => {
            if (editing) await financeServices.http.put(`/panel/finance/${editing.id}`, values);
            else await financeServices.http.post('/panel/finance', values);
            toast.success('Saved');
            setEditing(null);
            resetForm();
            load();
          }}
        >
          <Form className="h-fit space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="font-semibold">{editing ? 'Edit Entry' : 'Add Entry'}</h2>
            <Field name="entry_date" type="date" className="input" />
            <Field as="select" name="type" className="select">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Field>
            <Field name="category" className="input" placeholder="Category" />
            <Field name="amount" type="number" className="input" placeholder="Amount" />
            <Field name="reference_no" className="input" placeholder="Reference" />
            <Field as="textarea" name="description" className="input" rows={2} placeholder="Description" />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              {editing && <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>}
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
