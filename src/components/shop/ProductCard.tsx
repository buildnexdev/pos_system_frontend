import { Link } from 'react-router-dom';

export default function ProductCard({ product }: { product: any }) {
  const price = product.sale_price != null ? Number(product.sale_price) : Number(product.price);
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/product/${product.slug}`} className="block aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          src={product.image || 'https://placehold.co/400x500?text=Garment'}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category_name || product.brand}</p>
        <h3 className="font-medium text-slate-900">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center gap-2">
          <strong>₹{price.toFixed(0)}</strong>
          {product.sale_price && (
            <span className="text-sm text-slate-400 line-through">₹{Number(product.price).toFixed(0)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
