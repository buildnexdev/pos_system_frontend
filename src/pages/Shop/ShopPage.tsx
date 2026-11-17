import { Formik, Form, Field } from 'formik';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchHomeRequest, fetchProductsRequest } from '../../redux/shop/shop.action';
import { RootState } from '../../redux/store';
import ProductCard from '../../components/shop/ProductCard';
import { Loader } from '../../components/ui/Loader';
import { COMPANY_NAME } from '../../utils/brand';

export default function ShopPage() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { products, categories, loading } = useSelector((s: RootState) => s.shop);

  const filters = {
    q: params.get('q') || '',
    category: params.get('category') || '',
    gender: params.get('gender') || '',
    sort: params.get('sort') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
  };

  useEffect(() => {
    if (!categories.length) dispatch(fetchHomeRequest());
  }, [dispatch, categories.length]);

  useEffect(() => {
    dispatch(fetchProductsRequest(filters));
  }, [dispatch, params.toString()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Shop {COMPANY_NAME}</h1>
      <p className="mt-2 text-slate-600">{products.length} products found</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl bg-white p-5 ring-1 ring-stone-200 h-fit">
          <Formik
            enableReinitialize
            initialValues={filters}
            onSubmit={(values) => {
              const next = new URLSearchParams();
              Object.entries(values).forEach(([k, v]) => {
                if (v) next.set(k, String(v));
              });
              setParams(next);
            }}
          >
            <Form className="space-y-3">
              <label className="block text-sm font-medium">Search</label>
              <Field name="q" className="input" placeholder="Search..." />
              <label className="block text-sm font-medium">Category</label>
              <Field as="select" name="category" className="select">
                <option value="">All</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </Field>
              <label className="block text-sm font-medium">Gender</label>
              <Field as="select" name="gender" className="select">
                <option value="">All</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </Field>
              <label className="block text-sm font-medium">Sort</label>
              <Field as="select" name="sort" className="select">
                <option value="">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name</option>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field name="min" type="number" className="input" placeholder="Min" />
                <Field name="max" type="number" className="input" placeholder="Max" />
              </div>
              <button type="submit" className="btn btn-primary w-full">Apply</button>
            </Form>
          </Formik>
        </aside>

        <div>
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-600 ring-1 ring-stone-200">No products found.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
