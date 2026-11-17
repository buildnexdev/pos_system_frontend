import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchCartRequest, clearCart } from '../../redux/cart/cart.action';
import { RootState } from '../../redux/store';
import { ordersService } from '../../redux/orders/orders.service';
import { Loader } from '../../components/ui/Loader';

const schema = Yup.object({
  shipping_name: Yup.string().required('Name is required'),
  shipping_phone: Yup.string().required('Phone is required'),
  shipping_address: Yup.string().required('Address is required'),
  shipping_city: Yup.string().required('City is required'),
  shipping_state: Yup.string().required('State is required'),
  shipping_pincode: Yup.string().required('Pincode is required'),
  payment_method: Yup.string().required(),
  notes: Yup.string(),
});

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, shipping, total, loading } = useSelector((s: RootState) => s.cart);
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  if (loading && !items.length) return <Loader />;
  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <Formik
          initialValues={{
            shipping_name: user?.name || '',
            shipping_phone: user?.phone || '',
            shipping_address: user?.address || '',
            shipping_city: user?.city || '',
            shipping_state: user?.state || '',
            shipping_pincode: user?.pincode || '',
            payment_method: 'cod',
            notes: '',
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const data = await ordersService.placeOrder(values);
              dispatch(clearCart());
              toast.success('Order placed successfully');
              navigate(`/orders/${data.orderId}`);
            } catch (e: any) {
              toast.error(e.response?.data?.message || 'Checkout failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
              <h2 className="text-lg font-semibold">Shipping Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Full Name</label>
                  <Field name="shipping_name" className="input" />
                  <ErrorMessage name="shipping_name" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Phone</label>
                  <Field name="shipping_phone" className="input" />
                  <ErrorMessage name="shipping_phone" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm">Address</label>
                  <Field as="textarea" name="shipping_address" rows={3} className="input" />
                  <ErrorMessage name="shipping_address" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">City</label>
                  <Field name="shipping_city" className="input" />
                  <ErrorMessage name="shipping_city" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">State</label>
                  <Field name="shipping_state" className="input" />
                  <ErrorMessage name="shipping_state" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Pincode</label>
                  <Field name="shipping_pincode" className="input" />
                  <ErrorMessage name="shipping_pincode" component="p" className="mt-1 text-sm text-red-600" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm">Notes</label>
                  <Field as="textarea" name="notes" rows={2} className="input" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Field type="radio" name="payment_method" value="cod" /> Cash on Delivery
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Field type="radio" name="payment_method" value="online" /> Online (Demo Paid)
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Placing order...' : 'Place Order'}
              </button>
            </Form>
          )}
        </Formik>

        <aside className="h-fit rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span>{item.name} × {item.quantity}</span>
                <strong>₹{Number(item.lineTotal).toFixed(0)}</strong>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2"><span>Subtotal</span><strong>₹{subtotal.toFixed(0)}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? 'Free' : `₹${shipping}`}</strong></div>
            <div className="flex justify-between text-base"><span>Total</span><strong>₹{total.toFixed(0)}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
