import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { shopService } from '../../redux/shop/shop.services';
import ProductCard from '../../components/shop/ProductCard';
import { Loader } from '../../components/ui/Loader';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await shopService.getWishlist();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Wishlist</h1>
      {!items.length ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">Wishlist is empty.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <div key={product.wish_id}>
              <ProductCard product={product} />
              <button
                type="button"
                className="mt-2 text-sm text-red-600"
                onClick={async () => {
                  await shopService.removeWishlist(product.wish_id);
                  toast.success('Removed');
                  load();
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
