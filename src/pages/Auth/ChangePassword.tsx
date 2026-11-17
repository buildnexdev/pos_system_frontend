/**
 * Author: Nandhakumar
 * Version: 0.0.3
 * Desc: Forced / voluntary password change (every 10 days)
 * Edit Date: 2026-11-14
 */

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { authService } from '../../redux/auth/auth.services';
import { loginSuccess } from '../../redux/auth/auth.action';
import { RootState } from '../../redux/store';
import { isPanelUser, isSuperAdminUser } from '../../utils/access';
import { COMPANY_LOGO, COMPANY_NAME } from '../../utils/brand';
import './Login.scss';

const schema = Yup.object({
  old_password: Yup.string().required('Current password is required'),
  new_password: Yup.string().min(6, 'At least 6 characters').required('New password is required'),
  new_password_confirmation: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Confirm your new password'),
});

function PasswordField({ name, autoComplete }: { name: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="bnx-password-wrap">
      <Field name={name} type={show ? 'text' : 'password'} autoComplete={autoComplete} />
      <button
        type="button"
        className="bnx-password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const forced = !!user?.mustChangePassword;
  const maxDays = user?.passwordMaxAgeDays || 10;

  const goHome = () => {
    if (isSuperAdminUser(user)) navigate('/panel/companies', { replace: true });
    else if (isPanelUser(user)) navigate('/panel', { replace: true });
    else navigate('/login', { replace: true });
  };

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="bnx-login">
      <div className="bnx-login-stage" style={{ gridTemplateColumns: '1fr', placeItems: 'center' }}>
        <aside className="bnx-login-panel" style={{ maxWidth: 440, width: '100%', borderLeft: 0, borderRadius: 18, margin: '2rem' }}>
          <Formik
            initialValues={{ old_password: '', new_password: '', new_password_confirmation: '' }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const data = await authService.changePassword(values);
                const nextUser = { ...(data.user || user), mustChangePassword: false };
                authService.storeAuthData(nextUser, data.token, data.rights || []);
                dispatch(loginSuccess(nextUser, data.token, data.rights || []));
                toast.success('Password updated');
                goHome();
              } catch (e: any) {
                toast.error(e.response?.data?.message || 'Could not change password');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="bnx-login-form" noValidate>
                <header className="bnx-login-form-head">
                  <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="bnx-login-logo" style={{ width: 52 }} />
                  <h2>
                    <Lock size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    {forced ? 'Password change required' : 'Change password'}
                  </h2>
                  <p>
                    {forced
                      ? `For security, passwords must be updated every ${maxDays} days.`
                      : 'Choose a new password for your account.'}
                  </p>
                </header>

                <label className="bnx-field">
                  <span>Current password</span>
                  <PasswordField name="old_password" autoComplete="current-password" />
                  <ErrorMessage name="old_password" component="em" />
                </label>

                <label className="bnx-field">
                  <span>New password</span>
                  <PasswordField name="new_password" autoComplete="new-password" />
                  <ErrorMessage name="new_password" component="em" />
                </label>

                <label className="bnx-field">
                  <span>Confirm new password</span>
                  <PasswordField name="new_password_confirmation" autoComplete="new-password" />
                  <ErrorMessage name="new_password_confirmation" component="em" />
                </label>

                <button type="submit" className="bnx-login-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Update password'}
                </button>

                {!forced && (
                  <button type="button" className="bnx-text-link" onClick={goHome}>
                    Cancel
                  </button>
                )}
              </Form>
            )}
          </Formik>
        </aside>
      </div>
    </div>
  );
}
