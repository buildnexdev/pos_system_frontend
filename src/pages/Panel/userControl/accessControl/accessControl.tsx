import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  ShieldCheck,
  Search,
  Save,
  CheckCheck,
  LayoutDashboard,
  Layers,
  Users,
  Tags,
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  Truck,
  BarChart3,
  Wallet,
  Eye,
  PlusSquare,
  Pencil,
  Trash2,
  Square,
  Building2,
  Warehouse,
  Factory,
  LifeBuoy,
  FolderTree,
} from 'lucide-react';
import { accessControlServices } from '../../../../redux/accessControl/accessControl.services';
import { hasRight, PANEL_MODULES, SUPER_ADMIN_MODULE_KEYS } from '../../../../utils/access';
import { RootState } from '../../../../redux/store';
import { Loader } from '../../../../components/ui/Loader';
import './accessControl.scss';

/** Super Admin pages — never assignable to staff */
const ACL_EXCLUDED = SUPER_ADMIN_MODULE_KEYS;

/** Modules where only View applies */
const VIEW_ONLY_MODULES = new Set(['dashboard', 'report', 'finance', 'support']);

const MODULE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  dashboard: { icon: <LayoutDashboard size={16} />, color: '#2563eb' },
  role: { icon: <Layers size={16} />, color: '#7c3aed' },
  access_control: { icon: <ShieldCheck size={16} />, color: '#0f766e' },
  staff: { icon: <Users size={16} />, color: '#db2777' },
  branch: { icon: <Building2 size={16} />, color: '#0369a1' },
  warehouse: { icon: <Warehouse size={16} />, color: '#0f766e' },
  product_type: { icon: <Tags size={16} />, color: '#ea580c' },
  category: { icon: <FolderTree size={16} />, color: '#0369a1' },
  supplier: { icon: <Factory size={16} />, color: '#b45309' },
  catalog: { icon: <Package size={16} />, color: '#0284c7' },
  product: { icon: <Package size={16} />, color: '#b45309' },
  order: { icon: <ShoppingCart size={16} />, color: '#dc2626' },
  customer: { icon: <Users size={16} />, color: '#7c3aed' },
  payment_gateway: { icon: <CreditCard size={16} />, color: '#4f46e5' },
  billing: { icon: <FileText size={16} />, color: '#0891b2' },
  dropshipping: { icon: <Truck size={16} />, color: '#16a34a' },
  report: { icon: <BarChart3 size={16} />, color: '#9333ea' },
  finance: { icon: <Wallet size={16} />, color: '#ca8a04' },
  support: { icon: <LifeBuoy size={16} />, color: '#0ea5e9' },
};

type ActionField = 'can_view' | 'can_create' | 'can_edit' | 'can_delete';

const ACTION_META: Array<{ field: ActionField; label: string; icon: React.ReactNode; color: string }> = [
  { field: 'can_view', label: 'View', icon: <Eye size={14} />, color: '#2563eb' },
  { field: 'can_create', label: 'Create', icon: <PlusSquare size={14} />, color: '#16a34a' },
  { field: 'can_edit', label: 'Edit', icon: <Pencil size={14} />, color: '#ea580c' },
  { field: 'can_delete', label: 'Delete', icon: <Trash2 size={14} />, color: '#dc2626' },
];

function normalizeRight(r: any) {
  const key = String(r.module_key || '');
  const viewOnly = !!r.view_only || VIEW_ONLY_MODULES.has(key);
  const canView = !!r.can_view;
  const canCreate = viewOnly ? false : !!r.can_create;
  const canEdit = viewOnly ? false : !!r.can_edit;
  const canDelete = viewOnly ? false : !!r.can_delete;
  return {
    ...r,
    module_key: key,
    view_only: viewOnly,
    can_view: canView || canCreate || canEdit || canDelete,
    can_create: canCreate,
    can_edit: canEdit,
    can_delete: canDelete,
  };
}

export default function AccessControlPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canEditAcl = hasRight(rights, user, 'access_control', 'edit');

  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | ''>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [moduleRights, setModuleRights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      accessControlServices.http.get('/panel/staff-options'),
      accessControlServices.http.get('/panel/roles').catch(() => ({ data: { roles: [] } })),
    ])
      .then(([staffRes, rolesRes]) => {
        const list = staffRes.data.staff || [];
        setStaff(list);
        setRoles(rolesRes.data.roles || []);
        if (list.length) setUserId(list[0].id || list[0].userID);
        else setUserId('');
      })
      .catch(() => {
        setStaff([]);
        setUserId('');
      });
  }, []);

  useEffect(() => {
    if (!userId) {
      setModuleRights([]);
      return;
    }
    setLoading(true);
    accessControlServices.http
      .get(`/panel/rights/${userId}`)
      .then((res) =>
        setModuleRights(
          (res.data.rights || [])
            .filter((r: any) => !ACL_EXCLUDED.has(String(r.module_key || '')))
            .map(normalizeRight),
        ),
      )
      .catch((e: any) => {
        toast.error(e.response?.data?.message || 'Failed to load rights');
        setModuleRights([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!staff.length) return;
    const visible = roleFilter
      ? staff.filter(
          (s) =>
            String(s.role_id) === roleFilter ||
            String(s.assigned_level) === roleFilter ||
            String(s.role) === roleFilter,
        )
      : staff;
    if (userId && !visible.some((s) => Number(s.id || s.userID) === Number(userId))) {
      setUserId(visible[0] ? Number(visible[0].id || visible[0].userID) : '');
    }
  }, [roleFilter, staff, userId]);

  const filteredStaff = useMemo(() => {
    if (!roleFilter) return staff;
    return staff.filter(
      (s) =>
        String(s.role_id) === roleFilter ||
        String(s.assigned_level) === roleFilter ||
        String(s.role) === roleFilter,
    );
  }, [staff, roleFilter]);

  const filteredRights = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return moduleRights.map((r, index) => ({ ...r, _index: index }));
    return moduleRights
      .map((r, index) => ({ ...r, _index: index }))
      .filter((r) => {
        const label = r.label || PANEL_MODULES.find((m) => m.key === r.module_key)?.label || r.module_key;
        return String(label).toLowerCase().includes(q) || String(r.module_key).toLowerCase().includes(q);
      });
  }, [moduleRights, search]);

  const allSelected = useMemo(
    () =>
      moduleRights.length > 0 &&
      moduleRights.every((r) => {
        if (r.view_only) return !!r.can_view;
        return r.can_view && r.can_create && r.can_edit && r.can_delete;
      }),
    [moduleRights],
  );

  const columnAllSelected = useMemo(() => {
    const map = {} as Record<ActionField, boolean>;
    for (const a of ACTION_META) {
      const rows =
        a.field === 'can_view' ? moduleRights : moduleRights.filter((r) => !r.view_only);
      map[a.field] = rows.length > 0 && rows.every((r) => !!r[a.field]);
    }
    return map;
  }, [moduleRights]);

  const toggle = (index: number, field: ActionField) => {
    if (!canEditAcl) return;
    setModuleRights((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (r.view_only && field !== 'can_view') return r;

        const next = !r[field];
        if (field === 'can_view') {
          if (!next) {
            return { ...r, can_view: false, can_create: false, can_edit: false, can_delete: false };
          }
          return { ...r, can_view: true };
        }
        if (next) return { ...r, [field]: true, can_view: true };
        return { ...r, [field]: false };
      }),
    );
  };

  const toggleSelectAll = () => {
    if (!canEditAcl) return;
    const next = !allSelected;
    setModuleRights((prev) =>
      prev.map((r) =>
        r.view_only
          ? { ...r, can_view: next, can_create: false, can_edit: false, can_delete: false }
          : {
              ...r,
              can_view: next,
              can_create: next,
              can_edit: next,
              can_delete: next,
            },
      ),
    );
  };

  const toggleColumn = (field: ActionField) => {
    if (!canEditAcl) return;
    const next = !columnAllSelected[field];
    setModuleRights((prev) =>
      prev.map((r) => {
        if (r.view_only && field !== 'can_view') return r;
        if (field === 'can_view') {
          if (!next) {
            return { ...r, can_view: false, can_create: false, can_edit: false, can_delete: false };
          }
          return { ...r, can_view: true };
        }
        if (next) return { ...r, [field]: true, can_view: true };
        return { ...r, [field]: false };
      }),
    );
  };

  const onSave = async () => {
    if (!userId || !canEditAcl) return;
    setSaving(true);
    try {
      await accessControlServices.http.put(`/panel/rights/${userId}`, { rights: moduleRights });
      toast.success('Rights saved — staff must re-login to apply');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const staffOptionId = (s: any) => Number(s.id || s.userID);

  return (
    <div className="access-page">
      <div className="access-panel">
        <div className="access-toolbar">
          <div className="access-hero">
            <div className="access-hero-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1>Access Control</h1>
              <p>Assign module rights to staff users</p>
            </div>
          </div>

          <div className="access-toolbar-actions">
            <label className="access-search">
              <Search size={16} className="text-sky-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
              />
            </label>

            <select
              className="access-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              title="Filter by role"
            >
              <option value="">All roles</option>
              {roles
                .filter((r) => Number(r.level) >= 3 && Number(r.level) < 90)
                .map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    Level {r.level} · {r.name}
                  </option>
                ))}
            </select>

            <select
              className="access-select access-user-select"
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select staff</option>
              {filteredStaff.map((s) => (
                <option key={staffOptionId(s)} value={staffOptionId(s)}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>

            {canEditAcl ? (
              <>
                <button
                  type="button"
                  className="access-btn ghost"
                  onClick={toggleSelectAll}
                  disabled={!userId || loading || !moduleRights.length}
                  title={allSelected ? 'Unselect all rights' : 'Select all rights'}
                >
                  {allSelected ? <Square size={15} /> : <CheckCheck size={15} />}
                  {allSelected ? 'Unselect all' : 'Select All'}
                </button>

                <button
                  type="button"
                  className="access-btn primary"
                  onClick={onSave}
                  disabled={!userId || saving || loading}
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="p-10">
            <Loader />
          </div>
        ) : !userId ? (
          <p className="access-empty">No staff users found. Create staff first.</p>
        ) : (
          <div className="access-table-wrap">
            <p className="access-hint">
              {canEditAcl
                ? 'View is required for Create / Edit / Delete. Dashboard, Report, Finance and Help & Support are view-only.'
                : 'View only — you do not have permission to change access rights.'}
            </p>
            <table className="access-table">
              <thead>
                <tr>
                  <th>Module</th>
                  {ACTION_META.map((a) => (
                    <th key={a.field}>
                      <div className="access-th-wrap">
                        {canEditAcl ? (
                          <label
                            className="access-check access-check-header"
                            style={{ ['--check-color' as string]: a.color }}
                            title={`${columnAllSelected[a.field] ? 'Unselect' : 'Select'} all ${a.label}`}
                          >
                            <input
                              type="checkbox"
                              checked={columnAllSelected[a.field]}
                              onChange={() => toggleColumn(a.field)}
                              disabled={!moduleRights.length}
                            />
                            <span />
                          </label>
                        ) : null}
                        <span className="access-th" style={{ color: a.color }}>
                          {a.icon} {a.label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRights.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="access-empty-cell">
                      No modules match your search.
                    </td>
                  </tr>
                ) : (
                  filteredRights.map((r) => {
                    const meta = MODULE_META[r.module_key] || {
                      icon: <Package size={16} />,
                      color: '#64748b',
                    };
                    const label =
                      r.label ||
                      PANEL_MODULES.find((m) => m.key === r.module_key)?.label ||
                      r.module_key;
                    return (
                      <tr key={r.module_key}>
                        <td>
                          <div className="access-module">
                            <span
                              className="access-module-icon"
                              style={{ color: meta.color, background: `${meta.color}18` }}
                            >
                              {meta.icon}
                            </span>
                            <div>
                              <strong>{label}</strong>
                              {r.view_only ? <em className="access-view-only">View only</em> : null}
                            </div>
                          </div>
                        </td>
                        {ACTION_META.map((a) => {
                          const disabled = !canEditAcl || (r.view_only && a.field !== 'can_view');
                          return (
                            <td key={a.field}>
                              <label
                                className={`access-check ${disabled ? 'is-disabled' : ''}`}
                                style={{ ['--check-color' as string]: a.color }}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!r[a.field]}
                                  disabled={disabled}
                                  onChange={() => toggle(r._index, a.field)}
                                />
                                <span />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
