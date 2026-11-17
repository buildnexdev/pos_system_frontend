import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { catalogServices } from '../../redux/catalog/catalog.services';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);

  const load = async () => {
    const { data } = await catalogServices.http.get('/admin/categories');
    setCategories(data.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Categories</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Formik
          initialValues={{ name: '', slug: '', description: '' }}
          onSubmit={async (values, { resetForm }) => {
            await catalogServices.http.post('/admin/categories', values);
            toast.success('Category saved');
            resetForm();
            load();
          }}
        >
          <Form className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">Add Category</h2>
            <Field name="name" className="input" placeholder="Name" />
            <Field name="slug" className="input" placeholder="Slug (optional)" />
            <Field as="textarea" name="description" className="input" rows={3} placeholder="Description" />
            <button type="submit" className="btn btn-primary">Save</button>
          </Form>
        </Formik>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b py-3 text-sm last:border-0">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-slate-500">{c.slug} · {c.product_count} products</p>
              </div>
              <button
                type="button"
                className="text-red-600"
                onClick={async () => {
                  if (!confirm('Delete category?')) return;
                  await catalogServices.http.delete(`/admin/categories/${c.id}`);
                  toast.success('Deleted');
                  load();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
