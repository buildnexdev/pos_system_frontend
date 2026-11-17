import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { catalogServices } from '../../redux/catalog/catalog.services';
import { Loader } from '../../components/ui/Loader';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await catalogServices.http.get('/admin/products');
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-10"><Loader /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-4xl">Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">Add Product</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-stone-50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image || 'https://placehold.co/48x56'} alt="" className="h-12 w-10 rounded object-cover" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.category_name}</td>
                <td className="px-4 py-3">₹{Number(p.sale_price || p.price).toFixed(0)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link to={`/admin/products/${p.id}`} className="text-amber-800">Edit</Link>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={async () => {
                      if (!confirm('Delete product?')) return;
                      await catalogServices.http.delete(`/admin/products/${p.id}`);
                      toast.success('Deleted');
                      load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
