import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Warehouse,
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  X,
  Hash,
  Phone,
  MapPin,
  BadgeCheck,
  Save,
  Building2,
  Star,
  UserRound,
} from 'lucide-react';
import { warehouseServices } from '../../../../redux/warehouse/warehouse.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { phoneField, pincodeField, normalizePhone } from '../../../../utils/fieldValidators';
import { Loader } from '../../../../components/ui/Loader';
import PincodeInput from '../../../../components/ui/PincodeInput';
import '../_shared/LocationPages.scss';

const schema = Yup.object({
  name: Yup.string().required('Warehouse name is required'),
  code: Yup.string().required('Code is required'),
  branch_id: Yup.mixed(),
  phone: phoneField(false),
  email: Yup.string().email('Invalid email'),
  contact_person: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: pincodeField(false),
  country: Yup.string(),
  is_default: Yup.boolean(),
  is_active: Yup.boolean(),
});

const COLORS = ['#b45309', '#2563eb', '#0f766e', '#7c3aed', '#db2777', '#0284c7', '#ea580c'];

function itemColor(name: string) {
  const code = Array.from(name || 'W').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

function codeify(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export default function WarehousesPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'warehouse', 'create');
  const canEdit = hasRight(rights, user, 'warehouse', 'edit');
  const canDelete = hasRight(rights, user, 'warehouse', 'delete');

  const [items, setItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [wh, br] = await Promise.all([
        warehouseServices.http.get('/panel/warehouses'),
        warehouseServices.http.get('/panel/branches').catch(() => ({ data: { items: [] } })),
      ]);
      setItems(wh.data.warehouses || []);
      setBranches((br.data.items || []).filter((b: any) => Number(b.is_active) === 1));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load warehouses');
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
      String(item.branch_name || '').toLowerCase().includes(term) ||
      String(item.city || '').toLowerCase().includes(term) ||
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
    if (!confirm(`Delete warehouse "${item.name}"?`)) return;
    try {
      await warehouseServices.http.delete(`/panel/warehouses/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const addressLine = (item: any) =>
    [item.address, item.city, item.state, item.pincode].filter(Boolean).join(', ') || '—';

  return (
    <div className="loc-page">
      <div className="loc-panel">
        <div className="loc-toolbar">
          <div className="loc-hero">
            <div className="loc-hero-icon"><Warehouse size={22} /></div>
            <div>
              <h1>Warehouse</h1>
              <p>Inventory locations & addresses · <strong>{items.length}</strong></p>
            </div>
          </div>

          <div className="loc-toolbar-actions">
            <label className="loc-search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, code, branch, city" />
            </label>
            <div className="loc-view-toggle">
              <button type="button" className={view === 'table' ? 'is-active' : ''} onClick={() => setView('table')}><Table2 size={16} /></button>
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
            </div>
            {canCreate && (
              <button type="button" className="loc-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Warehouse
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loc-loading"><Loader /><p>Loading warehouses...</p></div>
        ) : view === 'table' ? (
          <div className="loc-table-wrap">
            <table className="loc-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><Warehouse size={14} className="th-type" /> Warehouse</span></th>
                  <th><span className="th-cell"><Building2 size={14} className="th-desc" /> Branch</span></th>
                  <th><span className="th-cell"><MapPin size={14} className="th-desc" /> Address</span></th>
                  <th><span className="th-cell"><Phone size={14} className="th-desc" /> Contact</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-status" /> Status</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="loc-empty">No warehouses found.</td></tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id} className="loc-row">
                      <td>{index + 1}</td>
                      <td>
                        <div className="loc-name-cell">
                          <span className="loc-avatar" style={{ background: itemColor(item.name) }}>
                            {(item.name || 'W').slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>
                              {item.name}
                              {Number(item.is_default) === 1 && (
                                <span title="Default" style={{ marginLeft: 6, color: '#b45309' }}><Star size={12} fill="currentColor" /></span>
                              )}
                            </strong>
                            <p className="loc-slug">{item.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="loc-desc">{item.branch_name || '—'}</td>
                      <td className="loc-desc">{addressLine(item)}</td>
                      <td className="loc-desc">
                        <div>{item.contact_person || '—'}</div>
                        <div>{item.phone || '—'}</div>
                      </td>
                      <td>
                        <span className={`loc-badge ${item.is_active ? 'is-on' : 'is-off'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {canEdit ? (
                          <button type="button" className="icon-action edit" onClick={() => openEdit(item)}><Pencil size={15} /></button>
                        ) : '—'}
                      </td>
                      <td>
                        {canDelete ? (
                          <button type="button" className="icon-action delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loc-grid">
            {filtered.map((item) => (
              <article key={item.id} className="loc-card">
                <div className="loc-card-top">
                  <span className="loc-avatar lg" style={{ background: itemColor(item.name) }}>
                    {(item.name || 'W').slice(0, 1).toUpperCase()}
                  </span>
                  <span className={`loc-badge ${item.is_active ? 'is-on' : 'is-off'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3>
                  {item.name}
                  {Number(item.is_default) === 1 && ' ★'}
                </h3>
                <p className="loc-slug">{item.code} · {item.branch_name || 'No branch'}</p>
                <p className="loc-card-desc">{addressLine(item)}</p>
                <div className="loc-card-actions">
                  {canEdit && <button type="button" className="icon-action edit" onClick={() => openEdit(item)}><Pencil size={15} /> Edit</button>}
                  {canDelete && <button type="button" className="icon-action delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {formOpen && createPortal(
        <div className={`loc-overlay ${formVisible ? 'is-open' : ''}`}>
          <div className="loc-backdrop" onClick={closeForm} />
          <aside className={`loc-offcanvas ${formVisible ? 'is-open' : ''}`}>
            <div className="loc-oc-head">
              <div className="loc-oc-title">
                <span className="loc-oc-icon"><Warehouse size={18} /></span>
                <div>
                  <h2>{editing ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
                  <p>Inventory location & address</p>
                </div>
              </div>
              <button type="button" className="loc-oc-close" onClick={closeForm}><X size={18} /></button>
            </div>
            <Formik
              enableReinitialize
              initialValues={{
                name: editing?.name || '',
                code: editing?.code || '',
                branch_id: editing?.branch_id || editing?.branchID
                  ? String(editing.branch_id || editing.branchID)
                  : '',
                phone: editing?.phone || '',
                email: editing?.email || '',
                contact_person: editing?.contact_person || '',
                address: editing?.address || '',
                city: editing?.city || '',
                state: editing?.state || '',
                pincode: editing?.pincode || '',
                country: editing?.country || 'India',
                is_default: editing ? !!editing.is_default : false,
                is_active: editing ? !!editing.is_active : true,
              }}
              validationSchema={schema}
              validateOnChange
              validateOnBlur
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const payload = {
                    ...values,
                    phone: normalizePhone(values.phone) || null,
                    branch_id: values.branch_id ? Number(values.branch_id) : null,
                  };
                  if (editing) await warehouseServices.http.put(`/panel/warehouses/${editing.id}`, payload);
                  else await warehouseServices.http.post('/panel/warehouses', payload);
                  toast.success(editing ? 'Warehouse updated' : 'Warehouse created');
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
                <Form className="loc-oc-body">
                  <div>
                    <label>Name *</label>
                    <Field
                      name="name"
                      className="loc-input"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('name', e.target.value);
                        if (!editing) setFieldValue('code', codeify(e.target.value));
                      }}
                    />
                    {touched.name && errors.name && <p className="loc-error">{String(errors.name)}</p>}
                  </div>
                  <div className="loc-form-grid">
                    <div>
                      <label>Code *</label>
                      <Field name="code" className="loc-input" />
                      {touched.code && errors.code && <p className="loc-error">{String(errors.code)}</p>}
                    </div>
                    <div>
                      <label>Branch</label>
                      <Field as="select" name="branch_id" className="loc-input">
                        <option value="">No branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                  <div>
                    <label><UserRound size={12} /> Contact person</label>
                    <Field name="contact_person" className="loc-input" />
                  </div>
                  <div className="loc-form-grid">
                    <div>
                      <label>Phone</label>
                      <Field
                        name="phone"
                        className="loc-input"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile"
                      />
                      {(touched.phone || submitCount > 0) && errors.phone && (
                        <p className="loc-error">{String(errors.phone)}</p>
                      )}
                    </div>
                    <div>
                      <label>Email</label>
                      <Field name="email" className="loc-input" />
                      {(touched.email || submitCount > 0) && errors.email && (
                        <p className="loc-error">{String(errors.email)}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label>Address</label>
                    <Field as="textarea" name="address" rows={2} className="loc-input" />
                  </div>
                  <div className="loc-form-grid">
                    <div>
                      <label>Pincode</label>
                      <PincodeInput
                        className="loc-input"
                        value={values.pincode}
                        setFieldValue={setFieldValue}
                      />
                      {(touched.pincode || submitCount > 0) && errors.pincode && (
                        <p className="loc-error">{String(errors.pincode)}</p>
                      )}
                    </div>
                    <div>
                      <label>Country</label>
                      <Field
                        name="country"
                        className="loc-input is-readonly"
                        readOnly
                        tabIndex={-1}
                        placeholder="Auto from pincode"
                      />
                    </div>
                  </div>
                  <div className="loc-form-grid">
                    <div>
                      <label>City</label>
                      <Field
                        name="city"
                        className="loc-input is-readonly"
                        readOnly
                        tabIndex={-1}
                        placeholder="Auto from pincode"
                      />
                    </div>
                    <div>
                      <label>State</label>
                      <Field
                        name="state"
                        className="loc-input is-readonly"
                        readOnly
                        tabIndex={-1}
                        placeholder="Auto from pincode"
                      />
                    </div>
                  </div>
                  <label className="loc-active">
                    <input type="checkbox" checked={!!values.is_default} onChange={(e) => setFieldValue('is_default', e.target.checked)} />
                    Default warehouse
                  </label>
                  <label className="loc-active">
                    <input type="checkbox" checked={!!values.is_active} onChange={(e) => setFieldValue('is_active', e.target.checked)} />
                    Active
                  </label>
                  <div className="loc-oc-actions">
                    <button type="button" className="loc-btn ghost" onClick={closeForm}>Cancel</button>
                    <button type="submit" className="loc-btn primary" disabled={isSubmitting}>
                      <Save size={15} /> {isSubmitting ? 'Saving...' : editing ? 'Update' : 'Save'}
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
