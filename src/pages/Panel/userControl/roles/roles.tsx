import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Shield,
  Crown,
  Store,
  Boxes,
  ShoppingCart,
  Headphones,
  Eye,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ChevronDown,
  Search,
  Upload,
  Download,
} from 'lucide-react';
import { roleServices } from '../../../../redux/role/role.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './roles.scss';

const FALLBACK_LEVELS = [
  { level: 1, label: 'Level 1[Owner / Super Admin]', name: 'Owner / Super Admin', description: 'Complete business and system control', color: '#7c3aed' },
  { level: 2, label: 'Level 2[Admin / Manager]', name: 'Admin / Manager', description: 'Overall store and employee management', color: '#2563eb' },
  { level: 3, label: 'Level 3[Store Manager]', name: 'Store Manager', description: 'Daily store operations and sales', color: '#0f766e' },
  { level: 4, label: 'Level 4[Inventory Manager]', name: 'Inventory Manager', description: 'Products, stock, sizes and variants', color: '#ea580c' },
  { level: 5, label: 'Level 5[Order Manager]', name: 'Order Manager', description: 'Orders, delivery, returns and exchanges', color: '#db2777' },
  { level: 6, label: 'Level 6[Sales Executive]', name: 'Sales Executive', description: 'Customer support and sales operations', color: '#0284c7' },
  { level: 7, label: 'Level 7[Staff / Viewer]', name: 'Staff / Viewer', description: 'Limited access for viewing and basic tasks', color: '#64748b' },
];

const LEVEL_ICONS: Record<number, ReactNode> = {
  1: <Crown size={18} />,
  2: <Shield size={18} />,
  3: <Store size={18} />,
  4: <Boxes size={18} />,
  5: <ShoppingCart size={18} />,
  6: <Headphones size={18} />,
  7: <Eye size={18} />,
};

const AVATAR_COLORS = ['#16a34a', '#2563eb', '#ea580c', '#db2777', '#7c3aed', '#0891b2', '#b45309'];

const schema = Yup.object({
  name: Yup.string().required('Role name is required'),
  code: Yup.string(),
  level: Yup.number().min(1).max(7).required('Please select a level'),
});

function roleCodePrefix(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !['and', 'or', 'of', 'the', 'a', 'an'].includes(w.toLowerCase()));

  if (!words.length) return 'R';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0].toUpperCase()).join('').slice(0, 4);
}

function buildRoleCode(name: string, seq: number, level: number | '') {
  if (!name.trim() || !level) return '';
  return `${roleCodePrefix(name)}-${seq}-L${level}`;
}

function avatarColor(name: string, fallback?: string) {
  if (fallback) return fallback;
  const code = Array.from(name || 'R').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function LevelSelect({
  value,
  options,
  disabled,
  error,
  onChange,
}: {
  value: number | '';
  options: typeof FALLBACK_LEVELS;
  disabled?: boolean;
  error?: boolean;
  onChange: (level: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.level === value);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className={`level-select ${error ? 'has-error' : ''} ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="level-select-trigger"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <div>
          <span className="level-select-label">Select Level</span>
          <strong>{selected ? selected.label : 'Select Level'}</strong>
        </div>
        <span className="level-select-icons">
          {error && <AlertCircle size={16} className="level-warn" />}
          <ChevronDown size={18} />
        </span>
      </button>
      {open && !disabled && (
        <div className="level-select-menu">
          {options.map((opt) => (
            <button
              key={opt.level}
              type="button"
              className={`level-select-option ${value === opt.level ? 'is-active' : ''}`}
              onClick={() => {
                onChange(opt.level);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RolesPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'role', 'create');
  const canEdit = hasRight(rights, user, 'role', 'edit');
  const canDelete = hasRight(rights, user, 'role', 'delete');

  const [roles, setRoles] = useState<any[]>([]);
  const [levels, setLevels] = useState(FALLBACK_LEVELS);
  const [nextSeq, setNextSeq] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [q, setQ] = useState('');
  const [companyID, setCompanyID] = useState<number | null>(user?.companyID ?? null);
  const importRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await roleServices.http.get('/panel/roles');
      const list = data.roles || [];
      setRoles(list);
      setLevels(data.levels?.length ? data.levels : FALLBACK_LEVELS);
      setNextSeq(Number(data.next_seq) || list.length + 1);
      if (data.companyID) setCompanyID(Number(data.companyID));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load company roles');
      setRoles([]);
      setLevels(FALLBACK_LEVELS);
      setNextSeq(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((role) => {
      return (
        String(role.name || '').toLowerCase().includes(term) ||
        String(role.code || '').toLowerCase().includes(term) ||
        String(role.description || '').toLowerCase().includes(term)
      );
    });
  }, [roles, q]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: any) => {
    setEditing(role);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const onDelete = async (role: any) => {
    if (role.is_default) {
      toast.error('Default roles cannot be deleted');
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await roleServices.http.delete(`/panel/roles/${role.id}`);
      toast.success('Role deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const onExport = () => {
    const payload = filtered.map((r) => ({
      name: r.name,
      code: r.code,
      level: r.level,
      description: r.description,
      color: r.color,
      is_active: r.is_active !== 0 && r.is_active !== false ? 1 : 0,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildnex-kadai-roles-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roles exported');
  };

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const rows = JSON.parse(text);
      if (!Array.isArray(rows) || !rows.length) {
        toast.error('Import file must be a non-empty JSON array');
        return;
      }
      let created = 0;
      for (const row of rows) {
        if (!row?.name) continue;
        await roleServices.http.post('/panel/roles', {
          name: String(row.name).trim(),
          level: Number(row.level) || 7,
          description: row.description || '',
          color: row.color || undefined,
        });
        created += 1;
      }
      toast.success(`Imported ${created} role(s)`);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
  };

  const editSeq = useMemo(() => {
    if (!editing?.code) return editing?.id || nextSeq;
    const parts = String(editing.code).split('-');
    return Number(parts[1]) || editing.id || nextSeq;
  }, [editing, nextSeq]);

  const initialValues = useMemo(
    () =>
      editing
        ? {
            name: editing.name || '',
            code: editing.code || '',
            level: Number(editing.level) || ('' as number | ''),
          }
        : {
            name: '',
            code: '',
            level: '' as number | '',
          },
    [editing],
  );

  const refreshCode = (
    setFieldValue: (field: string, value: any) => void,
    name: string,
    level: number | '',
  ) => {
    if (editing?.is_default) return;
    const seq = editing ? editSeq : nextSeq;
    setFieldValue('code', buildRoleCode(name, seq, level));
  };

  return (
    <div className="roles-page">
      <div className="roles-panel">
        <div className="roles-toolbar clean">
          <div className="roles-toolbar-left">
            <label className="roles-search">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or code"
              />
            </label>
            {companyID ? (
              <span className="roles-company-badge" title="Company-scoped roles">
                Company #{companyID} · {filtered.length}
              </span>
            ) : null}
          </div>

          <div className="roles-toolbar-actions">
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={onImportFile}
            />
            {canCreate && (
              <button type="button" className="roles-btn soft" onClick={() => importRef.current?.click()}>
                <Upload size={15} /> Import
              </button>
            )}
            <button type="button" className="roles-btn soft" onClick={onExport}>
              <Download size={15} /> Export
            </button>
            {canCreate && (
              <button type="button" className="roles-btn-add" onClick={openCreate}>
                <Plus size={16} /> New role
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="roles-loading">
            <Loader />
            <p>Loading roles...</p>
          </div>
        ) : (
          <div className="roles-grid">
            {filtered.length === 0 ? (
              <div className="roles-empty">No roles found.</div>
            ) : (
              filtered.map((role, index) => {
                const active = role.is_active !== 0 && role.is_active !== false;
                return (
                  <article
                    key={role.id || role.code || role.level}
                    className="role-card"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      ['--role-color' as string]: role.color || avatarColor(role.name),
                    }}
                  >
                    <div className="role-card-top">
                      <span className="role-icon">{LEVEL_ICONS[role.level] || <Shield size={18} />}</span>
                      <span className={`roles-status ${active ? 'is-on' : 'is-off'}`}>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3>{role.name}</h3>
                    <p className="role-code-line">{String(role.code || '').toUpperCase()}</p>
                    <p>{role.description || 'No description'}</p>
                    <div className="role-card-foot">
                      <span className="roles-level-pill">Level {role.level}</span>
                      <div className="role-card-actions">
                        {canEdit && (
                          <button type="button" className="roles-edit-btn" onClick={() => openEdit(role)}>
                            <Pencil size={14} /> Edit
                          </button>
                        )}
                        {canDelete && !role.is_default && (
                          <button type="button" className="role-action delete" onClick={() => onDelete(role)}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="role-form-overlay">
          <div className="role-form-backdrop" onClick={closeForm} />
          <div className="role-form-modal" role="dialog" aria-modal="true">
            <div className="role-form-head">
              <div className="role-form-title">
                <span className="role-form-icon"><Layers size={18} /></span>
                <div>
                  <h2>{editing ? 'Edit Role' : 'New Role'}</h2>
                  <p>{editing ? 'Update role details' : 'Create a new role'}</p>
                </div>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close"><X size={18} /></button>
            </div>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const payload = {
                    name: values.name.trim(),
                    level: Number(values.level),
                  };
                  if (editing?.id) {
                    await roleServices.http.put(`/panel/roles/${editing.id}`, payload);
                    toast.success('Role updated');
                  } else {
                    await roleServices.http.post('/panel/roles', payload);
                    toast.success('Role created');
                  }
                  closeForm();
                  load();
                } catch (e: any) {
                  toast.error(e.response?.data?.message || 'Save failed');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, setFieldValue, errors, touched, isSubmitting, submitCount }) => {
                const levelError = (!!touched.level || submitCount > 0) && !!errors.level;
                return (
                  <Form className="role-form-body">
                    <div>
                      <label>Role Name</label>
                      <Field
                        name="name"
                        className="role-form-input"
                        placeholder="Enter role name"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const name = e.target.value;
                          setFieldValue('name', name);
                          refreshCode(setFieldValue, name, values.level);
                        }}
                      />
                      {touched.name && errors.name && <p className="role-form-error">{String(errors.name)}</p>}
                    </div>

                    <div>
                      <label>Role Code <span className="role-auto-tag">auto</span></label>
                      <Field name="code" className="role-form-input" readOnly placeholder="SA-11-L1" />
                      <p className="role-form-hint">Format: PREFIX-SEQ-LEVEL (e.g. SA-11-L1, A-12-L2)</p>
                      {touched.code && errors.code && <p className="role-form-error">{String(errors.code)}</p>}
                    </div>

                    <div className="role-level-field">
                      <LevelSelect
                        value={values.level === '' ? '' : Number(values.level)}
                        options={levels}
                        disabled={!!editing?.is_default}
                        error={levelError}
                        onChange={(level) => {
                          setFieldValue('level', level);
                          refreshCode(setFieldValue, values.name, level);
                        }}
                      />
                      {levelError && <p className="role-form-error">{String(errors.level)}</p>}
                      {editing?.is_default && (
                        <p className="role-form-hint">Default role level is locked. Only role name can be updated.</p>
                      )}
                    </div>

                    <div className="role-form-actions">
                      <button type="button" className="role-form-btn ghost" onClick={closeForm}>Cancel</button>
                      <button type="submit" className="role-form-btn primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : editing ? 'Update Role' : 'Create Role'}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
