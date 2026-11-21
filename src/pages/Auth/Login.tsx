/**
 * Author: Nandhakumar
 * Version: 0.0.4
 * Desc: Brand-first login — email/phone, show password, OTP reset, create company
 * Edit Date: 2026-11-14
 */

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import { loginRequest } from '../../redux/auth/auth.action';
import { authService } from '../../redux/auth/auth.services';
import { RootState } from '../../redux/store';
import { COMPANY_LOGO, COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/brand';
import { isPanelUser, isSuperAdminUser } from '../../utils/access';
import './Login.scss';

function safePanelPath(path?: string | null) {
  if (!path || typeof path !== 'string') return null;
  if (!path.startsWith('/panel')) return null;
  return path;
}

type PanelMode = 'login' | 'forgot' | 'register';

const PLATFORM_MAIL = 'buildnexdev@gmail.com';

const HERO_IMG =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&auto=format&fit=crop&q=80';

const loginSchema = Yup.object({
  login: Yup.string().trim().required('Email or phone is required'),
  password: Yup.string().required('Password is required'),
});

const forgotStartSchema = Yup.object({
  login: Yup.string().trim().required('Email or phone is required'),
});

const forgotResetSchema = Yup.object({
  otp: Yup.string()
    .trim()
    .matches(/^\d{6}$/, 'Enter the 6-digit OTP')
    .required('OTP is required'),
  new_password: Yup.string().min(6, 'At least 6 characters').required('New password is required'),
  new_password_confirmation: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Confirm password'),
});

const registerSchema = Yup.object({
  company_name: Yup.string().trim().required('Company name is required'),
  contact_name: Yup.string().trim().required('Your name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .trim()
    .test('phone', 'Enter a valid 10-digit phone', (v) => String(v || '').replace(/\D/g, '').length >= 10)
    .required('Phone is required'),
  city: Yup.string().trim().nullable(),
  message: Yup.string().trim().nullable(),
});

function PasswordField({
  name,
  placeholder,
  autoComplete,
}: {
  name: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="bnx-password-wrap">
      <Field
        name={name}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder || '••••••••'}
      />
      <button
        type="button"
        className="bnx-password-toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error, user } = useSelector((s: RootState) => s.auth);
  const [mode, setMode] = useState<PanelMode>('login');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotLogin, setForgotLogin] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const returnTo = safePanelPath((location.state as { from?: string } | null)?.from);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.mustChangePassword) {
        toast('Please change your password to continue', { icon: '🔒' });
        navigate('/change-password', { replace: true });
        return;
      }
      toast.success('Login successful');
      if (returnTo && isPanelUser(user) && !isSuperAdminUser(user)) {
        navigate(returnTo, { replace: true });
        return;
      }
      if (isSuperAdminUser(user)) {
        navigate(returnTo?.startsWith('/panel/companies') ? returnTo : '/panel/companies', {
          replace: true,
        });
      } else if (isPanelUser(user)) {
        navigate('/panel', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, user, returnTo]);

  useEffect(() => {
    try {
      const kick = sessionStorage.getItem('auth_kick_reason');
      if (kick) {
        sessionStorage.removeItem('auth_kick_reason');
        toast.error(kick);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const openForgot = () => {
    setMode('forgot');
    setForgotStep('request');
    setForgotLogin('');
    setMaskedEmail('');
  };

  const panelTitle =
    mode === 'login'
      ? 'Welcome back'
      : mode === 'register'
        ? 'Create company'
        : forgotStep === 'request'
          ? 'Reset password'
          : 'Enter OTP';

  const panelLead =
    mode === 'login'
      ? 'Sign in with email or phone to open your panel.'
      : mode === 'register'
        ? `Requests are sent to ${PLATFORM_MAIL}`
        : forgotStep === 'request'
          ? 'We email a one-time OTP to your registered mail.'
          : `Code sent${maskedEmail ? ` to ${maskedEmail}` : ''}. Set a new password.`;

  return (
    <div className="bnx-login">
      <div className="bnx-login-stage">
        <div className="bnx-login-visual" aria-hidden>
          <img src={HERO_IMG} alt="" className="bnx-login-photo" />
          <div className="bnx-login-visual-shade" />
          <div className="bnx-login-orbit" />
          <div className="bnx-login-grain" />
        </div>

        <header className="bnx-login-hero">
          <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="bnx-login-logo" />
          <h1 className="bnx-login-title">
            One counter.
            <span>Every shop.</span>
          </h1>
          <p className="bnx-login-lead">{COMPANY_TAGLINE}</p>
        </header>

        <aside className={`bnx-login-panel ${mode === 'register' ? 'is-scroll' : ''}`}>
          {mode !== 'login' && (
            <button
              type="button"
              className="bnx-back-link"
              onClick={() => {
                if (mode === 'forgot' && forgotStep === 'reset') setForgotStep('request');
                else setMode('login');
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          <header className="bnx-login-form-head">
            <h2>{panelTitle}</h2>
            <p>
              {mode === 'register' ? (
                <>
                  Requests go to{' '}
                  <a className="bnx-mail-pill" href={`mailto:${PLATFORM_MAIL}`}>
                    <Mail size={12} /> {PLATFORM_MAIL}
                  </a>
                </>
              ) : (
                panelLead
              )}
            </p>
          </header>

          {mode === 'login' && (
            <Formik
              initialValues={{ login: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={(values) => {
                dispatch(loginRequest(values.login.trim(), values.password));
              }}
            >
              <Form className="bnx-login-form" noValidate>
                <label className="bnx-field">
                  <span>Email or phone</span>
                  <Field
                    name="login"
                    type="text"
                    autoComplete="username"
                    placeholder="you@store.com or 9876543210"
                  />
                  <ErrorMessage name="login" component="em" />
                </label>

                <label className="bnx-field">
                  <span>Password</span>
                  <PasswordField name="password" autoComplete="current-password" />
                  <ErrorMessage name="password" component="em" />
                </label>

                <div className="bnx-login-row">
                  <button type="button" className="bnx-text-link" onClick={openForgot}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="bnx-login-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Enter panel'}
                </button>

                <p className="bnx-login-switch">
                  New store?{' '}
                  <button type="button" className="bnx-text-link" onClick={() => setMode('register')}>
                    Create company
                  </button>
                </p>
              </Form>
            </Formik>
          )}

          {mode === 'forgot' && forgotStep === 'request' && (
            <Formik
              initialValues={{ login: forgotLogin }}
              enableReinitialize
              validationSchema={forgotStartSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setBusy(true);
                  const data = await authService.forgotPassword(values.login.trim());
                  setForgotLogin(values.login.trim());
                  setMaskedEmail(data.emailMasked || '');
                  setForgotStep('reset');
                  toast.success(data.message || 'OTP sent to your registered email');
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Could not send OTP');
                } finally {
                  setBusy(false);
                  setSubmitting(false);
                }
              }}
            >
              <Form className="bnx-login-form" noValidate>
                <label className="bnx-field">
                  <span>Email or phone</span>
                  <Field name="login" type="text" placeholder="Registered email or phone" />
                  <ErrorMessage name="login" component="em" />
                </label>
                <button type="submit" className="bnx-login-submit" disabled={busy}>
                  {busy ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </Form>
            </Formik>
          )}

          {mode === 'forgot' && forgotStep === 'reset' && (
            <Formik
              initialValues={{ otp: '', new_password: '', new_password_confirmation: '' }}
              validationSchema={forgotResetSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setBusy(true);
                  const data = await authService.resetPasswordWithOtp({
                    login: forgotLogin,
                    otp: values.otp.trim(),
                    new_password: values.new_password,
                    new_password_confirmation: values.new_password_confirmation,
                  });
                  toast.success(data.message || 'Password updated');
                  setMode('login');
                  setForgotStep('request');
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Could not reset password');
                } finally {
                  setBusy(false);
                  setSubmitting(false);
                }
              }}
            >
              <Form className="bnx-login-form" noValidate>
                <label className="bnx-field">
                  <span>OTP</span>
                  <Field name="otp" type="text" inputMode="numeric" placeholder="6-digit code" />
                  <ErrorMessage name="otp" component="em" />
                </label>
                <label className="bnx-field">
                  <span>New password</span>
                  <PasswordField name="new_password" autoComplete="new-password" />
                  <ErrorMessage name="new_password" component="em" />
                </label>
                <label className="bnx-field">
                  <span>Confirm password</span>
                  <PasswordField name="new_password_confirmation" autoComplete="new-password" />
                  <ErrorMessage name="new_password_confirmation" component="em" />
                </label>
                <button type="submit" className="bnx-login-submit" disabled={busy}>
                  {busy ? 'Updating…' : 'Update password'}
                </button>
                <p className="bnx-login-switch">
                  Didn’t get it?{' '}
                  <button
                    type="button"
                    className="bnx-text-link"
                    disabled={busy}
                    onClick={async () => {
                      try {
                        setBusy(true);
                        const data = await authService.forgotPassword(forgotLogin);
                        setMaskedEmail(data.emailMasked || maskedEmail);
                        toast.success('OTP resent');
                      } catch (e: any) {
                        toast.error(e.response?.data?.message || 'Could not resend OTP');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Resend OTP
                  </button>
                </p>
              </Form>
            </Formik>
          )}

          {mode === 'register' && (
            <Formik
              initialValues={{
                company_name: '',
                contact_name: '',
                email: '',
                phone: '',
                city: '',
                message: '',
              }}
              validationSchema={registerSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  setBusy(true);
                  const data = await authService.companyRequest(values);
                  toast.success(data.message || 'Request submitted');
                  resetForm();
                  setMode('login');
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Could not submit request');
                } finally {
                  setBusy(false);
                  setSubmitting(false);
                }
              }}
            >
              <Form className="bnx-login-form" noValidate>
                <label className="bnx-field">
                  <span>Company name</span>
                  <Field name="company_name" type="text" placeholder="Your store / company" />
                  <ErrorMessage name="company_name" component="em" />
                </label>
                <label className="bnx-field">
                  <span>Contact name</span>
                  <Field name="contact_name" type="text" placeholder="Your full name" />
                  <ErrorMessage name="contact_name" component="em" />
                </label>
                <div className="bnx-field-row">
                  <label className="bnx-field">
                    <span>Email</span>
                    <Field name="email" type="email" placeholder="you@store.com" />
                    <ErrorMessage name="email" component="em" />
                  </label>
                  <label className="bnx-field">
                    <span>Phone</span>
                    <Field name="phone" type="tel" placeholder="10-digit mobile" />
                    <ErrorMessage name="phone" component="em" />
                  </label>
                </div>
                <label className="bnx-field">
                  <span>City (optional)</span>
                  <Field name="city" type="text" placeholder="City" />
                </label>
                <label className="bnx-field">
                  <span>Message (optional)</span>
                  <Field
                    name="message"
                    as="textarea"
                    rows={3}
                    placeholder="Tell us about your shop"
                    className="bnx-textarea"
                  />
                </label>
                <button type="submit" className="bnx-login-submit" disabled={busy}>
                  {busy ? 'Submitting…' : 'Submit registration'}
                </button>
              </Form>
            </Formik>
          )}
        </aside>
      </div>
    </div>
  );
}
