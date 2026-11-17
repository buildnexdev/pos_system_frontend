/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Super Admin — Payment History CRUD + Mail Config
 * Edit Date: 2026-11-14
 */
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Mail,
  Building2,
  Hash,
  BadgeCheck,
  Send,
} from 'lucide-react';
import { companyServices } from '../../../../redux/company/company.services';
import { Loader } from '../../../../components/ui/Loader';
import '../_shared/SuperAdminPages.scss';

const str = () => Yup.string().transform((v) => (v == null ? '' : v)).nullable();

const paymentSchema = Yup.object({
  companyID: Yup.mixed().required('Company is required'),
  invoice_no: str(),
  amount: Yup.number().typeError('Amount required').min(0, 'Invalid amount').required('Amount required'),
  currency: str(),
  payment_method: str(),
  payment_status: str().required('Status required'),
  paid_at: str(),
  reference_no: str(),
  notify_email: Yup.string()
    .transform((v) => (v == null ? '' : v))
    .nullable()
    .test('email', 'Invalid email', (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
  notes: str(),
  send_mail: Yup.boolean(),
});

const mailSchema = Yup.object({
  from_name: str().required('From name required'),
  from_email: Yup.string().email('Invalid email').required('From email required'),
  smtp_host: str().required('SMTP host required'),
  smtp_port: Yup.number().required('Port required'),
  smtp_user: Yup.string().email('Invalid user').required('SMTP user required'),
  smtp_pass: str(),
  smtp_secure: Yup.boolean(),
  is_active: Yup.boolean(),
});

const emptyPayment = {
  companyID: '',
  invoice_no: '',
  amount: '',
  currency: 'INR',
  payment_method: 'upi',
  payment_status: 'paid',
  paid_at: '',
  reference_no: '',
  notify_email: '',
  notes: '',
  send_mail: true,
};

function toPaymentValues(item?: any | null) {
  if (!item) return { ...emptyPayment };
  return {
    companyID: String(item.companyID || ''),
    invoice_no: item.invoice_no || '',
    amount: item.amount != null ? String(item.amount) : '',
    currency: item.currency || 'INR',
    payment_method: item.payment_method || 'upi',
    payment_status: item.payment_status || 'pending',
    paid_at: item.paid_at ? String(item.paid_at).slice(0, 16).replace(' ', 'T') : '',
    reference_no: item.reference_no || '',
    notify_email: item.notify_email || item.company_email || '',
    notes: item.notes || '',
    send_mail: false,
  };
}

function statusClass(s: string) {
  const v = String(s || '').toLowerCase();
  if (v === 'paid') return 'is-on';
  if (v === 'failed' || v === 'refunded') return 'is-danger';
  return 'is-warn';
}

export default function PaymentHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailVisible, setMailVisible] = useState(false);
  const [mailConfig, setMailConfig] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: pay }, { data: cos }] = await Promise.all([
        companyServices.http.get('/panel/payment-history', { params: q ? { q } : {} }),
        companyServices.http.get('/panel/companies'),
      ]);
      setItems(pay.items || []);
      setCompanies(cos.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadMail = async () => {
    try {
      const { data } = await companyServices.http.get('/panel/mail-config');
      setMailConfig(data.item || null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load mail config');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (formOpen) {
      requestAnimationFrame(() => setFormVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setFormVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen]);

  useEffect(() => {
    if (mailOpen) {
      loadMail();
      requestAnimationFrame(() => setMailVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setMailVisible(false);
    }
  }, [mailOpen]);

  const filtered = items.filter((item) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (
      String(item.company_name || '').toLowerCase().includes(term) ||
      String(item.invoice_no || '').toLowerCase().includes(term) ||
      String(item.reference_no || '').toLowerCase().includes(term) ||
      String(item.notify_email || '').toLowerCase().includes(term) ||
      String(item.payment_status || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const onDelete = async (item: any) => {
    if (!confirm(`Delete payment ${item.invoice_no || item.id}?`)) return;
    try {
      await companyServices.http.delete(`/panel/payment-history/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="sa-page">
      <div className="spr-panel">
        <div className="spr-toolbar">
          <div className="spr-hero">
            <span className="spr-hero-icon">
              <CreditCard size={20} />
            </span>
            <div>
              <h1>Payment History</h1>
              <p>Total count: {filtered.length}</p>
            </div>
          </div>
          <div className="spr-toolbar-actions">
            <label className="spr-search">
              <Search size={15} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search company, invoice, ref…"
              />
            </label>
            <button type="button" className="spr-btn ghost" onClick={() => setMailOpen(true)}>
              <Mail size={15} /> Mail Config
            </button>
            <button type="button" className="spr-btn primary" onClick={openCreate}>
              <Plus size={15} /> Add Payment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty">
            <CreditCard size={36} />
            <h2>No payments yet</h2>
            <p>Add a company payment record. Optionally email the company from buildnexdev@gmail.com.</p>
          </div>
        ) : (
          <div className="spr-table-wrap">
            <table className="spr-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Company</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Paid at</th>
                  <th>Notify</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.company_name || '—'}</strong>
                      <div className="spr-muted">{item.company_code || ''}</div>
                    </td>
                    <td>{item.invoice_no || '—'}</td>
                    <td>
                      <strong>
                        {item.currency || 'INR'} {Number(item.amount || 0).toLocaleString()}
                      </strong>
                      {item.reference_no && <div className="spr-muted">{item.reference_no}</div>}
                    </td>
                    <td>{item.payment_method || '—'}</td>
                    <td>
                      <span className={`spr-badge ${statusClass(item.payment_status)}`}>
                        {item.payment_status || '—'}
                      </span>
                    </td>
                    <td>{item.paid_at ? String(item.paid_at).replace('T', ' ').slice(0, 16) : '—'}</td>
                    <td className="spr-muted">{item.notify_email || '—'}</td>
                    <td className="spr-actions">
                      <button type="button" className="icon-action" title="Edit" onClick={() => openEdit(item)}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-action danger" title="Delete" onClick={() => onDelete(item)}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen &&
        createPortal(
          <div className={`spr-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="spr-backdrop" onClick={closeForm} />
            <aside className={`spr-offcanvas ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <div className="spr-oc-head">
                <div className="spr-oc-title">
                  <span className="spr-oc-icon"><CreditCard size={18} /></span>
                  <div>
                    <h2>{editing ? 'Edit Payment' : 'Add Payment'}</h2>
                    <p>Platform payment record</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={toPaymentValues(editing)}
                validationSchema={paymentSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const payload = {
                      companyID: Number(values.companyID),
                      invoice_no: values.invoice_no || null,
                      amount: Number(values.amount),
                      currency: values.currency || 'INR',
                      payment_method: values.payment_method || null,
                      payment_status: values.payment_status || 'pending',
                      paid_at: values.paid_at ? values.paid_at.replace('T', ' ') + ':00' : null,
                      reference_no: values.reference_no || null,
                      notify_email: values.notify_email || null,
                      notes: values.notes || null,
                      send_mail: !!values.send_mail,
                    };
                    let res;
                    if (editing) {
                      res = await companyServices.http.put(`/panel/payment-history/${editing.id}`, payload);
                    } else {
                      res = await companyServices.http.post('/panel/payment-history', payload);
                    }
                    toast.success(res.data?.message || 'Saved');
                    if (res.data?.data?.mailSent) toast.success('Mail sent');
                    if (res.data?.data?.mailError) toast.error(res.data.data.mailError);
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                  <Form className="spr-oc-body">
                    <section className="spr-section">
                      <h3><Building2 size={15} /> Payment details</h3>
                      <div className="spr-form-grid">
                        <div className="span-2">
                          <label><Building2 size={14} className="lbl-icon c-orange" /> Company</label>
                          <Field
                            as="select"
                            name="companyID"
                            className="spr-input"
                            onChange={(e: any) => {
                              const id = e.target.value;
                              setFieldValue('companyID', id);
                              const c = companies.find((x) => String(x.id || x.companyID) === String(id));
                              if (c?.email && !values.notify_email) setFieldValue('notify_email', c.email);
                            }}
                          >
                            <option value="">Select company</option>
                            {companies.map((c) => (
                              <option key={c.id || c.companyID} value={c.id || c.companyID}>
                                {c.name} {c.code ? `(${c.code})` : ''}
                              </option>
                            ))}
                          </Field>
                          {touched.companyID && errors.companyID && (
                            <p className="spr-error">{String(errors.companyID)}</p>
                          )}
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-slate" /> Invoice No</label>
                          <Field name="invoice_no" className="spr-input" placeholder="INV-001" />
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-violet" /> Reference</label>
                          <Field name="reference_no" className="spr-input" placeholder="Txn / UTR" />
                        </div>
                        <div>
                          <label>Amount</label>
                          <Field name="amount" type="number" className="spr-input" placeholder="0.00" />
                          {touched.amount && errors.amount && (
                            <p className="spr-error">{String(errors.amount)}</p>
                          )}
                        </div>
                        <div>
                          <label>Currency</label>
                          <Field as="select" name="currency" className="spr-input">
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </Field>
                        </div>
                        <div>
                          <label>Method</label>
                          <Field as="select" name="payment_method" className="spr-input">
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                            <option value="bank">Bank transfer</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                          </Field>
                        </div>
                        <div>
                          <label><BadgeCheck size={14} className="lbl-icon c-teal" /> Status</label>
                          <Field as="select" name="payment_status" className="spr-input">
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </Field>
                        </div>
                        <div>
                          <label>Paid at</label>
                          <Field name="paid_at" type="datetime-local" className="spr-input" />
                        </div>
                        <div className="span-2">
                          <label><Mail size={14} className="lbl-icon c-sky" /> Notify email</label>
                          <Field name="notify_email" type="email" className="spr-input" placeholder="company@email.com" />
                        </div>
                        <div className="span-2">
                          <label>Notes</label>
                          <Field as="textarea" name="notes" rows={3} className="spr-input" placeholder="Optional notes" />
                        </div>
                        <div className="span-2">
                          <label className="spr-active">
                            <input
                              type="checkbox"
                              checked={!!values.send_mail}
                              onChange={(e) => setFieldValue('send_mail', e.target.checked)}
                            />
                            Send mail from buildnexdev@gmail.com
                          </label>
                        </div>
                      </div>
                    </section>

                    <div className="spr-oc-actions">
                      <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><span className="spr-spinner" /> Saving...</>
                        ) : (
                          <><Save size={15} /> {editing ? 'Update' : 'Save'}</>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </aside>
          </div>,
          document.body
        )}

      {mailOpen &&
        createPortal(
          <div className={`spr-overlay ${mailVisible ? 'is-open' : ''}`}>
            <div className="spr-backdrop" onClick={() => setMailOpen(false)} />
            <aside className={`spr-offcanvas ${mailVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <div className="spr-oc-head">
                <div className="spr-oc-title">
                  <span className="spr-oc-icon"><Mail size={18} /></span>
                  <div>
                    <h2>Mail Config</h2>
                    <p>Default sender: buildnexdev@gmail.com</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={() => setMailOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={{
                  from_name: mailConfig?.from_name || 'BuildNex ShopOS',
                  from_email: mailConfig?.from_email || 'buildnexdev@gmail.com',
                  smtp_host: mailConfig?.smtp_host || 'smtp.gmail.com',
                  smtp_port: mailConfig?.smtp_port || 587,
                  smtp_user: mailConfig?.smtp_user || 'buildnexdev@gmail.com',
                  smtp_pass: '',
                  smtp_secure: !!mailConfig?.smtp_secure,
                  is_active: mailConfig?.is_active !== 0,
                }}
                validationSchema={mailSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const { data } = await companyServices.http.put('/panel/mail-config', {
                      ...values,
                      smtp_pass: values.smtp_pass || undefined,
                    });
                    setMailConfig(data.item || values);
                    toast.success('Mail config saved');
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                  <Form className="spr-oc-body">
                    <section className="spr-section">
                      <h3><Mail size={15} /> SMTP settings</h3>
                      <p className="spr-hint" style={{ marginBottom: '0.75rem' }}>
                        Use a Gmail App Password for buildnexdev@gmail.com (leave password blank to keep current).
                      </p>
                      <div className="spr-form-grid">
                        <div>
                          <label>From name</label>
                          <Field name="from_name" className="spr-input" />
                          {touched.from_name && errors.from_name && (
                            <p className="spr-error">{String(errors.from_name)}</p>
                          )}
                        </div>
                        <div>
                          <label>From email</label>
                          <Field name="from_email" type="email" className="spr-input" />
                        </div>
                        <div>
                          <label>SMTP host</label>
                          <Field name="smtp_host" className="spr-input" />
                        </div>
                        <div>
                          <label>SMTP port</label>
                          <Field name="smtp_port" type="number" className="spr-input" />
                        </div>
                        <div>
                          <label>SMTP user</label>
                          <Field name="smtp_user" type="email" className="spr-input" />
                        </div>
                        <div>
                          <label>App password</label>
                          <Field
                            name="smtp_pass"
                            type="password"
                            className="spr-input"
                            placeholder={mailConfig?.has_password ? '•••••••• (leave blank to keep)' : 'Gmail app password'}
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="span-2">
                          <label className="spr-active">
                            <input
                              type="checkbox"
                              checked={!!values.smtp_secure}
                              onChange={(e) => setFieldValue('smtp_secure', e.target.checked)}
                            />
                            Use SSL/TLS (secure)
                          </label>
                          <label className="spr-active">
                            <input
                              type="checkbox"
                              checked={!!values.is_active}
                              onChange={(e) => setFieldValue('is_active', e.target.checked)}
                            />
                            Active
                          </label>
                        </div>
                      </div>
                    </section>

                    <div className="spr-oc-actions">
                      <button
                        type="button"
                        className="spr-btn ghost"
                        onClick={async () => {
                          try {
                            await companyServices.http.post('/panel/mail-config/test', {
                              to: values.from_email || 'buildnexdev@gmail.com',
                            });
                            toast.success('Test mail sent');
                          } catch (e: any) {
                            toast.error(e.response?.data?.message || 'Test failed');
                          }
                        }}
                      >
                        <Send size={15} /> Send test
                      </button>
                      <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving…' : (<><Save size={15} /> Save mail</>)}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
