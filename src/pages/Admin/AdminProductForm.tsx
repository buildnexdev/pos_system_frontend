import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { catalogServices } from '../../redux/catalog/catalog.services';
import { Loader } from '../../components/ui/Loader';

const schema = Yup.object({
  name: Yup.string().required('Required'),
  sku: Yup.string().required('Required'),
  category_id: Yup.number().required('Required'),
  price: Yup.number().required('Required').min(0),
  stock: Yup.number().min(0),
});

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [initial, setInitial] = useState<any>(null);

  useEffect(() => {
    catalogServices.http.get('/admin/categories').then((res) => setCategories(res.data.categories || []));
    if (id) {
      catalogServices.http.get(`/admin/products/${id}`).then((res) => {
        const p = res.data.product;
        setInitial({
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          category_id: p.category_id,
          price: p.price,
          sale_price: p.sale_price || '',
          stock: p.stock,
          sizes: p.sizes,
          colors: p.colors,
          brand: p.brand,
          gender: p.gender,
          fabric: p.fabric || '',
          description: p.description || '',
          image_url: res.data.images?.[0]?.image_url || '',
          is_featured: !!p.is_featured,
          is_active: !!p.is_active,
        });
      });
    } else {
      setInitial({
        name: '',
        slug: '',
        sku: '',
        category_id: '',
        price: '',
        sale_price: '',
        stock: 0,
        sizes: 'S,M,L,XL',
        colors: 'Black,White',
        brand: 'BuildNex ShopOS',
        gender: 'unisex',
        fabric: '',
        description: '',
        image_url: '',
        is_featured: true,
        is_active: true,
      });
    }
  }, [id]);

  if (!initial) return <div className="p-10"><Loader /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">{id ? 'Edit Product' : 'Add Product'}</h1>
      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload = {
              ...values,
              sale_price: values.sale_price === '' ? null : values.sale_price,
              is_featured: values.is_featured ? 1 : 0,
              is_active: values.is_active ? 1 : 0,
            };
            if (id) await catalogServices.http.put(`/admin/products/${id}`, payload);
            else await catalogServices.http.post('/admin/products', payload);
            toast.success('Product saved');
            navigate('/admin/products');
          } catch (e: any) {
            toast.error(e.response?.data?.message || 'Save failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="mt-8 grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="p" className="text-sm text-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm">SKU</label>
              <Field name="sku" className="input" />
              <ErrorMessage name="sku" component="p" className="text-sm text-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Category</label>
              <Field as="select" name="category_id" className="select">
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Field>
            </div>
            <div>
              <label className="mb-1 block text-sm">Slug</label>
              <Field name="slug" className="input" placeholder="auto from name" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Price</label>
              <Field name="price" type="number" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Sale Price</label>
              <Field name="sale_price" type="number" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Stock</label>
              <Field name="stock" type="number" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Gender</label>
              <Field as="select" name="gender" className="select">
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </Field>
            </div>
            <div>
              <label className="mb-1 block text-sm">Sizes</label>
              <Field name="sizes" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Colors</label>
              <Field name="colors" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Description</label>
              <Field as="textarea" name="description" rows={3} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Image URL</label>
              <Field name="image_url" className="input" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.is_featured} onChange={(e) => setFieldValue('is_featured', e.target.checked)} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.is_active} onChange={(e) => setFieldValue('is_active', e.target.checked)} /> Active
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save</button>
              <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
