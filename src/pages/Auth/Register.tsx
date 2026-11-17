import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { registerRequest } from '../../redux/auth/auth.action';
import { RootState } from '../../redux/store';

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Account created');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <h1 className="font-display text-3xl">Create Account</h1>
        <Formik
          initialValues={{ name: '', email: '', phone: '', password: '' }}
          validationSchema={schema}
          onSubmit={(values) => dispatch(registerRequest(values))}
        >
          <Form className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm">Full Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <Field name="email" type="email" className="input" />
              <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Phone</label>
              <Field name="phone" className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm">Password</label>
              <Field name="password" type="password" className="input" />
              <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Register'}
            </button>
          </Form>
        </Formik>
        <p className="mt-4 text-sm">Already have an account? <Link to="/login" className="text-amber-800">Login</Link></p>
      </div>
    </div>
  );
}
