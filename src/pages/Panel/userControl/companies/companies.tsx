/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Company master CRUD page
 * Edit Date: 2026-11-14
 */
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  X,
  Hash,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Save,
  FileText,
  Globe,
  ContactRound,
  UserRound,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Landmark,
  FolderOpen,
  Upload,
  ExternalLink,
  FileImage,
} from 'lucide-react';
import { companyServices } from '../../../../redux/company/company.services';
import { RootState } from '../../../../redux/store';
import { hasRight, isSuperAdminUser } from '../../../../utils/access';
import {
  phoneField,
  panField,
  pincodeField,
  ifscField,
  gstinField,
  accountNumberField,
} from '../../../../utils/fieldValidators';
import { Loader } from '../../../../components/ui/Loader';
import PincodeInput from '../../../../components/ui/PincodeInput';
import IfscInput from '../../../../components/ui/IfscInput';
import './companies.scss';

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/i, '')
  .replace(/\/$/, '');

function mediaUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path;
  if (path.startsWith('/')) return `${API_ORIGIN || window.location.origin}${path}`;
  return path;
}

function isImageUrl(url?: string) {
  if (!url) return false;
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url) || url.startsWith('blob:');
}

function isPdfUrl(url?: string) {
  return !!url && /\.pdf(\?|$)/i.test(url);
}

const str = () => Yup.string().transform((v) => (v == null ? '' : v)).nullable();
const optEmail = () =>
  Yup.string()
    .transform((v) => (v == null ? '' : v))
    .nullable()
    .test('email', 'Invalid email', (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));

const schema = Yup.object({
  name: str().required('Company name is required'),
  code: str(),
  legal_name: str(),
  phone: phoneField(false),
  alternate_phone: phoneField(false),
  email: optEmail(),
  website: str(),
  address: str(),
  city: str(),
  state: str(),
  pincode: pincodeField(false),
  country: str(),
  gstin: gstinField(false),
  pan: panField(false),
  cin: str(),
  logo_url: str(),
  bank_name: str(),
  account_holder: str(),
  account_number: accountNumberField(false),
  ifsc_code: ifscField(false),
  bank_branch: str(),
  bank_address: str(),
  notes: str(),
  is_active: Yup.boolean(),
  documents: Yup.array().of(
    Yup.object({
      doc_type: str(),
      doc_name: str(),
      file_url: str(),
    })
  ),
  admin_username: str().required('Admin username is required'),
  admin_email: Yup.string()
    .transform((v) => (v == null ? '' : v))
    .nullable()
    .required('Admin email is required')
    .email('Invalid email'),
  admin_phone: phoneField(true),
  admin_password: str(),
  admin_role: str(),
});

function companySchema(isEdit: boolean) {
  return schema.shape({
    admin_password: isEdit
      ? str().test('pwd', 'Min 6 characters', (v) => !v || String(v).length >= 6)
      : str().min(6, 'Min 6 characters').required('Admin password is required'),
  });
}

const emptyDoc = { doc_type: '', doc_name: '', file_url: '' };

const emptyCompany = {
  name: '',
  code: '',
  legal_name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  gstin: '',
  pan: '',
  cin: '',
  logo_url: '',
  bank_name: '',
  account_holder: '',
  account_number: '',
  ifsc_code: '',
  bank_branch: '',
  bank_address: '',
  notes: '',
  is_active: true,
  documents: [{ ...emptyDoc }],
  admin_username: '',
  admin_email: '',
  admin_phone: '',
  admin_password: '',
  admin_role: 'admin',
};

function toFormValues(item?: any | null) {
  if (!item) return { ...emptyCompany, documents: [{ ...emptyDoc }] };
  const docs = Array.isArray(item.documents) && item.documents.length
    ? item.documents.map((d: any) => ({
        doc_type: d.doc_type || '',
        doc_name: d.doc_name || '',
        file_url: d.file_url || '',
      }))
    : [{ ...emptyDoc }];
  return {
    ...emptyCompany,
    name: item.name || '',
    code: item.code || '',
    legal_name: item.legal_name || '',
    phone: item.phone || '',
    alternate_phone: item.alternate_phone || '',
    email: item.email || '',
    website: item.website || '',
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    pincode: item.pincode || '',
    country: item.country || 'India',
    gstin: item.gstin || '',
    pan: item.pan || '',
    cin: item.cin || '',
    logo_url: item.logo_url || '',
    bank_name: item.bank_name || '',
    account_holder: item.account_holder || '',
    account_number: item.account_number || '',
    ifsc_code: item.ifsc_code || '',
    bank_branch: item.bank_branch || '',
    bank_address: item.bank_address || '',
    notes: item.notes || '',
    is_active: !!item.is_active,
    documents: docs,
    admin_username: item.admin_username || '',
    admin_email: item.admin_email || '',
    admin_phone: item.admin_phone || '',
    admin_password: '',
    admin_role: 'admin',
  };
}

const COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#db2777', '#0284c7', '#b45309', '#ea580c'];

function companyColor(name: string) {
  const code = Array.from(name || 'C').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

export default function CompaniesPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  // Only Super Admin creates/deletes companies; company admin may edit own company
  const canCreate = isSuperAdminUser(user) && hasRight(rights, user, 'company', 'create');
  const canEdit = hasRight(rights, user, 'company', 'edit');
  const canDelete = isSuperAdminUser(user) && hasRight(rights, user, 'company', 'delete');

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await companyServices.http.get('/panel/companies');
      setItems(data.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load companies');
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
    if (!term) return true;
    return (
      String(item.name || '').toLowerCase().includes(term) ||
      String(item.code || '').toLowerCase().includes(term) ||
      String(item.legal_name || '').toLowerCase().includes(term) ||
      String(item.phone || '').toLowerCase().includes(term) ||
      String(item.email || '').toLowerCase().includes(term) ||
      String(item.city || '').toLowerCase().includes(term) ||
      String(item.gstin || '').toLowerCase().includes(term) ||
      String(item.address || '').toLowerCase().includes(term) ||
      String(item.admin_username || '').toLowerCase().includes(term) ||
      String(item.admin_email || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setShowAdminPassword(false);
    setFormOpen(true);
  };

  const openEdit = async (item: any) => {
    setShowAdminPassword(false);
    try {
      const { data } = await companyServices.http.get(`/panel/companies/${item.id}`);
      setEditing(data.item || item);
    } catch {
      setEditing(item);
    }
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setShowAdminPassword(false);
    setUploadingDocIndex(null);
    setUploadingLogo(false);
  };

  const uploadCompanyLogo = async (
    file: File,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await companyServices.http.post('/panel/upload/company-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      setFieldValue('logo_url', url);
      toast.success('Logo uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadCompanyDocument = async (
    file: File,
    index: number,
    setFieldValue: (field: string, value: any) => void,
    values: any
  ) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setUploadingDocIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await companyServices.http.post('/panel/upload/company-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      setFieldValue(`documents.${index}.file_url`, url);
      const currentName = values?.documents?.[index]?.doc_name;
      if (!currentName) {
        setFieldValue(`documents.${index}.doc_name`, file.name.replace(/\.[^.]+$/, '') || file.name);
      }
      toast.success('Document uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setUploadingDocIndex(null);
    }
  };

  const onDelete = async (item: any) => {
    if (!confirm(`Delete company "${item.name}"?`)) return;
    try {
      await companyServices.http.delete(`/panel/companies/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="spr-page">
      <div className="spr-panel">
        <div className="spr-toolbar">
          <div className="spr-hero">
            <div className="spr-hero-icon">
              <Building2 size={22} />
            </div>
            <div>
              <h1>Company</h1>
              <p>
                Total count: <strong>{items.length}</strong>
              </p>
            </div>
          </div>

          <div className="spr-toolbar-actions">
            <label className="spr-search">
              <Search size={16} className="text-orange-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, code, phone, GSTIN"
              />
            </label>

            <div className="spr-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={view === 'table' ? 'is-active' : ''}
                onClick={() => setView('table')}
                title="Table view"
              >
                <Table2 size={16} />
              </button>
              <button
                type="button"
                className={view === 'grid' ? 'is-active' : ''}
                onClick={() => setView('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {canCreate && (
              <button type="button" className="spr-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Company
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spr-loading">
            <Loader />
            <p>Loading companies...</p>
          </div>
        ) : view === 'table' ? (
          <div className="spr-table-wrap">
            <table className="spr-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><Building2 size={14} className="th-type" /> Company</span></th>
                  <th><span className="th-cell"><UserRound size={14} className="th-desc" /> Admin</span></th>
                  <th><span className="th-cell"><Phone size={14} className="th-desc" /> Contact</span></th>
                  <th><span className="th-cell"><MapPin size={14} className="th-desc" /> Location</span></th>
                  <th><span className="th-cell"><ShieldCheck size={14} className="th-desc" /> Role</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-status" /> Status</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="spr-empty">No companies found.</td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id} className="spr-row" style={{ animationDelay: `${index * 40}ms` }}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="spr-name-cell">
                          <span className="spr-avatar" style={{ background: companyColor(item.name) }}>
                            {(item.name || 'C').slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.name}</strong>
                            <p className="spr-slug">
                              {item.code || 'No code'}
                              {item.legal_name ? ` · ${item.legal_name}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="spr-contact">
                          <span><UserRound size={12} /> {item.admin_username || '—'}</span>
                          <span><Mail size={12} /> {item.admin_email || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="spr-contact">
                          <span><Phone size={12} /> {item.admin_phone || item.phone || '—'}</span>
                          <span><Mail size={12} /> {item.email || '—'}</span>
                        </div>
                      </td>
                      <td className="spr-desc">
                        {[item.city, item.state].filter(Boolean).join(', ') || item.address || '—'}
                      </td>
                      <td className="spr-desc">
                        {item.admin_role_code || item.admin_role_name || '—'}
                      </td>
                      <td>
                        <span className={`spr-badge ${item.is_active ? 'is-on' : 'is-off'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {canEdit ? (
                          <button type="button" className="icon-action edit" title="Edit" onClick={() => openEdit(item)}>
                            <Pencil size={15} />
                          </button>
                        ) : '—'}
                      </td>
                      <td>
                        {canDelete ? (
                          <button type="button" className="icon-action delete" title="Delete" onClick={() => onDelete(item)}>
                            <Trash2 size={15} />
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="spr-grid">
            {filtered.length === 0 ? (
              <div className="spr-empty">No companies found.</div>
            ) : (
              filtered.map((item, index) => (
                <article key={item.id} className="spr-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="spr-card-top">
                    <span className="spr-avatar lg" style={{ background: companyColor(item.name) }}>
                      {(item.name || 'C').slice(0, 1).toUpperCase()}
                    </span>
                    <span className={`spr-badge ${item.is_active ? 'is-on' : 'is-off'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="spr-slug">{item.code || 'No code'}{item.legal_name ? ` · ${item.legal_name}` : ''}</p>
                  <p className="spr-card-desc">
                    Admin: {item.admin_username || '—'} · {item.admin_email || 'No email'}
                  </p>
                  <p className="spr-card-desc">
                    {item.admin_phone || item.phone || 'No phone'} · Role: {item.admin_role_code || item.admin_role_name || '—'}
                  </p>
                  <p className="spr-card-desc">{[item.city, item.state].filter(Boolean).join(', ') || item.address || 'No address'}</p>
                  <div className="spr-card-actions">
                    {canEdit && (
                      <button type="button" className="icon-action edit" onClick={() => openEdit(item)}>
                        <Pencil size={15} /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" className="icon-action delete" onClick={() => onDelete(item)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
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
                  <span className="spr-oc-icon">
                    <Building2 size={18} />
                  </span>
                  <div>
                    <h2>{editing ? 'Edit Company' : 'Add Company'}</h2>
                    <p>{editing ? 'Update company details' : 'Create a new company profile'}</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={toFormValues(editing)}
                validationSchema={companySchema(!!editing)}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const payload = {
                      name: values.name,
                      code: values.code || null,
                      legal_name: values.legal_name || null,
                      phone: values.phone || null,
                      alternate_phone: values.alternate_phone || null,
                      email: values.email || null,
                      website: values.website || null,
                      address: values.address || null,
                      bank_name: values.bank_name || null,
                      account_holder: values.account_holder || null,
                      account_number: values.account_number || null,
                      ifsc_code: values.ifsc_code || null,
                      bank_branch: values.bank_branch || null,
                      bank_address: values.bank_address || null,
                      documents: (values.documents || [])
                        .filter((d: any) => d.doc_type || d.doc_name || d.file_url)
                        .map((d: any) => ({
                          doc_type: d.doc_type || null,
                          doc_name: d.doc_name || null,
                          file_url: d.file_url || null,
                        })),
                      city: values.city || null,
                      state: values.state || null,
                      pincode: values.pincode || null,
                      country: values.country || 'India',
                      gstin: values.gstin || null,
                      pan: values.pan || null,
                      cin: values.cin || null,
                      logo_url: values.logo_url || null,
                      notes: values.notes || null,
                      is_active: !!values.is_active,
                      admin_username: values.admin_username,
                      admin_email: values.admin_email,
                      admin_phone: values.admin_phone,
                      admin_password: values.admin_password || '',
                      admin_role: 'admin',
                    };
                    if (editing) await companyServices.http.put(`/panel/companies/${editing.id}`, payload);
                    else await companyServices.http.post('/panel/companies', payload);
                    toast.success(editing ? 'Company & admin updated' : 'Company & admin created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting, submitCount }) => (
                  <Form className="spr-oc-body">
                    <section className="spr-section">
                      <h3><Building2 size={15} /> Basic Info</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><Building2 size={14} className="lbl-icon c-orange" /> Company Name</label>
                          <Field name="name" className="spr-input" placeholder="Company name" />
                          {touched.name && errors.name && <p className="spr-error">{String(errors.name)}</p>}
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-slate" /> Company Code</label>
                          <Field name="code" className="spr-input" placeholder="BNX-HQ" />
                        </div>
                        <div className="span-2">
                          <label><FileText size={14} className="lbl-icon c-violet" /> Legal Name</label>
                          <Field name="legal_name" className="spr-input" placeholder="Registered legal name" />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><Phone size={15} /> Contact Details</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><Phone size={14} className="lbl-icon c-teal" /> Phone</label>
                          <Field name="phone" className="spr-input" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" />
                          {touched.phone && errors.phone && <p className="spr-error">{String(errors.phone)}</p>}
                        </div>
                        <div>
                          <label><Phone size={14} className="lbl-icon c-cyan" /> Alternate Phone</label>
                          <Field name="alternate_phone" className="spr-input" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" />
                          {touched.alternate_phone && errors.alternate_phone && (
                            <p className="spr-error">{String(errors.alternate_phone)}</p>
                          )}
                        </div>
                        <div>
                          <label><Mail size={14} className="lbl-icon c-sky" /> Email</label>
                          <Field name="email" type="email" className="spr-input" placeholder="Email address" />
                          {touched.email && errors.email && <p className="spr-error">{String(errors.email)}</p>}
                        </div>
                        <div>
                          <label><Globe size={14} className="lbl-icon c-blue" /> Website</label>
                          <Field name="website" className="spr-input" placeholder="https://" />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><MapPin size={15} /> Address</h3>
                      <div className="spr-form-grid">
                        <div className="span-2">
                          <label><MapPin size={14} className="lbl-icon c-rose" /> Street Address</label>
                          <Field name="address" className="spr-input" placeholder="Street / area" />
                        </div>
                        <div>
                          <label>Pincode</label>
                          <PincodeInput
                            className="spr-input"
                            value={values.pincode}
                            setFieldValue={setFieldValue}
                          />
                          {touched.pincode && errors.pincode && <p className="spr-error">{String(errors.pincode)}</p>}
                        </div>
                        <div>
                          <label>Country</label>
                          <Field
                            name="country"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from pincode"
                          />
                        </div>
                        <div>
                          <label>City</label>
                          <Field
                            name="city"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from pincode"
                          />
                        </div>
                        <div>
                          <label>State</label>
                          <Field
                            name="state"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from pincode"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><ContactRound size={15} /> Tax & Branding</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><ContactRound size={14} className="lbl-icon c-orange" /> GSTIN</label>
                          <Field name="gstin" className="spr-input" maxLength={15} placeholder="22AAAAA0000A1Z5" />
                          {touched.gstin && errors.gstin && <p className="spr-error">{String(errors.gstin)}</p>}
                        </div>
                        <div>
                          <label><ContactRound size={14} className="lbl-icon c-slate" /> PAN</label>
                          <Field name="pan" className="spr-input" maxLength={10} placeholder="ABCDE1234F" />
                          {touched.pan && errors.pan && <p className="spr-error">{String(errors.pan)}</p>}
                        </div>
                        <div>
                          <label>CIN</label>
                          <Field name="cin" className="spr-input" placeholder="Company CIN" />
                        </div>
                        <div className="span-2">
                          <label>Logo</label>
                          <div className="spr-doc-file-row">
                            <Field
                              name="logo_url"
                              className="spr-input"
                              placeholder="Upload or paste https://.../logo.png"
                            />
                            <label className={`spr-upload-btn ${uploadingLogo ? 'is-busy' : ''}`}>
                              <Upload size={15} />
                              {uploadingLogo ? 'Uploading…' : 'Upload'}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                                disabled={uploadingLogo}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = '';
                                  if (file) uploadCompanyLogo(file, setFieldValue);
                                }}
                              />
                            </label>
                          </div>
                          {values.logo_url && (
                            <div className="spr-doc-preview" style={{ marginTop: '0.55rem' }}>
                              <a
                                href={mediaUrl(values.logo_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="spr-doc-preview-img spr-logo-preview"
                              >
                                <img src={mediaUrl(values.logo_url)} alt="Company logo" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><Landmark size={15} /> Bank Details</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><Hash size={14} className="lbl-icon c-violet" /> IFSC Code</label>
                          <IfscInput
                            name="ifsc_code"
                            className="spr-input"
                            value={values.ifsc_code}
                            setFieldValue={setFieldValue}
                          />
                          {touched.ifsc_code && errors.ifsc_code && (
                            <p className="spr-error">{String(errors.ifsc_code)}</p>
                          )}
                        </div>
                        <div>
                          <label><Landmark size={14} className="lbl-icon c-teal" /> Bank Name</label>
                          <Field
                            name="bank_name"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from IFSC"
                          />
                        </div>
                        <div>
                          <label><Building2 size={14} className="lbl-icon c-blue" /> Branch Name</label>
                          <Field
                            name="bank_branch"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from IFSC"
                          />
                        </div>
                        <div>
                          <label><UserRound size={14} className="lbl-icon c-orange" /> Account Holder</label>
                          <Field name="account_holder" className="spr-input" placeholder="Account holder name" />
                        </div>
                        <div>
                          <label><Hash size={14} className="lbl-icon c-slate" /> Account Number</label>
                          <Field name="account_number" className="spr-input" inputMode="numeric" maxLength={18} placeholder="9–18 digits" />
                          {touched.account_number && errors.account_number && (
                            <p className="spr-error">{String(errors.account_number)}</p>
                          )}
                        </div>
                        <div className="span-2">
                          <label><MapPin size={14} className="lbl-icon c-rose" /> Branch Address</label>
                          <Field
                            name="bank_address"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from IFSC"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><FolderOpen size={15} /> Documents</h3>
                      <p className="spr-hint" style={{ marginBottom: '0.75rem' }}>
                        Upload GST, PAN, cancelled cheque, etc. (PDF / image / office, max 10MB) or paste a URL.
                      </p>
                      <FieldArray name="documents">
                        {({ push, remove }) => (
                          <div className="spr-doc-stack">
                            {(values.documents || []).map((doc: any, index: number) => {
                              const fileUrl = doc?.file_url || '';
                              const preview = mediaUrl(fileUrl);
                              const uploading = uploadingDocIndex === index;
                              return (
                                <div key={index} className="spr-doc-card">
                                  <div className="spr-doc-card-head">
                                    <span>Document #{index + 1}</span>
                                    {(values.documents || []).length > 1 && (
                                      <button type="button" className="spr-doc-remove" onClick={() => remove(index)}>
                                        <Trash2 size={14} /> Remove
                                      </button>
                                    )}
                                  </div>
                                  <div className="spr-form-grid">
                                    <div>
                                      <label>Doc Type</label>
                                      <Field
                                        name={`documents.${index}.doc_type`}
                                        className="spr-input"
                                        placeholder="GST / PAN / Cheque"
                                      />
                                    </div>
                                    <div>
                                      <label>Document Name</label>
                                      <Field
                                        name={`documents.${index}.doc_name`}
                                        className="spr-input"
                                        placeholder="Document name"
                                      />
                                    </div>
                                    <div className="span-2">
                                      <label>File</label>
                                      <div className="spr-doc-file-row">
                                        <Field
                                          name={`documents.${index}.file_url`}
                                          className="spr-input"
                                          placeholder="Upload or paste URL"
                                        />
                                        <label className={`spr-upload-btn ${uploading ? 'is-busy' : ''}`}>
                                          <Upload size={15} />
                                          {uploading ? 'Uploading…' : 'Upload'}
                                          <input
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,image/*,application/pdf"
                                            disabled={uploading}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              e.target.value = '';
                                              if (file) uploadCompanyDocument(file, index, setFieldValue, values);
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                    {fileUrl && (
                                      <div className="span-2 spr-doc-preview">
                                        {isImageUrl(fileUrl) ? (
                                          <a href={preview} target="_blank" rel="noreferrer" className="spr-doc-preview-img">
                                            <img src={preview} alt={doc.doc_name || 'Document'} />
                                          </a>
                                        ) : (
                                          <a
                                            href={preview}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="spr-doc-preview-link"
                                          >
                                            {isPdfUrl(fileUrl) ? <FileText size={16} /> : <FileImage size={16} />}
                                            <span>{doc.doc_name || 'Open document'}</span>
                                            <ExternalLink size={14} />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              className="spr-btn ghost spr-doc-add"
                              onClick={() => push({ ...emptyDoc })}
                            >
                              <Plus size={15} /> Add document
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </section>

                    <section className="spr-section">
                      <h3><ShieldCheck size={15} /> Admin Account</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><UserRound size={14} className="lbl-icon c-orange" /> Username</label>
                          <Field name="admin_username" className="spr-input" placeholder="Admin username" />
                          {touched.admin_username && errors.admin_username && (
                            <p className="spr-error">{String(errors.admin_username)}</p>
                          )}
                        </div>
                        <div>
                          <label><Mail size={14} className="lbl-icon c-sky" /> Mail ID</label>
                          <Field name="admin_email" type="email" className="spr-input" placeholder="admin@company.com" />
                          {touched.admin_email && errors.admin_email && (
                            <p className="spr-error">{String(errors.admin_email)}</p>
                          )}
                        </div>
                        <div>
                          <label><Phone size={14} className="lbl-icon c-teal" /> Phone Number</label>
                          <Field name="admin_phone" className="spr-input" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" />
                          {touched.admin_phone && errors.admin_phone && (
                            <p className="spr-error">{String(errors.admin_phone)}</p>
                          )}
                        </div>
                        <div>
                          <label><ShieldCheck size={14} className="lbl-icon c-violet" /> Role</label>
                          <Field name="admin_role" className="spr-input" readOnly />
                        </div>
                        <div className="span-2">
                          <label><Lock size={14} className="lbl-icon c-slate" /> Password</label>
                          <div className="spr-password-wrap">
                            <Field
                              name="admin_password"
                              type={showAdminPassword ? 'text' : 'password'}
                              className="spr-input"
                              placeholder={editing ? 'Leave blank to keep current' : 'Admin password'}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="spr-password-toggle"
                              onClick={() => setShowAdminPassword((v) => !v)}
                              aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                              title={showAdminPassword ? 'Hide password' : 'Show password'}
                            >
                              {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {editing && (
                            <p className="spr-hint">Saved password cannot be shown — enter a new one to change it.</p>
                          )}
                          {touched.admin_password && errors.admin_password && (
                            <p className="spr-error">{String(errors.admin_password)}</p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><FileText size={15} /> Notes & Status</h3>
                      <div>
                        <label><FileText size={14} className="lbl-icon c-slate" /> Notes</label>
                        <Field as="textarea" name="notes" rows={3} className="spr-input" placeholder="Optional notes" />
                      </div>
                      <label className="spr-active">
                        <input
                          type="checkbox"
                          checked={!!values.is_active}
                          onChange={(e) => setFieldValue('is_active', e.target.checked)}
                        />
                        Active
                      </label>
                    </section>

                    {submitCount > 0 && Object.keys(errors).length > 0 && (
                      <p className="spr-error" style={{ marginTop: '0.5rem' }}>
                        Please fix: {Object.values(errors).map(String).join(' · ')}
                      </p>
                    )}

                    <div className="spr-oc-actions">
                      <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="spr-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="spr-spinner" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save size={15} /> {editing ? 'Update' : 'Save'}
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}
