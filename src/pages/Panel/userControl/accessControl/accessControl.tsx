import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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
} from 'lucide-react';
import { accessControlServices } from '../../../../redux/accessControl/accessControl.services';
import { PANEL_MODULES } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import './accessControl.scss';

const MODULE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  dashboard: { icon: <LayoutDashboard size={16} />, color: '#2563eb' },
  role: { icon: <Layers size={16} />, color: '#7c3aed' },
  access_control: { icon: <ShieldCheck size={16} />, color: '#0f766e' },
  staff: { icon: <Users size={16} />, color: '#db2777' },
  product_type: { icon: <Tags size={16} />, color: '#ea580c' },
  product: { icon: <Package size={16} />, color: '#b45309' },
  order: { icon: <ShoppingCart size={16} />, color: '#dc2626' },
  payment_gateway: { icon: <CreditCard size={16} />, color: '#4f46e5' },
  billing: { icon: <FileText size={16} />, color: '#0891b2' },
  dropshipping: { icon: <Truck size={16} />, color: '#16a34a' },
  report: { icon: <BarChart3 size={16} />, color: '#9333ea' },
  finance: { icon: <Wallet size={16} />, color: '#ca8a04' },
};

const ACTION_META = [
  { field: 'can_view' as const, label: 'View', icon: <Eye size={14} />, color: '#2563eb' },
  { field: 'can_create' as const, label: 'Create', icon: <PlusSquare size={14} />, color: '#16a34a' },
  { field: 'can_edit' as const, label: 'Edit', icon: <Pencil size={14} />, color: '#ea580c' },
  { field: 'can_delete' as const, label: 'Delete', icon: <Trash2 size={14} />, color: '#dc2626' },
];

export default function AccessControlPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | ''>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [rights, setRights] = useState<any[]>([]);
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
        if (list.length) setUserId(list[0].id);
      })
      .catch(() => setStaff([]));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    accessControlServices.http
      .get(`/panel/rights/${userId}`)
      .then((res) => setRights(res.data.rights || []))
      .finally(() => setLoading(false));
  }, [userId]);

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
    if (!q) return rights.map((r, index) => ({ ...r, _index: index }));
    return rights
      .map((r, index) => ({ ...r, _index: index }))
      .filter((r) => {
        const label = r.label || PANEL_MODULES.find((m) => m.key === r.module_key)?.label || r.module_key;
        return String(label).toLowerCase().includes(q) || String(r.module_key).toLowerCase().includes(q);
      });
  }, [rights, search]);

  const toggle = (index: number, field: string) => {
    setRights((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: !r[field] } : r)));
  };

  const selectAll = () => {
    setRights((prev) =>
      prev.map((r) => ({
        ...r,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      })),
    );
  };

  const onSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await accessControlServices.http.put(`/panel/rights/${userId}`, { rights });
      toast.success('Rights saved');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

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
              {roles.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  Level {r.level} · {r.name}
                </option>
              ))}
              <option value="admin">System · admin</option>
              <option value="staff">System · staff</option>
            </select>

            <select
              className="access-select access-user-select"
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select staff</option>
              {filteredStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>

            <button type="button" className="access-btn ghost" onClick={selectAll} disabled={!userId || loading}>
              <CheckCheck size={15} /> Select All
            </button>

            <button type="button" className="access-btn primary" onClick={onSave} disabled={!userId || saving || loading}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10"><Loader /></div>
        ) : !userId ? (
          <p className="access-empty">No staff users found. Create staff first.</p>
        ) : (
          <div className="access-table-wrap">
            <table className="access-table">
              <thead>
                <tr>
                  <th>Module</th>
                  {ACTION_META.map((a) => (
                    <th key={a.field}>
                      <span className="access-th" style={{ color: a.color }}>
                        {a.icon} {a.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRights.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="access-empty-cell">No modules match your search.</td>
                  </tr>
                ) : (
                  filteredRights.map((r) => {
                    const meta = MODULE_META[r.module_key] || {
                      icon: <Package size={16} />,
                      color: '#64748b',
                    };
                    const label =
                      r.label || PANEL_MODULES.find((m) => m.key === r.module_key)?.label || r.module_key;
                    return (
                      <tr key={r.module_key}>
                        <td>
                          <div className="access-module">
                            <span className="access-module-icon" style={{ color: meta.color, background: `${meta.color}18` }}>
                              {meta.icon}
                            </span>
                            <strong>{label}</strong>
                          </div>
                        </td>
                        {ACTION_META.map((a) => (
                          <td key={a.field}>
                            <label className="access-check" style={{ ['--check-color' as string]: a.color }}>
                              <input
                                type="checkbox"
                                checked={!!r[a.field]}
                                onChange={() => toggle(r._index, a.field)}
                              />
                              <span />
                            </label>
                          </td>
                        ))}
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
