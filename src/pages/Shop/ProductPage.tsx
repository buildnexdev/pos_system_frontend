import { Formik, Form, Field } from 'formik';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductRequest } from '../../redux/shop/shop.action';
import { addToCartRequest } from '../../redux/cart/cart.action';
import { RootState } from '../../redux/store';
import ProductCard from '../../components/shop/ProductCard';
import { Loader } from '../../components/ui/Loader';
import { shopService } from '../../redux/shop/shop.services';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, images, related, loading, inWishlist } = useSelector((s: RootState) => s.shop);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (slug) dispatch(fetchProductRequest(slug));
  }, [dispatch, slug]);

  if (loading || !product) return <Loader />;

  const price = product.effective_price ?? (product.sale_price != null ? Number(product.sale_price) : Number(product.price));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <img
            src={(images[0] && images[0].image_url) || product.image || 'https://placehold.co/600x750'}
            alt={product.name}
            className="w-full rounded-2xl object-cover"
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">{product.category_name} · {product.brand}</p>
          <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <strong className="text-2xl">₹{Number(price).toFixed(0)}</strong>
            {product.sale_price && <span className="text-slate-400 line-through">₹{Number(product.price).toFixed(0)}</span>}
          </div>
          <p className="mt-4 text-slate-600">{product.description}</p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>SKU: {product.sku}</li>
            <li>Fabric: {product.fabric || '—'}</li>
            <li>Stock: {product.stock}</li>
          </ul>

          {product.stock > 0 ? (
            <Formik
              initialValues={{
                product_id: product.id,
                size: product.sizes?.[0] || 'M',
                color: product.colors?.[0] || 'Black',
                quantity: 1,
              }}
              onSubmit={(values) => {
                if (!isAuthenticated) {
                  toast.error('Please login to add items');
                  navigate('/login', { state: { from: `/product/${slug}` } });
                  return;
                }
                dispatch(addToCartRequest(values));
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="mt-6 space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {(product.sizes || []).map((size: string) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFieldValue('size', size)}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${values.size === size ? 'border-slate-900 bg-slate-900 text-white' : 'border-stone-300 bg-white'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {(product.colors || []).map((color: string) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFieldValue('color', color)}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${values.color === color ? 'border-slate-900 bg-slate-900 text-white' : 'border-stone-300 bg-white'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Field name="quantity" type="number" min="1" max={product.stock} className="input max-w-[120px]" />
                  <button type="submit" className="btn btn-primary">Add to Cart</button>
                </Form>
              )}
            </Formik>
          ) : (
            <p className="mt-6 font-medium text-red-600">Out of stock</p>
          )}

          {isAuthenticated && (
            <button
              type="button"
              className="btn btn-outline mt-3"
              onClick={async () => {
                try {
                  const data = await shopService.toggleWishlist(product.id);
                  toast.success(data.message);
                  dispatch(fetchProductRequest(slug));
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Wishlist update failed');
                }
              }}
            >
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-3xl">Related Products</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
      <Link to="/shop" className="mt-8 inline-block text-sm text-amber-800">← Back to shop</Link>
    </div>
  );
}
