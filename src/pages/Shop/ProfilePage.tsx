import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../../redux/store';
import { authService } from '../../redux/auth/auth.services';
import { loadUserSuccess } from '../../redux/auth/auth.action';
import { getToken } from '../../common/jwt';

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: Yup.string(),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl">My Profile</h1>
      <Formik
        enableReinitialize
        initialValues={{
          name: user?.name || '',
          phone: user?.phone || '',
          address: user?.address || '',
          city: user?.city || '',
          state: user?.state || '',
          pincode: user?.pincode || '',
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const data = await authService.updateProfile(values);
            authService.storeAuthData(data.user, getToken() || '');
            dispatch(loadUserSuccess(data.user, []));
            toast.success('Profile updated');
          } catch (e: any) {
            toast.error(e.response?.data?.message || 'Update failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="mt-8 space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input className="input bg-stone-50" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Phone</label>
              <Field name="phone" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Address</label>
              <Field as="textarea" name="address" rows={3} className="input" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field name="city" className="input" placeholder="City" />
              <Field name="state" className="input" placeholder="State" />
              <Field name="pincode" className="input" placeholder="Pincode" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save Profile</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
