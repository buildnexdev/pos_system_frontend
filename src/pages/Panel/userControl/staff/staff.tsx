import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Table2,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Hash,
  UserRound,
  BadgeCheck,
  ToggleLeft,
} from 'lucide-react';
import { staffServices } from '../../../../redux/staff/staff.services';
import { RootState } from '../../../../redux/store';
import { hasRight } from '../../../../utils/access';
import { Loader } from '../../../../components/ui/Loader';
import StaffFormOffcanvas from './staffFormOffcanvas';
import './staff.scss';

const AVATAR_COLORS = ['#0f766e', '#b45309', '#1d4ed8', '#be123c', '#7c3aed', '#047857'];

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/i, '')
  .replace(/\/$/, '');

function avatarColor(name: string) {
  const code = Array.from(name || 'A').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function mediaUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

function StaffAvatar({ name, photoUrl, large }: { name?: string; photoUrl?: string | null; large?: boolean }) {
  const src = mediaUrl(photoUrl);
  const initial = (name || 'S').slice(0, 1).toUpperCase();
  if (src) {
    return (
      <span className={`staff-avatar has-photo ${large ? 'lg' : ''}`}>
        <img src={src} alt={name || 'Staff'} />
      </span>
    );
  }
  return (
    <span className={`staff-avatar ${large ? 'lg' : ''}`} style={{ background: avatarColor(name || '') }}>
      {initial}
    </span>
  );
}

export default function StaffPage() {
  const { user, rights } = useSelector((s: RootState) => s.auth);
  const canCreate = hasRight(rights, user, 'staff', 'create');
  const canEdit = hasRight(rights, user, 'staff', 'edit');
  const canDelete = hasRight(rights, user, 'staff', 'delete');

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [formOpen, setFormOpen] = useState(false);
  const [formStaffId, setFormStaffId] = useState<number | 'new' | null>(null);

  const openCreate = () => {
    setFormStaffId('new');
    setFormOpen(true);
  };

  const openEdit = (id: number) => {
    setFormStaffId(id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormStaffId(null);
  };

  const load = async (pageNo = page) => {
    setLoading(true);
    try {
      const { data } = await staffServices.http.get('/panel/staff', {
        params: { q, role, status, page: pageNo, limit: 20 },
      });
      setStaff(data.staff || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    setPage(1);
  }, []);

  const applyFilters = () => {
    setPage(1);
    load(1);
  };

  const onDelete = async (row: any) => {
    if (row.is_mapped) {
      toast.error('Cannot delete: staff is already mapped. Remove access rights/mapping first.');
      return;
    }
    if (!confirm(`Delete ${row.name}?`)) return;
    try {
      await staffServices.http.delete(`/panel/staff/${row.id}`);
      toast.success('Staff deleted');
      load(page);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const onToggleActive = async (row: any) => {
    try {
      await staffServices.http.patch(`/panel/staff/${row.id}/active`);
      toast.success('Status updated');
      load(page);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="staff-page">
      <div className="staff-panel">
        <div className="staff-toolbar">
          <div className="staff-hero">
            <div className="staff-hero-icon">
              <Users size={22} />
            </div>
            <div>
              <h1>Staff</h1>
              <p>
                Total count: <strong>{pagination.total}</strong>
              </p>
            </div>
          </div>

          <div className="staff-toolbar-actions">
            <label className="staff-search">
              <Search size={16} className="text-sky-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Search name, phone, email"
              />
            </label>

            <select className="select staff-filter" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="staff">Staff</option>
            </select>
            <select className="select staff-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="button" className="staff-btn staff-btn-filter" onClick={applyFilters}>
              <Filter size={15} /> Filter
            </button>

            <div className="staff-view-toggle" role="group" aria-label="View mode">
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
              <button type="button" className="staff-btn staff-btn-add" onClick={openCreate}>
                <Plus size={16} /> Add Staff
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-10"><Loader /></div>
        ) : view === 'table' ? (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th><span className="th-cell"><Hash size={14} className="th-icon th-hash" /> S.No</span></th>
                  <th><span className="th-cell"><UserRound size={14} className="th-icon th-name" /> Name</span></th>
                  <th><span className="th-cell"><Phone size={14} className="th-icon th-phone" /> Phone Number</span></th>
                  <th><span className="th-cell"><Mail size={14} className="th-icon th-mail" /> Mail ID</span></th>
                  <th><span className="th-cell"><Shield size={14} className="th-icon th-role" /> Role</span></th>
                  <th><span className="th-cell"><MapPin size={14} className="th-icon th-loc" /> Location</span></th>
                  <th><span className="th-cell"><BadgeCheck size={14} className="th-icon th-status" /> Status</span></th>
                  <th><span className="th-cell"><Pencil size={14} className="th-icon th-edit" /> Edit</span></th>
                  <th><span className="th-cell"><ToggleLeft size={14} className="th-icon th-active" /> Is Active</span></th>
                  <th><span className="th-cell"><Trash2 size={14} className="th-icon th-delete" /> Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="empty-cell">No staff found.</td>
                  </tr>
                ) : (
                  staff.map((row, index) => (
                    <tr key={row.id} className="staff-row" style={{ animationDelay: `${index * 40}ms` }}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>
                        <div className="staff-name-cell">
                          <StaffAvatar name={row.name} photoUrl={row.photo_url} />
                          <strong>{row.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="meta-line">
                          <Phone size={14} className="icon-phone" /> {row.phone || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="meta-line">
                          <Mail size={14} className="icon-mail" /> {row.email}
                        </span>
                      </td>
                      <td>
                        <span className="meta-line capitalize">
                          <Shield size={14} className="icon-role" /> {row.role}
                        </span>
                      </td>
                      <td>
                        <span className="meta-line">
                          <MapPin size={14} className="icon-loc" /> {row.location || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`staff-badge ${row.is_active ? 'is-on' : 'is-off'}`}>
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {canEdit ? (
                          <button
                            type="button"
                            className="icon-action edit"
                            title="Edit"
                            onClick={() => openEdit(row.id)}
                          >
                            <Pencil size={15} />
                          </button>
                        ) : '—'}
                      </td>
                      <td>
                        {canEdit ? (
                          <label className="staff-switch">
                            <input
                              type="checkbox"
                              checked={!!row.is_active}
                              onChange={() => onToggleActive(row)}
                              disabled={row.id === user?.id}
                            />
                            <span />
                          </label>
                        ) : (row.is_active ? 'Yes' : 'No')}
                      </td>
                      <td>
                        {canDelete && row.role === 'staff' ? (
                          <button
                            type="button"
                            className={`icon-action delete ${row.is_mapped ? 'is-disabled' : ''}`}
                            title={row.is_mapped ? 'Mapped staff cannot be deleted' : 'Delete'}
                            onClick={() => onDelete(row)}
                          >
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
          <div className="staff-grid">
            {staff.length === 0 ? (
              <div className="empty-cell">No staff found.</div>
            ) : (
              staff.map((row, index) => (
                <article key={row.id} className="staff-card" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="staff-card-top">
                    <StaffAvatar name={row.name} photoUrl={row.photo_url} large />
                    <span className={`staff-badge ${row.is_active ? 'is-on' : 'is-off'}`}>
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3>{row.name}</h3>
                  <p className="capitalize role-line"><Shield size={14} className="icon-role" /> {row.role}</p>
                  <p className="meta-line"><Phone size={14} className="icon-phone" /> {row.phone || '—'}</p>
                  <p className="meta-line"><Mail size={14} className="icon-mail" /> {row.email}</p>
                  <p className="meta-line"><MapPin size={14} className="icon-loc" /> {row.location || '—'}</p>
                  <div className="staff-card-actions">
                    {canEdit && (
                      <button
                        type="button"
                        className="icon-action edit"
                        title="Edit"
                        onClick={() => openEdit(row.id)}
                      >
                        <Pencil size={15} /> Edit
                      </button>
                    )}
                    {canEdit && (
                      <label className="staff-switch" title="Is Active">
                        <input
                          type="checkbox"
                          checked={!!row.is_active}
                          onChange={() => onToggleActive(row)}
                          disabled={row.id === user?.id}
                        />
                        <span />
                      </label>
                    )}
                    {canDelete && row.role === 'staff' && (
                      <button
                        type="button"
                        className={`icon-action delete ${row.is_mapped ? 'is-disabled' : ''}`}
                        title={row.is_mapped ? 'Mapped staff cannot be deleted' : 'Delete'}
                        onClick={() => onDelete(row)}
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

        <div className="staff-table-footer">
          <p>Total count: <strong>{pagination.total}</strong> · Showing 20 per page</p>
          <div className="staff-pager">
            <button
              type="button"
              className="staff-btn staff-btn-ghost"
              disabled={page <= 1}
              onClick={() => {
                const next = page - 1;
                setPage(next);
                load(next);
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span>Page {pagination.page} / {pagination.totalPages}</span>
            <button
              type="button"
              className="staff-btn staff-btn-ghost"
              disabled={page >= pagination.totalPages}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                load(next);
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <StaffFormOffcanvas
        open={formOpen}
        staffId={formStaffId}
        canDelete={canDelete}
        onClose={closeForm}
        onSaved={() => load(page)}
        onDeleted={() => load(page)}
      />
    </div>
  );
}
