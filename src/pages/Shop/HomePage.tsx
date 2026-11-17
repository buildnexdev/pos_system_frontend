import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeRequest } from '../../redux/shop/shop.action';
import { RootState } from '../../redux/store';
import ProductCard from '../../components/shop/ProductCard';
import { Loader } from '../../components/ui/Loader';
import { COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/brand';

export default function HomePage() {
  const dispatch = useDispatch();
  const { categories, featured, latest, loading } = useSelector((s: RootState) => s.shop);

  useEffect(() => {
    dispatch(fetchHomeRequest());
  }, [dispatch]);

  if (loading && !featured.length) return <Loader />;

  return (
    <div>
      <section className="relative min-h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b241908a37?w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-16">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-amber-200">{COMPANY_TAGLINE}</p>
            <h1 className="font-display text-5xl md:text-6xl">{COMPANY_NAME}</h1>
            <p className="mt-4 text-lg text-white/85">
              Retail, POS, e-commerce and inventory — one platform for every shop.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900">Shop Collection</Link>
              <Link to="/shop?category=women" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white">Explore Women</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-3xl">Shop by Category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat: any) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200 transition hover:shadow-md">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/60 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl">Featured Products</h2>
            <Link to="/shop" className="text-sm text-amber-800">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 font-display text-3xl">New Arrivals</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
