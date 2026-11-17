/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Super Admin — Support Ticket Management CRUD
 * Edit Date: 2026-11-14
 */
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  Ticket,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Eye,
  Send,
  Building2,
} from 'lucide-react';
import { companyServices } from '../../../../redux/company/company.services';
import { supportServices } from '../../../../redux/support/support.services';
import { Loader } from '../../../../components/ui/Loader';
import '../_shared/SuperAdminPages.scss';

const STATUSES = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function statusLabel(s: string) {
  return String(s || '').replace(/_/g, ' ');
}

const createSchema = Yup.object({
  companyID: Yup.mixed().required('Company required'),
  subject: Yup.string().required('Subject required'),
  category: Yup.string().required('Category required'),
  priority: Yup.string().required('Priority required'),
  description: Yup.string().required('Description required'),
  shop_name: Yup.string().nullable(),
});

const editSchema = Yup.object({
  subject: Yup.string().required('Subject required'),
  category: Yup.string().required('Category required'),
  priority: Yup.string().required('Priority required'),
  status: Yup.string().required('Status required'),
  assigned_to: Yup.mixed().nullable(),
  shop_name: Yup.string().nullable(),
  description: Yup.string().nullable(),
});

export default function ManageTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editing, setEditing] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data }, { data: cos }] = await Promise.all([
        supportServices.http.get('/panel/support/tickets', {
          params: {
            q: q || undefined,
            status: status || undefined,
            priority: priority || undefined,
            scope: 'all',
            limit: 100,
          },
        }),
        companyServices.http.get('/panel/companies'),
      ]);
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setCompanies(cos.items || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || e.message || 'Failed to load tickets');
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const { data } = await supportServices.http.get('/panel/support/staff-options');
      setStaff(data.staff || []);
    } catch {
      setStaff([]);
    }
  };

  useEffect(() => {
    load();
    loadStaff();
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

  const openCreate = () => {
    setMode('create');
    setEditing(null);
    setDetail(null);
    setFormOpen(true);
  };

  const openEdit = async (t: any) => {
    setMode('edit');
    setEditing(t);
    setDetail(null);
    setFormOpen(true);
  };

  const openView = async (t: any) => {
    setMode('view');
    setEditing(t);
    setReply('');
    try {
      const { data } = await supportServices.http.get(`/panel/support/tickets/${t.id}`);
      setDetail(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load ticket');
      return;
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setDetail(null);
    setReply('');
  };

  const onDelete = async (t: any) => {
    if (!confirm(`Delete ticket ${t.ticket_no}?`)) return;
    try {
      await supportServices.http.delete(`/panel/support/tickets/${t.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const sendReply = async () => {
    if (!editing?.id || !reply.trim()) return;
    setReplying(true);
    try {
      const { data } = await supportServices.http.post(`/panel/support/tickets/${editing.id}/reply`, {
        message: reply.trim(),
        is_internal: false,
      });
      setDetail(data);
      setReply('');
      toast.success('Reply sent');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Reply failed');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="sa-page">
      <div className="spr-panel">
        <div className="spr-toolbar">
          <div className="spr-hero">
            <span className="spr-hero-icon"><Ticket size={20} /></span>
            <div>
              <h1>Support Ticket Management</h1>
              <p>{total} ticket(s) across companies</p>
            </div>
          </div>
          <div className="spr-toolbar-actions">
            <label className="spr-search">
              <Search size={15} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                placeholder="Search ticket, subject, shop…"
              />
            </label>
            <select className="spr-input" style={{ maxWidth: 150, borderRadius: 999 }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <select className="spr-input" style={{ maxWidth: 130, borderRadius: 999 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button type="button" className="spr-btn ghost" onClick={load}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button type="button" className="spr-btn primary" onClick={openCreate}>
              <Plus size={15} /> Add Ticket
            </button>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty"><Loader /></div>
        ) : tickets.length === 0 ? (
          <div className="sa-empty">
            <Ticket size={36} />
            <h2>No tickets found</h2>
            <p>Create a ticket for a company or wait for shop users to raise support requests.</p>
          </div>
        ) : (
          <div className="spr-table-wrap">
            <table className="spr-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Subject</th>
                  <th>Shop</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.ticket_no}</strong></td>
                    <td>
                      {t.subject}
                      <div className="spr-muted">{t.category}</div>
                    </td>
                    <td>{t.shop_name || '—'}</td>
                    <td><span className="spr-badge is-warn">{t.priority}</span></td>
                    <td><span className={`spr-badge ${t.status === 'resolved' || t.status === 'closed' ? 'is-on' : 'is-warn'}`}>{statusLabel(t.status)}</span></td>
                    <td>{t.assigned_to_name || 'Unassigned'}</td>
                    <td className="spr-muted">{t.updated_at ? new Date(t.updated_at).toLocaleString() : '—'}</td>
                    <td className="spr-actions">
                      <button type="button" className="icon-action" title="View" onClick={() => openView(t)}>
                        <Eye size={15} />
                      </button>
                      <button type="button" className="icon-action" title="Edit" onClick={() => openEdit(t)}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-action danger" title="Delete" onClick={() => onDelete(t)}>
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
                  <span className="spr-oc-icon"><Ticket size={18} /></span>
                  <div>
                    <h2>
                      {mode === 'create' && 'Add Ticket'}
                      {mode === 'edit' && `Edit ${editing?.ticket_no || ''}`}
                      {mode === 'view' && (editing?.ticket_no || 'Ticket')}
                    </h2>
                    <p>Super Admin support console</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              {mode === 'create' && (
                <Formik
                  initialValues={{
                    companyID: '',
                    subject: '',
                    category: 'General',
                    priority: 'medium',
                    description: '',
                    shop_name: '',
                  }}
                  validationSchema={createSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      const company = companies.find(
                        (c) => String(c.id || c.companyID) === String(values.companyID)
                      );
                      await supportServices.http.post('/panel/support/tickets', {
                        companyID: Number(values.companyID),
                        subject: values.subject,
                        category: values.category,
                        priority: values.priority,
                        description: values.description,
                        shop_name: values.shop_name || company?.name || null,
                      });
                      toast.success('Ticket created');
                      closeForm();
                      load();
                    } catch (e: any) {
                      toast.error(e.response?.data?.message || 'Create failed');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ setFieldValue, errors, touched, isSubmitting, values }) => (
                    <Form className="spr-oc-body">
                      <section className="spr-section">
                        <h3><Building2 size={15} /> New ticket</h3>
                        <div className="spr-form-grid">
                          <div className="span-2">
                            <label>Company</label>
                            <Field
                              as="select"
                              name="companyID"
                              className="spr-input"
                              onChange={(e: any) => {
                                const id = e.target.value;
                                setFieldValue('companyID', id);
                                const c = companies.find((x) => String(x.id || x.companyID) === String(id));
                                if (c?.name) setFieldValue('shop_name', c.name);
                              }}
                            >
                              <option value="">Select company</option>
                              {companies.map((c) => (
                                <option key={c.id || c.companyID} value={c.id || c.companyID}>
                                  {c.name}
                                </option>
                              ))}
                            </Field>
                            {touched.companyID && errors.companyID && (
                              <p className="spr-error">{String(errors.companyID)}</p>
                            )}
                          </div>
                          <div className="span-2">
                            <label>Subject</label>
                            <Field name="subject" className="spr-input" />
                            {touched.subject && errors.subject && (
                              <p className="spr-error">{String(errors.subject)}</p>
                            )}
                          </div>
                          <div>
                            <label>Category</label>
                            <Field name="category" className="spr-input" />
                          </div>
                          <div>
                            <label>Priority</label>
                            <Field as="select" name="priority" className="spr-input">
                              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                            </Field>
                          </div>
                          <div className="span-2">
                            <label>Shop name</label>
                            <Field name="shop_name" className="spr-input" value={values.shop_name} />
                          </div>
                          <div className="span-2">
                            <label>Description</label>
                            <Field as="textarea" name="description" rows={4} className="spr-input" />
                            {touched.description && errors.description && (
                              <p className="spr-error">{String(errors.description)}</p>
                            )}
                          </div>
                        </div>
                      </section>
                      <div className="spr-oc-actions">
                        <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                        <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                          <Save size={15} /> Create
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              {mode === 'edit' && editing && (
                <Formik
                  enableReinitialize
                  initialValues={{
                    subject: editing.subject || '',
                    category: editing.category || 'General',
                    priority: editing.priority || 'medium',
                    status: editing.status || 'open',
                    assigned_to: editing.assigned_to || '',
                    shop_name: editing.shop_name || '',
                    description: editing.description || '',
                  }}
                  validationSchema={editSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      await supportServices.http.patch(`/panel/support/tickets/${editing.id}`, {
                        subject: values.subject,
                        category: values.category,
                        priority: values.priority,
                        status: values.status,
                        assigned_to: values.assigned_to === '' ? null : Number(values.assigned_to),
                        shop_name: values.shop_name || null,
                        description: values.description || null,
                      });
                      toast.success('Ticket updated');
                      closeForm();
                      load();
                    } catch (e: any) {
                      toast.error(e.response?.data?.message || 'Update failed');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form className="spr-oc-body">
                      <section className="spr-section">
                        <h3><Pencil size={15} /> Edit ticket</h3>
                        <div className="spr-form-grid">
                          <div className="span-2">
                            <label>Subject</label>
                            <Field name="subject" className="spr-input" />
                            {touched.subject && errors.subject && (
                              <p className="spr-error">{String(errors.subject)}</p>
                            )}
                          </div>
                          <div>
                            <label>Category</label>
                            <Field name="category" className="spr-input" />
                          </div>
                          <div>
                            <label>Priority</label>
                            <Field as="select" name="priority" className="spr-input">
                              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                            </Field>
                          </div>
                          <div>
                            <label>Status</label>
                            <Field as="select" name="status" className="spr-input">
                              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                            </Field>
                          </div>
                          <div>
                            <label>Assign to</label>
                            <Field as="select" name="assigned_to" className="spr-input">
                              <option value="">Unassigned</option>
                              {staff.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </Field>
                          </div>
                          <div className="span-2">
                            <label>Shop name</label>
                            <Field name="shop_name" className="spr-input" />
                          </div>
                          <div className="span-2">
                            <label>Description</label>
                            <Field as="textarea" name="description" rows={4} className="spr-input" />
                          </div>
                        </div>
                      </section>
                      <div className="spr-oc-actions">
                        <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                        <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                          <Save size={15} /> Update
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              {mode === 'view' && detail && (
                <div className="spr-oc-body">
                  <section className="spr-section">
                    <h3><Eye size={15} /> {detail.ticket?.subject}</h3>
                    <div className="spr-muted" style={{ marginBottom: '0.75rem' }}>
                      {detail.ticket?.category} · {detail.ticket?.priority} · {statusLabel(detail.ticket?.status)} ·{' '}
                      {detail.ticket?.shop_name || '—'}
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{detail.ticket?.description}</p>
                  </section>
                  <section className="spr-section">
                    <h3>Messages</h3>
                    <div className="sa-msg-list">
                      {(detail.messages || []).length === 0 ? (
                        <p className="spr-muted">No messages yet.</p>
                      ) : (
                        (detail.messages || []).map((m: any) => (
                          <div key={m.id} className="sa-msg">
                            <strong>{m.sender_name || m.sender_role || 'User'}</strong>
                            <p>{m.message}</p>
                            <div className="spr-muted">
                              {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                              {m.is_internal ? ' · internal' : ''}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <label>Reply</label>
                    <textarea
                      className="spr-input"
                      rows={3}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply…"
                    />
                  </section>
                  <div className="spr-oc-actions">
                    <button type="button" className="spr-btn ghost" onClick={closeForm}>Close</button>
                    <button type="button" className="spr-btn primary" disabled={replying || !reply.trim()} onClick={sendReply}>
                      <Send size={15} /> {replying ? 'Sending…' : 'Send reply'}
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
