/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Panel Customers — list / add / edit / delete
 * Edit Date: 2026-11-14
 */

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Users,
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
  UserRound,
  IndianRupee,
  ShoppingBag,
} from 'lucide-react';
import { customerServices } from '../../../../redux/customer/customer.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { phoneField, pincodeField } from '../../../../utils/fieldValidators';
import { Loader } from '../../../../components/ui/Loader';
import './customers.scss';

const schema = Yup.object({
  name: Yup.string().required('Customer name is required'),
  phone: phoneField(true),
  email: Yup.string().email('Invalid email'),
  address: Yup.string().required('Address is required'),
  city: Yup.string(),
  state: Yup.string(),
  pincode: pincodeField(false),
  is_active: Yup.boolean(),
});

const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  is_active: true,
};

const COLORS = ['#0369a1', '#0f766e', '#7c3aed', '#db2777', '#ea580c', '#0284c7', '#b45309'];

function customerColor(name: string) {
  const code = Array.from(name || 'C').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

function money(n: unknown) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function CustomersPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'customer', 'create');
  const canEdit = hasRight(rights, user, 'customer', 'edit');
  const canDelete = hasRight(rights, user, 'customer', 'delete');

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
      const list = await customerServices.list();
      setItems(list);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load customers');
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
      String(item.phone || '').toLowerCase().includes(term) ||
      String(item.email || '').toLowerCase().includes(term) ||
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
    if (!confirm(`Delete customer "${item.name}"?`)) return;
    try {
      const data = await customerServices.remove(item.id || item.userID);
      toast.success(data.message || 'Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="cst-page">
      <div className="cst-panel">
        <div className="cst-toolbar">
          <div className="cst-hero">
            <div className="cst-hero-icon">
              <Users size={22} />
            </div>
            <div>
              <h1>Customer</h1>
              <p>
                Total count: <strong>{items.length}</strong>
              </p>
            </div>
          </div>

          <div className="cst-toolbar-actions">
            <label className="cst-search">
              <Search size={16} color="#0284c7" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, phone, email, city"
              />
            </label>

            <div className="cst-view-toggle" role="group" aria-label="View mode">
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
              <button type="button" className="cst-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Customer
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="cst-loading">
            <Loader />
            <p>Loading customers...</p>
          </div>
        ) : view === 'table' ? (
          <div className="cst-table-wrap">
            <table className="cst-table">
              <thead>
                <tr>
                  <th>
                    <span className="th-cell">
                      <Hash size={14} /> S.No
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <UserRound size={14} /> Customer
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <Phone size={14} /> Contact
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <MapPin size={14} /> Location
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <ShoppingBag size={14} /> Orders
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <IndianRupee size={14} /> Spent
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <BadgeCheck size={14} /> Status
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <Pencil size={14} /> Edit
                    </span>
                  </th>
                  <th>
                    <span className="th-cell">
                      <Trash2 size={14} /> Delete
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="cst-empty">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id || item.userID}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="cst-name-cell">
                          <span
                            className="cst-avatar"
                            style={{ background: customerColor(item.name) }}
                          >
                            {(item.name || 'C').slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.name}</strong>
                            <p className="cst-slug">{item.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="cst-contact">
                          <span>
                            <Phone size={12} /> {item.phone || '—'}
                          </span>
                          <span>
                            <Mail size={12} /> {item.email || '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {[item.city, item.state].filter(Boolean).join(', ') || item.address || '—'}
                      </td>
                      <td>{Number(item.order_count) || 0}</td>
                      <td className="cst-money">₹{money(item.spent)}</td>
                      <td>
                        <span
                          className={`cst-badge ${
                            item.is_active === 0 || item.is_active === false ? 'is-off' : 'is-on'
                          }`}
                        >
                          {item.is_active === 0 || item.is_active === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td>
                        {canEdit ? (
                          <button
                            type="button"
                            className="icon-action edit"
                            title="Edit"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={15} />
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {canDelete ? (
                          <button
                            type="button"
                            className="icon-action delete"
                            title="Delete"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cst-grid">
            {filtered.length === 0 ? (
              <div className="cst-empty">No customers found.</div>
            ) : (
              filtered.map((item) => (
                <article key={item.id || item.userID} className="cst-card">
                  <div className="cst-card-top">
                    <span className="cst-avatar lg" style={{ background: customerColor(item.name) }}>
                      {(item.name || 'C').slice(0, 1).toUpperCase()}
                    </span>
                    <span
                      className={`cst-badge ${
                        item.is_active === 0 || item.is_active === false ? 'is-off' : 'is-on'
                      }`}
                    >
                      {item.is_active === 0 || item.is_active === false ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="cst-card-desc">
                    {item.phone || 'No phone'} · {item.email || 'No email'}
                  </p>
                  <p className="cst-card-desc">
                    {[item.city, item.state].filter(Boolean).join(', ') || item.address || 'No address'}
                  </p>
                  <p className="cst-card-desc">
                    {Number(item.order_count) || 0} orders · ₹{money(item.spent)} spent
                  </p>
                  <div className="cst-card-actions">
                    {canEdit && (
                      <button type="button" className="icon-action edit" onClick={() => openEdit(item)}>
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="icon-action delete"
                        onClick={() => onDelete(item)}
                      >
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
          <div className={`cst-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="cst-backdrop" onClick={closeForm} />
            <aside className={`cst-offcanvas ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <div className="cst-oc-head">
                <div className="cst-oc-title">
                  <span className="cst-oc-icon">
                    <Users size={18} />
                  </span>
                  <div>
                    <h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
                    <p>{editing ? 'Update customer details' : 'Create a walk-in / retail customer'}</p>
                  </div>
                </div>
                <button type="button" className="cst-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={
                  editing
                    ? {
                        ...emptyCustomer,
                        ...editing,
                        is_active: editing.is_active !== 0 && editing.is_active !== false,
                      }
                    : emptyCustomer
                }
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const payload = {
                      id: editing?.id || editing?.userID,
                      name: values.name,
                      phone: values.phone,
                      email: values.email || null,
                      address: values.address,
                      city: values.city || null,
                      state: values.state || null,
                      pincode: values.pincode || null,
                      is_active: !!values.is_active,
                    };
                    await customerServices.save(payload);
                    toast.success(editing ? 'Customer updated' : 'Customer created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="cst-oc-body">
                    <div className="cst-form-grid">
                      <label>
                        Customer name
                        <Field name="name" className="cst-input" placeholder="Full name" />
                        {touched.name && errors.name && (
                          <p className="cst-error">{String(errors.name)}</p>
                        )}
                      </label>
                      <label>
                        Phone
                        <Field name="phone" className="cst-input" placeholder="10-digit mobile" />
                        {touched.phone && errors.phone && (
                          <p className="cst-error">{String(errors.phone)}</p>
                        )}
                      </label>
                      <label>
                        Email (optional)
                        <Field name="email" className="cst-input" placeholder="email@example.com" />
                        {touched.email && errors.email && (
                          <p className="cst-error">{String(errors.email)}</p>
                        )}
                      </label>
                      <label>
                        Address
                        <Field name="address" className="cst-input" placeholder="Street / area" />
                        {touched.address && errors.address && (
                          <p className="cst-error">{String(errors.address)}</p>
                        )}
                      </label>
                      <label>
                        City
                        <Field name="city" className="cst-input" placeholder="City" />
                      </label>
                      <label>
                        State
                        <Field name="state" className="cst-input" placeholder="State" />
                      </label>
                      <label>
                        Pincode
                        <Field name="pincode" className="cst-input" placeholder="6-digit pincode" />
                        {touched.pincode && errors.pincode && (
                          <p className="cst-error">{String(errors.pincode)}</p>
                        )}
                      </label>
                      <label className="cst-check">
                        <Field type="checkbox" name="is_active" />
                        Active customer
                      </label>
                    </div>

                    <div className="cst-oc-foot">
                      <button type="button" className="cst-btn-ghost" onClick={closeForm}>
                        Cancel
                      </button>
                      <button type="submit" className="cst-btn-primary" disabled={isSubmitting}>
                        <Save size={15} />
                        {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Save'}
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
