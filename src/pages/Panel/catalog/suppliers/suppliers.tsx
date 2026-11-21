import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Truck,
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
  UserRound,
  BadgeCheck,
  Save,
  FileText,
  Building2,
  Globe,
  Landmark,
  CreditCard,
  ContactRound,
  Tags,
} from 'lucide-react';
import { supplierServices } from '../../../../redux/supplier/supplier.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
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
import './suppliers.scss';

const schema = Yup.object({
  name: Yup.string().required('Supplier name is required'),
  code: Yup.string(),
  phone: phoneField(false),
  alternate_phone: phoneField(false),
  email: Yup.string().email('Invalid email'),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: pincodeField(false),
  country: Yup.string(),
  gstin: gstinField(false),
  pan: panField(false),
  company_type: Yup.string(),
  payment_terms: Yup.string(),
  credit_days: Yup.number().typeError('Must be a number'),
  credit_limit: Yup.number().typeError('Must be a number'),
  bank_name: Yup.string(),
  bank_account_name: Yup.string(),
  bank_account_no: accountNumberField(false),
  bank_ifsc: ifscField(false),
  bank_branch: Yup.string(),
  bank_address: Yup.string(),
  website: Yup.string(),
  contact_person: Yup.string(),
  notes: Yup.string(),
  is_active: Yup.boolean(),
});

const emptySupplier = {
  name: '',
  code: 'Auto on save',
  phone: '',
  alternate_phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  gstin: '',
  pan: '',
  company_type: 'Wholesaler',
  payment_terms: 'Net 30',
  credit_days: 30,
  credit_limit: 0,
  bank_name: '',
  bank_account_name: '',
  bank_account_no: '',
  bank_ifsc: '',
  bank_branch: '',
  bank_address: '',
  website: '',
  contact_person: '',
  notes: '',
  is_active: true,
};

const COLORS = ['#ea580c', '#2563eb', '#0f766e', '#7c3aed', '#db2777', '#0284c7', '#b45309'];

function supplierColor(name: string) {
  const code = Array.from(name || 'S').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

export default function SuppliersPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'supplier', 'create');
  const canEdit = hasRight(rights, user, 'supplier', 'edit');
  const canDelete = hasRight(rights, user, 'supplier', 'delete');

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supplierServices.http.get('/panel/suppliers');
      setItems(data.items || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load suppliers');
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
      String(item.phone || '').toLowerCase().includes(term) ||
      String(item.email || '').toLowerCase().includes(term) ||
      String(item.contact_person || '').toLowerCase().includes(term) ||
      String(item.city || '').toLowerCase().includes(term) ||
      String(item.gstin || '').toLowerCase().includes(term) ||
      String(item.address || '').toLowerCase().includes(term)
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
    if (!confirm(`Delete supplier "${item.name}"?`)) return;
    try {
      await supplierServices.http.delete(`/panel/suppliers/${item.id}`);
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
              <Truck size={22} />
            </div>
            <div>
              <h1>Supplier</h1>
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
                <Plus size={16} /> Add Supplier
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spr-loading">
            <Loader />
            <p>Loading suppliers...</p>
          </div>
        ) : view === 'table' ? (
          <div className="spr-table-wrap">
            <table className="spr-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><Truck size={14} className="th-type" /> Supplier</span></th>
                  <th><span className="th-cell"><Phone size={14} className="th-desc" /> Contact</span></th>
                  <th><span className="th-cell"><MapPin size={14} className="th-desc" /> Location</span></th>
                  <th><span className="th-cell"><ContactRound size={14} className="th-desc" /> GSTIN</span></th>
                  <th><span className="th-cell"><Tags size={14} className="th-desc" /> Type</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-status" /> Status</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="spr-empty">No suppliers found.</td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id} className="spr-row" style={{ animationDelay: `${index * 40}ms` }}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="spr-name-cell">
                          <span className="spr-avatar" style={{ background: supplierColor(item.name) }}>
                            {(item.name || 'S').slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.name}</strong>
                            <p className="spr-slug">
                              <UserRound size={12} /> {item.contact_person || 'No contact person'}
                              {item.code ? ` · ${item.code}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="spr-contact">
                          <span><Phone size={12} /> {item.phone || '—'}</span>
                          <span><Mail size={12} /> {item.email || '—'}</span>
                        </div>
                      </td>
                      <td className="spr-desc">
                        {[item.city, item.state].filter(Boolean).join(', ') || item.address || '—'}
                      </td>
                      <td className="spr-desc">{item.gstin || '—'}</td>
                      <td className="spr-desc">{item.company_type || '—'}</td>
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
              <div className="spr-empty">No suppliers found.</div>
            ) : (
              filtered.map((item, index) => (
                <article key={item.id} className="spr-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="spr-card-top">
                    <span className="spr-avatar lg" style={{ background: supplierColor(item.name) }}>
                      {(item.name || 'S').slice(0, 1).toUpperCase()}
                    </span>
                    <span className={`spr-badge ${item.is_active ? 'is-on' : 'is-off'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="spr-slug"><UserRound size={12} /> {item.contact_person || 'No contact person'}{item.code ? ` · ${item.code}` : ''}</p>
                  <p className="spr-card-desc">{item.phone || 'No phone'} · {item.email || 'No email'}</p>
                  <p className="spr-card-desc">{[item.city, item.state].filter(Boolean).join(', ') || item.address || 'No address'}</p>
                  <p className="spr-card-desc">{item.gstin ? `GSTIN ${item.gstin}` : 'No GSTIN'} · {item.company_type || 'Type N/A'}</p>
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
                    <Truck size={18} />
                  </span>
                  <div>
                    <h2>{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
                    <p>{editing ? 'Update supplier details' : 'Create a new supplier'}</p>
                  </div>
                </div>
                <button type="button" className="spr-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={
                  editing
                    ? {
                        ...emptySupplier,
                        ...editing,
                        is_active: !!editing.is_active,
                        credit_days: editing.credit_days ?? 0,
                        credit_limit: editing.credit_limit ?? 0,
                      }
                    : emptySupplier
                }
                validationSchema={schema}
                validateOnChange
                validateOnBlur
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const payload = {
                      ...values,
                      code: undefined, // auto-generated on server
                      credit_days: Number(values.credit_days) || 0,
                      credit_limit: Number(values.credit_limit) || 0,
                    };
                    if (editing) await supplierServices.http.put(`/panel/suppliers/${editing.id}`, payload);
                    else await supplierServices.http.post('/panel/suppliers', payload);
                    toast.success(editing ? 'Supplier updated' : 'Supplier created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched, isSubmitting, submitCount, validateForm, setTouched, submitForm }) => (
                  <Form className="spr-oc-body">
                    <section className="spr-section">
                      <h3><Building2 size={15} /> Basic Info</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><Truck size={14} className="lbl-icon c-orange" /> Supplier Name</label>
                          <Field name="name" className="spr-input" placeholder="Supplier / company name" />
                          {touched.name && errors.name && <p className="spr-error">{String(errors.name)}</p>}
                        </div>
                        <div>
                          <label>
                            <Hash size={14} className="lbl-icon c-slate" /> Supplier Code{' '}
                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>(auto)</span>
                          </label>
                          <Field
                            name="code"
                            className="spr-input"
                            readOnly
                            disabled
                            placeholder="Auto-generated"
                          />
                        </div>
                        <div>
                          <label><Tags size={14} className="lbl-icon c-violet" /> Company Type</label>
                          <Field as="select" name="company_type" className="spr-input">
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Trader">Trader</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Importer">Importer</option>
                          </Field>
                        </div>
                        <div>
                          <label><UserRound size={14} className="lbl-icon c-violet" /> Contact Person</label>
                          <Field name="contact_person" className="spr-input" placeholder="Contact person" />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><Phone size={15} /> Contact Details</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><Phone size={14} className="lbl-icon c-teal" /> Phone</label>
                          <Field
                            name="phone"
                            className="spr-input"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="10-digit mobile"
                          />
                          {(touched.phone || submitCount > 0) && errors.phone && (
                            <p className="spr-error">{String(errors.phone)}</p>
                          )}
                        </div>
                        <div>
                          <label><Phone size={14} className="lbl-icon c-cyan" /> Alternate Phone</label>
                          <Field
                            name="alternate_phone"
                            className="spr-input"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="10-digit mobile"
                          />
                          {(touched.alternate_phone || submitCount > 0) && errors.alternate_phone && (
                            <p className="spr-error">{String(errors.alternate_phone)}</p>
                          )}
                        </div>
                        <div>
                          <label><Mail size={14} className="lbl-icon c-sky" /> Email</label>
                          <Field name="email" type="email" className="spr-input" placeholder="Email address" />
                          {(touched.email || submitCount > 0) && errors.email && (
                            <p className="spr-error">{String(errors.email)}</p>
                          )}
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
                          {(touched.pincode || submitCount > 0) && errors.pincode && (
                            <p className="spr-error">{String(errors.pincode)}</p>
                          )}
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
                      <h3><ContactRound size={15} /> Tax & Payment</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label><ContactRound size={14} className="lbl-icon c-orange" /> GSTIN</label>
                          <Field name="gstin" className="spr-input" maxLength={15} placeholder="22AAAAA0000A1Z5" />
                          {(touched.gstin || submitCount > 0) && errors.gstin && (
                            <p className="spr-error">{String(errors.gstin)}</p>
                          )}
                        </div>
                        <div>
                          <label><ContactRound size={14} className="lbl-icon c-slate" /> PAN</label>
                          <Field name="pan" className="spr-input" maxLength={10} placeholder="ABCDE1234F" />
                          {(touched.pan || submitCount > 0) && errors.pan && (
                            <p className="spr-error">{String(errors.pan)}</p>
                          )}
                        </div>
                        <div>
                          <label><CreditCard size={14} className="lbl-icon c-teal" /> Payment Terms</label>
                          <Field name="payment_terms" className="spr-input" placeholder="Net 30 / Advance" />
                        </div>
                        <div>
                          <label>Credit Days</label>
                          <Field name="credit_days" type="number" className="spr-input" placeholder="30" />
                        </div>
                        <div>
                          <label>Credit Limit (₹)</label>
                          <Field name="credit_limit" type="number" className="spr-input" placeholder="0" />
                        </div>
                      </div>
                    </section>

                    <section className="spr-section">
                      <h3><Landmark size={15} /> Bank Details</h3>
                      <div className="spr-form-grid">
                        <div>
                          <label>IFSC</label>
                          <IfscInput
                            name="bank_ifsc"
                            className="spr-input"
                            value={values.bank_ifsc}
                            setFieldValue={setFieldValue}
                            bankNameField="bank_name"
                            branchField="bank_branch"
                            addressField="bank_address"
                          />
                          {(touched.bank_ifsc || submitCount > 0) && errors.bank_ifsc && (
                            <p className="spr-error">{String(errors.bank_ifsc)}</p>
                          )}
                        </div>
                        <div>
                          <label>Bank Name</label>
                          <Field
                            name="bank_name"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from IFSC"
                          />
                        </div>
                        <div>
                          <label>Branch Name</label>
                          <Field
                            name="bank_branch"
                            className="spr-input is-readonly"
                            readOnly
                            tabIndex={-1}
                            placeholder="Auto from IFSC"
                          />
                        </div>
                        <div>
                          <label>Account Name</label>
                          <Field name="bank_account_name" className="spr-input" placeholder="Account holder" />
                        </div>
                        <div>
                          <label>Account Number</label>
                          <Field
                            name="bank_account_no"
                            className="spr-input"
                            inputMode="numeric"
                            maxLength={18}
                            placeholder="9–18 digits"
                          />
                          {(touched.bank_account_no || submitCount > 0) && errors.bank_account_no && (
                            <p className="spr-error">{String(errors.bank_account_no)}</p>
                          )}
                        </div>
                        <div className="span-2">
                          <label>Branch Address</label>
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

                    <div className="spr-oc-actions">
                      <button type="button" className="spr-btn ghost" onClick={closeForm}>Cancel</button>
                      <button
                        type="button"
                        className="spr-btn primary"
                        disabled={isSubmitting}
                        onClick={async () => {
                          const errs = await validateForm();
                          const keys = Object.keys(errs);
                          if (keys.length) {
                            setTouched(
                              keys.reduce((acc: Record<string, boolean>, k) => {
                                acc[k] = true;
                                return acc;
                              }, {}),
                              true
                            );
                            const first = errs[keys[0]];
                            toast.error(typeof first === 'string' ? first : 'Please fix the highlighted fields');
                            return;
                          }
                          await submitForm();
                        }}
                      >
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
