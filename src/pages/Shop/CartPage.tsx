import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartRequest, removeCartRequest, updateCartRequest } from '../../redux/cart/cart.action';
import { RootState } from '../../redux/store';
import { Loader } from '../../components/ui/Loader';

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, subtotal, shipping, total, loading } = useSelector((s: RootState) => s.cart);

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  if (loading && !items.length) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Shopping Cart</h1>
      {!items.length ? (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p>Your cart is empty.</p>
          <Link to="/shop" className="btn btn-primary mt-4 inline-flex">Continue Shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                <img src={item.image || 'https://placehold.co/80x100'} alt="" className="h-24 w-20 rounded object-cover" />
                <div className="flex-1">
                  <Link to={`/product/${item.slug}`} className="font-medium">{item.name}</Link>
                  <p className="text-sm text-slate-500">{item.size} / {item.color}</p>
                  <p className="mt-1">₹{Number(item.unitPrice).toFixed(0)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      defaultValue={item.quantity}
                      className="input w-20"
                      onBlur={(e) => dispatch(updateCartRequest(item.id, Number(e.target.value) || 1))}
                    />
                    <button type="button" className="text-sm text-red-600" onClick={() => dispatch(removeCartRequest(item.id))}>
                      Remove
                    </button>
                  </div>
                </div>
                <strong>₹{Number(item.lineTotal).toFixed(0)}</strong>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>₹{subtotal.toFixed(0)}</strong></div>
              <div className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? 'Free' : `₹${shipping}`}</strong></div>
              <div className="flex justify-between border-t pt-2 text-base"><span>Total</span><strong>₹{total.toFixed(0)}</strong></div>
            </div>
            <Link to="/checkout" className="btn btn-primary mt-5 w-full">Proceed to Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
