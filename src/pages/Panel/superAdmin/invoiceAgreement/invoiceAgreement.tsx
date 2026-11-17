/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Super Admin — Invoice & Agreement CRUD
 * Edit Date: 2026-11-14
 */
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Building2,
  Hash,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { companyServices } from '../../../../redux/company/company.services';
import { Loader } from '../../../../components/ui/Loader';
import '../_shared/SuperAdminPages.scss';

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/i, '')
  .replace(/\/$/, '');

function mediaUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_ORIGIN || window.location.origin}${path}`;
  return path;
}

const str = () => Yup.string().transform((v) => (v == null ? '' : v)).nullable();

const schema = Yup.object({
  companyID: Yup.mixed().required('Company is required'),
  doc_type: str().required('Type required'),
  title: str().required('Title is required'),
  invoice_no: str(),
  amount: Yup.mixed().nullable(),
  currency: str(),
  status: str().required('Status required'),
  issue_date: str(),
  due_date: str(),
  file_url: str(),
  notes: str(),
});

const empty = {
  companyID: '',
  doc_type: 'invoice',
  title: '',
  invoice_no: '',
  amount: '',
  currency: 'INR',
  status: 'draft',
  issue_date: '',
  due_date: '',
  file_url: '',
  notes: '',
};

function toValues(item?: any | null) {
  if (!item) return { ...empty };
  return {
    companyID: String(item.companyID || ''),
    doc_type: item.doc_type || 'invoice',
    title: item.title || '',
    invoice_no: item.invoice_no || '',
    amount: item.amount != null ? String(item.amount) : '',
    currency: item.currency || 'INR',
    status: item.status || 'draft',
    issue_date: item.issue_date ? String(item.issue_date).slice(0, 10) : '',
    due_date: item.due_date ? String(item.due_date).slice(0, 10) : '',
    file_url: item.file_url || '',
    notes: item.notes || '',
  };
}

function statusClass(s: string) {
  const v = String(s || '').toLowerCase();
  if (v === 'signed' || v === 'paid' || v === 'active') return 'is-on';
  if (v === 'cancelled' || v === 'expired') return 'is-danger';
  return 'is-warn';
}

export default function InvoiceAgreementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [docType, setDocType] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: list }, { data: cos }] = await Promise.all([
        companyServices.http.get('/panel/invoice-agreement', {
          params: { q: q || undefined, doc_type: docType || undefined },
        }),
        companyServices.http.get('/panel/companies'),
      ]);
      setItems(list.items || []);
      setCompanies(cos.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
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

  const filtered = items.filter((item) => {
    const term = q.trim().toLowerCase();
    if (docType && item.doc_type !== docType) return false;
    if (!term) return true;
    return (
      String(item.company_name || '').toLowerCase().includes(term) ||
      String(item.title || '').toLowerCase().includes(term) ||
      String(item.invoice_no || '').toLowerCase().includes(term) ||
      String(item.status || '').toLowerCase().includes(term)
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
    setUploading(false);
  };

  const onDelete = async (item: any) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await companyServices.http.delete(`/panel/invoice-agreement/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const uploadFile = async (file: File, setFieldValue: (f: string, v: any) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await companyServices.http.post('/panel/upload/company-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      setFieldValue('file_url', url);
      toast.success('File uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sa-page">
      <div className="spr-panel">
        <div className="spr-toolbar">
          <div className="spr-hero">
            <span className="spr-hero-icon"><FileText size={20} /></span>
            <div>
              <h1>Invoice & Agreement</h1>
              <p>Total count: {filtered.length}</p>
            </div>
          </div>
          <div className="spr-toolbar-actions">
            <label className="spr-search">
              <Search size={15} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, invoice…" />
            </label>
            <select
              className="spr-input"
              style={{ maxWidth: 140, borderRadius: 999 }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">All types</option>
              <option value="invoice">Invoice</option>
              <option value="agreement">Agreement</option>
            </select>
            <button type="button" className="spr-btn primary" onClick={openCreate}>
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty">
            <FileText size={36} />
            <h2>No invoices or agreements yet</h2>
            <p>Create invoices and store signed agreements for each company.</p>
          </div>
        ) : (
          <div className="spr-table-wrap">
            <table className="spr-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>No.</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>File</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td><span className="spr-badge is-warn">{item.doc_type}</span></td>
                    <td><strong>{item.title}</strong></td>
                    <td>
                      {item.company_name || '—'}
                      <div className="spr-muted">{item.company_code || ''}</div>
                    </td>
                    <td>{item.invoice_no || '—'}</td>
                    <td>
                      {item.amount != null
                        ? `${item.currency || 'INR'} ${Number(item.amount).toLocaleString()}`
                        : '—'}
                    </td>
                    <td><span className={`spr-badge ${statusClass(item.status)}`}>{item.status}</span></td>
                    <td>
                      <div className="spr-muted">Issue: {item.issue_date ? String(item.issue_date).slice(0, 10) : '—'}</div>
                      <div className="spr-muted">Due: {item.due_date ? String(item.due_date).slice(0, 10) : '—'}</div>
                    </td>
                    <td>
                      {item.file_url ? (
                        <a href={mediaUrl(item.file_url)} target="_blank" rel="noreferrer" className="spr-doc-preview-link">
                          View <ExternalLink size={12} />
                        </a>
                      ) : '—'}
                    </td>
                    <td className="spr-actions">
                      <button type="button" className="icon-action" onClick={() => openEdit(item)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button type="button" className="icon-action danger" onClick={() => onDelete(item)} title="Delete">
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
                  <span className="spr-oc-icon"><FileText size={18} /></span>
                  <div>
                    <h2>{editing ? 'Edit' : 'Add'} Invoice / Agreement</h2>
                    <p>Company billing & contracts</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={toValues(editing)}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const payload = {
                      companyID: Number(values.companyID),
                      doc_type: values.doc_type,
                      title: values.title,
                      invoice_no: values.invoice_no || null,
                      amount: values.amount === '' || values.amount == null ? null : Number(values.amount),
                      currency: values.currency || 'INR',
                      status: values.status,
                      issue_date: values.issue_date || null,
                      due_date: values.due_date || null,
                      file_url: values.file_url || null,
                      notes: values.notes || null,
                    };
                    if (editing) {
                      await companyServices.http.put(`/panel/invoice-agreement/${editing.id}`, payload);
                    } else {
                      await companyServices.http.post('/panel/invoice-agreement', payload);
                    }
                    toast.success('Saved');
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
                      <h3><FileText size={15} /> Details</h3>
                      <div className="spr-form-grid">
                        <div className="span-2">
                          <label><Building2 size={14} className="lbl-icon c-orange" /> Company</label>
                          <Field as="select" name="companyID" className="spr-input">
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
                          <label>Type</label>
                          <Field as="select" name="doc_type" className="spr-input">
                            <option value="invoice">Invoice</option>
                            <option value="agreement">Agreement</option>
                          </Field>
                        </div>
                        <div>
                          <label>Status</label>
                          <Field as="select" name="status" className="spr-input">
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="signed">Signed</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                          </Field>
                        </div>
                        <div className="span-2">
                          <label>Title</label>
                          <Field name="title" className="spr-input" placeholder="Title" />
                          {touched.title && errors.title && <p className="spr-error">{String(errors.title)}</p>}
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-slate" /> Invoice / Ref No</label>
                          <Field name="invoice_no" className="spr-input" placeholder="INV-001" />
                        </div>
                        <div>
                          <label>Amount</label>
                          <Field name="amount" type="number" className="spr-input" placeholder="0.00" />
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
                          <label>Issue date</label>
                          <Field name="issue_date" type="date" className="spr-input" />
                        </div>
                        <div>
                          <label>Due / Expiry</label>
                          <Field name="due_date" type="date" className="spr-input" />
                        </div>
                        <div className="span-2">
                          <label>File</label>
                          <div className="spr-doc-file-row">
                            <Field name="file_url" className="spr-input" placeholder="Upload or paste URL" />
                            <label className={`spr-upload-btn ${uploading ? 'is-busy' : ''}`}>
                              <Upload size={15} />
                              {uploading ? 'Uploading…' : 'Upload'}
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                                disabled={uploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = '';
                                  if (file) uploadFile(file, setFieldValue);
                                }}
                              />
                            </label>
                          </div>
                          {values.file_url && (
                            <a
                              href={mediaUrl(values.file_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="spr-doc-preview-link"
                              style={{ marginTop: '0.5rem' }}
                            >
                              Open file <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <div className="span-2">
                          <label>Notes</label>
                          <Field as="textarea" name="notes" rows={3} className="spr-input" />
                        </div>
                      </div>
                    </section>
                    <div className="spr-oc-actions">
                      <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving…' : (<><Save size={15} /> {editing ? 'Update' : 'Save'}</>)}
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
