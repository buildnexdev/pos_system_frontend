import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  FolderTree,
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  X,
  Hash,
  FileText,
  Link2,
  BadgeCheck,
  Save,
} from 'lucide-react';
import { catalogServices } from '../../../../redux/catalog/catalog.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import '../productTypes/productTypes.scss';

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  slug: Yup.string().required('Slug is required'),
  description: Yup.string(),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const COLORS = ['#0284c7', '#0f766e', '#7c3aed', '#db2777', '#ea580c', '#2563eb', '#b45309'];

function catColor(name: string) {
  const code = Array.from(name || 'C').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

export default function CategoriesPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'category', 'create');
  const canEdit = hasRight(rights, user, 'category', 'edit');
  const canDelete = hasRight(rights, user, 'category', 'delete');

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
      const { data } = await catalogServices.http.get('/panel/categories');
      setItems(data.categories || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load categories');
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
      String(item.slug || '').toLowerCase().includes(term) ||
      String(item.description || '').toLowerCase().includes(term)
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
    if (!confirm(`Delete category "${item.name}"?`)) return;
    try {
      await catalogServices.http.delete(`/panel/categories/${item.id}`);
      toast.success('Deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="ptype-page">
      <div className="ptype-panel">
        <div className="ptype-toolbar">
          <div className="ptype-hero">
            <div className="ptype-hero-icon">
              <FolderTree size={22} />
            </div>
            <div>
              <h1>Category</h1>
              <p>
                Total count: <strong>{items.length}</strong>
              </p>
            </div>
          </div>

          <div className="ptype-toolbar-actions">
            <label className="ptype-search">
              <Search size={16} className="text-orange-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, slug, description"
              />
            </label>

            <div className="ptype-view-toggle" role="group" aria-label="View mode">
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
              <button type="button" className="ptype-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Category
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="ptype-loading">
            <Loader />
            <p>Loading categories...</p>
          </div>
        ) : view === 'table' ? (
          <div className="ptype-table-wrap">
            <table className="ptype-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><FolderTree size={14} className="th-type" /> Category</span></th>
                  <th><span className="th-cell"><FileText size={14} className="th-desc" /> Description</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-status" /> Products</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="ptype-empty">No categories found.</td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id} className="ptype-row" style={{ animationDelay: `${index * 40}ms` }}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="ptype-name-cell">
                          <span className="ptype-avatar" style={{ background: catColor(item.name) }}>
                            {(item.name || 'C').slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.name}</strong>
                            <p className="ptype-slug"><Link2 size={12} /> {item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="ptype-desc">{item.description || '—'}</td>
                      <td>
                        <span className="ptype-badge is-on">{Number(item.product_count) || 0}</span>
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
          <div className="ptype-grid">
            {filtered.length === 0 ? (
              <div className="ptype-empty">No categories found.</div>
            ) : (
              filtered.map((item, index) => (
                <article key={item.id} className="ptype-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="ptype-card-top">
                    <span className="ptype-avatar lg" style={{ background: catColor(item.name) }}>
                      {(item.name || 'C').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="ptype-badge is-on">{Number(item.product_count) || 0} products</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="ptype-slug"><Link2 size={12} /> {item.slug}</p>
                  <p className="ptype-card-desc">{item.description || 'No description'}</p>
                  <div className="ptype-card-actions">
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
          <div className={`ptype-overlay ${formVisible ? 'is-open' : ''}`}>
            <div className="ptype-backdrop" onClick={closeForm} />
            <aside className={`ptype-offcanvas ${formVisible ? 'is-open' : ''}`} role="dialog" aria-modal="true">
              <div className="ptype-oc-head">
                <div className="ptype-oc-title">
                  <span className="ptype-oc-icon">
                    <FolderTree size={18} />
                  </span>
                  <div>
                    <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
                    <p>{editing ? 'Update category details' : 'Create a new category'}</p>
                  </div>
                </div>
                <button type="button" className="ptype-oc-close" onClick={closeForm} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <Formik
                enableReinitialize
                initialValues={{
                  name: editing?.name || '',
                  slug: editing?.slug || '',
                  description: editing?.description || '',
                }}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    if (editing) await catalogServices.http.put(`/panel/categories/${editing.id}`, values);
                    else await catalogServices.http.post('/panel/categories', values);
                    toast.success(editing ? 'Category updated' : 'Category created');
                    closeForm();
                    load();
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Save failed');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ setFieldValue, errors, touched, isSubmitting }) => (
                  <Form className="ptype-oc-body">
                    <div>
                      <label>Name</label>
                      <Field
                        name="name"
                        className="ptype-input"
                        placeholder="e.g. Men"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('name', e.target.value);
                          if (!editing) setFieldValue('slug', slugify(e.target.value));
                        }}
                      />
                      {touched.name && errors.name && <p className="ptype-error">{String(errors.name)}</p>}
                    </div>

                    <div>
                      <label>Slug</label>
                      <Field name="slug" className="ptype-input" placeholder="men" />
                      {touched.slug && errors.slug && <p className="ptype-error">{String(errors.slug)}</p>}
                    </div>

                    <div>
                      <label>Description</label>
                      <Field as="textarea" name="description" rows={4} className="ptype-input" placeholder="Short description" />
                    </div>

                    <div className="ptype-oc-actions">
                      <button type="button" className="ptype-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="ptype-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="ptype-spinner" /> Saving...
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
