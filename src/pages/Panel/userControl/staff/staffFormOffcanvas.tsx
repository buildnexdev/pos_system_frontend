import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  UserRound,
  MapPin,
  GraduationCap,
  Briefcase,
  Building2,
  FileText,
  History,
  ClipboardList,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  CloudUpload,
  Save,
  CreditCard,
  UserPlus,
  Pencil,
  KeyRound,
  ToggleLeft,
  ToggleRight,
  Clock3,
  Eye,
  EyeOff,
  Mail,
  Upload,
  ExternalLink,
  FileImage,
} from 'lucide-react';
import { staffServices } from '../../../../redux/staff/staff.services';
import { Loader } from '../../../../components/ui/Loader';
import PincodeInput from '../../../../components/ui/PincodeInput';
import IfscInput from '../../../../components/ui/IfscInput';
import {
  phoneField,
  aadhaarField,
  panField,
  pincodeField,
  ifscField,
  accountNumberField,
} from '../../../../utils/fieldValidators';
import './staffFormOffcanvas.scss';

const SIDE_NAV = [
  { key: 'basic', label: 'Basic details', icon: UserRound, title: 'Personal detail' },
  { key: 'address', label: 'Address', icon: MapPin, title: 'Address detail' },
  { key: 'education', label: 'Education', icon: GraduationCap, title: 'Education detail' },
  { key: 'experience', label: 'Experience', icon: Briefcase, title: 'Experience detail' },
  { key: 'bank', label: 'Bank details', icon: CreditCard, title: 'Bank detail' },
  { key: 'office', label: 'Office details', icon: Building2, title: 'Office detail' },
  { key: 'documents', label: 'Documents', icon: FileText, title: 'Documents' },
  { key: 'history', label: 'History', icon: History, title: 'History' },
] as const;

const STEPS = SIDE_NAV.filter((s) => s.key !== 'history');

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/i, '')
  .replace(/\/$/, '');

function mediaUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

function isImageUrl(url?: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)(\?|$)/i.test(String(url || ''));
}

function isPdfUrl(url?: string) {
  return /\.pdf(\?|$)/i.test(String(url || ''));
}

function historyMeta(action?: string) {
  const key = String(action || '').toLowerCase();
  if (key.includes('create')) {
    return { label: 'Created', tone: 'create', Icon: UserPlus };
  }
  if (key.includes('password')) {
    return { label: 'Password', tone: 'password', Icon: KeyRound };
  }
  if (key.includes('activat') && !key.includes('deactivat')) {
    return { label: 'Activated', tone: 'on', Icon: ToggleRight };
  }
  if (key.includes('deactivat') || key.includes('inactive')) {
    return { label: 'Deactivated', tone: 'off', Icon: ToggleLeft };
  }
  if (key.includes('delete')) {
    return { label: 'Deleted', tone: 'danger', Icon: Trash2 };
  }
  return { label: 'Updated', tone: 'update', Icon: Pencil };
}

function formatHistoryWhen(value?: string) {
  if (!value) return { date: '—', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: String(value), time: '' };
  return {
    date: d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

const staffSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: phoneField(true),
  gender: Yup.string().required('Gender is required'),
  marital_status: Yup.string().required('Marital status is required'),
  date_of_birth: Yup.string().required('Date of birth is required'),
  father_name: Yup.string().required('Father name is required'),
  aadhaar: aadhaarField(false),
  pan: panField(false),
  emergency_phone: phoneField(false),
  pincode: pincodeField(false),
  ifsc_code: ifscField(false),
  account_number: accountNumberField(false),
  roleID: Yup.string().nullable(),
  branchID: Yup.string().nullable(),
  warehouseID: Yup.string().nullable(),
  password: Yup.string().test('pwd', 'Password must be at least 6 characters', (v) => !v || String(v).length >= 6),
  confirm_password: Yup.string().test('confirm', 'Passwords do not match', function (v) {
    const pwd = this.parent.password || '';
    if (!pwd) return true;
    return String(v || '') === String(pwd);
  }),
});

const emptyEdu = { degree: '', institution: '', year_from: '', year_to: '', grade: '' };
const emptyExp = { company: '', designation: '', year_from: '', year_to: '', description: '' };
const emptyDoc = { doc_type: '', doc_name: '', file_url: '' };

type TabKey = (typeof SIDE_NAV)[number]['key'];

type Props = {
  open: boolean;
  staffId: number | 'new' | null;
  canDelete?: boolean;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
};

function splitName(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  if (!parts.length || !parts[0]) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function calcAge(dob?: string) {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${Math.max(0, age)} years`;
}

function emptyForm() {
  return {
    employee_code: '',
    first_name: '',
    initial_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    marital_status: '',
    father_name: '',
    mother_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    roleID: '',
    branchID: '',
    warehouseID: '',
    role: 'staff',
    is_active: true,
    aadhaar: '',
    pan: '',
    emergency_name: '',
    emergency_phone: '',
    photo_url: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc_code: '',
    bank_branch: '',
    bank_address: '',
    department: '',
    designation: '',
    join_date: '',
    employment_type: '',
    work_location: '',
    reporting_to: '',
    education: [{ ...emptyEdu }],
    experience: [{ ...emptyExp }],
    documents: [{ ...emptyDoc }],
  };
}

function buildPayload(
  values: ReturnType<typeof emptyForm>,
  opts: { section?: TabKey | 'all' } = {},
) {
  const name = [values.first_name, values.initial_name, values.last_name]
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(' ');

  const section = opts.section || 'all';
  const payload: Record<string, unknown> = {
    name,
    email: values.email,
    phone: values.phone,
    password: values.password,
    role: 'staff',
    roleID: values.roleID ? Number(values.roleID) : null,
    branchID: values.branchID ? Number(values.branchID) : 0,
    warehouseID: values.warehouseID ? Number(values.warehouseID) : 0,
    is_active: values.is_active,
    address: values.address,
    city: values.city,
    state: values.state,
    pincode: values.pincode,
    profile: {
      employee_code: values.employee_code || null,
      initial_name: values.initial_name || null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
      blood_group: values.blood_group || null,
      marital_status: values.marital_status || null,
      father_name: values.father_name || null,
      mother_name: values.mother_name || null,
      aadhaar: values.aadhaar || null,
      pan: values.pan || null,
      emergency_name: values.emergency_name || null,
      emergency_phone: values.emergency_phone || null,
      photo_url: values.photo_url || null,
      bank_name: values.bank_name || null,
      account_holder: values.account_holder || null,
      account_number: values.account_number || null,
      ifsc_code: values.ifsc_code || null,
      bank_branch: values.bank_branch || null,
      bank_address: values.bank_address || null,
      department: values.department || null,
      designation: values.designation || null,
      join_date: values.join_date || null,
      employment_type: values.employment_type || null,
      work_location: values.work_location || null,
      reporting_to: values.reporting_to || null,
      landmark: values.landmark || null,
      country: values.country || 'India',
    },
  };

  // Only send tab sections being saved so empty tabs don't wipe existing rows
  if (section === 'all' || section === 'education') {
    payload.education = (values.education || []).filter((r) => r.degree && r.institution);
  }
  if (section === 'all' || section === 'experience') {
    payload.experience = (values.experience || []).filter((r) => r.company && r.designation);
  }
  if (section === 'all' || section === 'documents') {
    payload.documents = (values.documents || []).filter((r) => r.doc_type && r.doc_name && r.file_url);
  }

  return payload;
}

export default function StaffFormOffcanvas({
  open,
  staffId,
  canDelete,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const isEdit = staffId !== 'new' && staffId != null;
  const [tab, setTab] = useState<TabKey>('basic');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [mapped, setMapped] = useState(false);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [visible, setVisible] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [initial, setInitial] = useState(emptyForm());

  const stepIndex = useMemo(
    () => Math.max(0, STEPS.findIndex((s) => s.key === tab)),
    [tab],
  );

  const activeMeta = SIDE_NAV.find((n) => n.key === tab) || SIDE_NAV[0];
  const effectiveId = isEdit ? Number(staffId) : createdId;

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      staffServices.http.get('/panel/roles').catch(() => ({ data: { roles: [] } })),
      staffServices.http.get('/panel/branches').catch(() => ({ data: { items: [] } })),
      staffServices.http.get('/panel/warehouses').catch(() => ({ data: { warehouses: [] } })),
    ]).then(([rolesRes, branchRes, whRes]) => {
      // Hide Owner / Super Admin (L1) and Admin / Manager (L2)
      setRoleOptions(
        (rolesRes.data.roles || []).filter((r: any) => {
          const level = Number(r.level);
          return Number.isFinite(level) && level >= 3 && level < 90;
        })
      );
      setBranchOptions((branchRes.data.items || []).filter((b: any) => Number(b.is_active) !== 0));
      setWarehouseOptions(whRes.data.warehouses || []);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTab('basic');
    setAvatarPreview(null);
    setHistory([]);
    setMapped(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCreatedId(null);

    if (!isEdit) {
      setInitial({
        ...emptyForm(),
        employee_code: 'Auto on save',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    staffServices.http
      .get(`/panel/staff/${staffId}`)
      .then((res) => {
        const s = res.data.staff;
        const p = res.data.profile || s.profile || {};
        const names = splitName(s.name || '');
        setInitial({
          ...emptyForm(),
          employee_code: s.employee_code || p.employee_code || `EMP${String(s.id).padStart(5, '0')}`,
          first_name: names.first_name,
          initial_name: p.initial_name || '',
          last_name: names.last_name,
          date_of_birth: p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '',
          gender: p.gender || '',
          blood_group: p.blood_group || '',
          marital_status: p.marital_status || '',
          father_name: p.father_name || '',
          mother_name: p.mother_name || '',
          email: s.email || '',
          phone: s.phone || '',
          password: '',
          confirm_password: '',
          roleID: s.roleID ? String(s.roleID) : '',
          branchID: s.branchID ? String(s.branchID) : '',
          warehouseID: s.warehouseID ? String(s.warehouseID) : '',
          role: s.role || 'staff',
          is_active: !!s.is_active,
          aadhaar: p.aadhaar || '',
          pan: p.pan || '',
          emergency_name: p.emergency_name || '',
          emergency_phone: p.emergency_phone || '',
          photo_url: p.photo_url || '',
          address: s.address || '',
          landmark: p.landmark || '',
          city: s.city || '',
          state: s.state || '',
          pincode: s.pincode || '',
          country: p.country || 'India',
          bank_name: p.bank_name || '',
          account_holder: p.account_holder || '',
          account_number: p.account_number || '',
          ifsc_code: p.ifsc_code || '',
          bank_branch: p.bank_branch || '',
          bank_address: p.bank_address || '',
          department: p.department || '',
          designation: p.designation || '',
          join_date: p.join_date ? String(p.join_date).slice(0, 10) : '',
          employment_type: p.employment_type || '',
          work_location: p.work_location || '',
          reporting_to: p.reporting_to || '',
          education: res.data.education?.length
            ? res.data.education.map((r: any) => ({
                degree: r.degree || '',
                institution: r.institution || '',
                year_from: r.year_from || '',
                year_to: r.year_to || '',
                grade: r.grade || '',
              }))
            : [{ ...emptyEdu }],
          experience: res.data.experience?.length
            ? res.data.experience.map((r: any) => ({
                company: r.company || '',
                designation: r.designation || '',
                year_from: r.year_from || '',
                year_to: r.year_to || '',
                description: r.description || '',
              }))
            : [{ ...emptyExp }],
          documents: res.data.documents?.length
            ? res.data.documents.map((r: any) => ({
                doc_type: r.doc_type || '',
                doc_name: r.doc_name || '',
                file_url: r.file_url || '',
              }))
            : [{ ...emptyDoc }],
        });
        if (p.photo_url) setAvatarPreview(p.photo_url);
        setHistory(res.data.history || []);
        setMapped(!!s.is_mapped);
      })
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [open, staffId, isEdit]);

  const goNext = () => {
    const idx = STEPS.findIndex((s) => s.key === tab);
    if (idx >= 0 && idx < STEPS.length - 1) setTab(STEPS[idx + 1].key);
  };

  const goPrev = () => {
    const idx = STEPS.findIndex((s) => s.key === tab);
    if (idx > 0) setTab(STEPS[idx - 1].key);
  };

  const onDelete = async () => {
    if (!isEdit) return;
    if (mapped) {
      toast.error('Cannot delete: staff is already mapped. Remove access rights/mapping first.');
      return;
    }
    if (!confirm('Delete this staff member?')) return;
    try {
      await staffServices.http.delete(`/panel/staff/${staffId}`);
      toast.success('Staff deleted');
      onDeleted?.();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const uploadStaffDocument = async (
    file: File,
    index: number,
    setFieldValue: (field: string, value: any) => void,
    values: ReturnType<typeof emptyForm>,
  ) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setUploadingDocIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await staffServices.http.post('/panel/upload/staff-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipLoading: true,
      } as any);
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('Upload failed');
      setFieldValue(`documents.${index}.file_url`, url);
      const currentName = values?.documents?.[index]?.doc_name;
      if (!currentName) {
        setFieldValue(
          `documents.${index}.doc_name`,
          file.name.replace(/\.[^.]+$/, '') || file.name,
        );
      }
      toast.success('Document uploaded');
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setUploadingDocIndex(null);
    }
  };

  const onPickAvatar = async (file?: File | null, setFieldValue?: (f: string, v: any) => void) => {
    if (!file) {
      setAvatarPreview(null);
      setFieldValue?.('photo_url', '');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await staffServices.http.post('/panel/upload/staff-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipLoading: true,
      } as any);
      const url = data?.data?.url || data?.url || '';
      if (!url) throw new Error('Upload failed');
      URL.revokeObjectURL(localPreview);
      setAvatarPreview(url);
      setFieldValue?.('photo_url', url);
      toast.success('Photo uploaded');
    } catch (e: any) {
      URL.revokeObjectURL(localPreview);
      setAvatarPreview(null);
      setFieldValue?.('photo_url', '');
      toast.error(e.response?.data?.message || e.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveStaff = async (
    values: ReturnType<typeof emptyForm>,
    opts: { stayOpen?: boolean; goNextAfter?: boolean; section?: TabKey | 'all' } = {},
  ) => {
    if (!values.first_name?.trim() || !values.last_name?.trim()) {
      toast.error('First name and last name are required');
      setTab('basic');
      return false;
    }
    if (!values.email?.trim()) {
      toast.error('Email is required');
      setTab('basic');
      return false;
    }

    const section = opts.section || (opts.goNextAfter || !opts.stayOpen ? 'all' : tab);
    const needsAccountCreate = !isEdit && !createdId && !effectiveId;
    const passwordGate =
      needsAccountCreate &&
      (section === 'office' || section === 'all' || tab === 'office' || !opts.stayOpen);

    // Password lives on Office — don't yank early tabs to Office on Save & next
    if (needsAccountCreate && !values.password) {
      if (passwordGate) {
        toast.error('Password is required');
        setTab('office');
        return false;
      }
      if (opts.goNextAfter) {
        goNext();
        return true;
      }
      toast.success(`${activeMeta.label} kept — set password in Office details to create account`);
      return true;
    }

    if (values.password && values.password !== values.confirm_password) {
      toast.error('Passwords do not match');
      setTab('office');
      return false;
    }

    const payload = buildPayload(values, { section });
    try {
      if (effectiveId) {
        await staffServices.http.put(`/panel/staff/${effectiveId}`, payload);
        toast.success(`${activeMeta.label} saved`);
      } else {
        const res = await staffServices.http.post('/panel/staff', payload);
        const newId = res.data?.id ?? res.data?.data?.id;
        if (newId) {
          setCreatedId(Number(newId));
          setInitial((prev) => ({
            ...prev,
            ...values,
            employee_code: `EMP${String(newId).padStart(5, '0')}`,
            password: '',
            confirm_password: '',
          }));
        }
        toast.success('Staff created');
      }
      onSaved();
      if (opts.goNextAfter) goNext();
      if (!opts.stayOpen && !opts.goNextAfter) onClose();
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
      return false;
    }
  };

  if (!open) return null;

  return createPortal(
    <div className={`staff-form-overlay ${visible ? 'is-open' : ''}`}>
      <div className="staff-form-backdrop" onClick={onClose} />
      <aside
        className={`staff-form-offcanvas ${visible ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-form-offcanvas-title"
      >
        <button type="button" className="staff-form-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {loading ? (
          <div className="staff-form-loading"><Loader /></div>
        ) : (
          <Formik
            enableReinitialize
            initialValues={initial}
            validationSchema={staffSchema}
              validateOnChange
              validateOnBlur
            onSubmit={async (values, { setSubmitting }) => {
              await saveStaff(values, { stayOpen: false });
              setSubmitting(false);
            }}
          >
            {({ values, setFieldValue, isSubmitting, errors, touched }) => {
              const displayName = [values.first_name, values.initial_name, values.last_name]
                .map((p) => (p || '').trim())
                .filter(Boolean)
                .join(' ') || 'new staff';

              return (
                <Form className="staff-form-shell">
                  <div className="staff-form-side">
                    <div className="staff-form-side-head">
                      <h2>Staff information</h2>
                      <p>{isEdit || createdId ? 'Edit profile' : 'Create profile'}</p>
                    </div>

                    <nav className="staff-form-side-nav">
                      {SIDE_NAV.map((item) => {
                        if (item.key === 'history' && !(isEdit || createdId)) return null;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            className={`staff-form-nav-btn ${tab === item.key ? 'is-active' : ''}`}
                            onClick={() => setTab(item.key)}
                          >
                            <Icon size={16} />
                            {item.label}
                          </button>
                        );
                      })}
                    </nav>

                    <div className="staff-form-side-foot">
                      {isEdit && canDelete && (
                        <button type="button" className="staff-form-delete-user" onClick={onDelete}>
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                      <button type="button" className="staff-form-close-side" onClick={onClose}>
                        <X size={16} /> Close
                      </button>
                    </div>
                  </div>

                  <section className="staff-form-main">
                    <div className="staff-form-main-head">
                      <span className="staff-form-main-icon">
                        <ClipboardList size={18} />
                      </span>
                      <div>
                        <h3 id="staff-form-offcanvas-title">{activeMeta.title}</h3>
                        <p>
                          {isEdit || createdId
                            ? `Updating ${displayName} — save each tab anytime`
                            : 'Fill basic details first, then continue through each tab'}
                        </p>
                      </div>
                    </div>

                    {tab !== 'history' && (
                      <div className="staff-form-stepper">
                        {STEPS.map((step, i) => (
                          <button
                            key={step.key}
                            type="button"
                            className={`staff-form-step ${i <= stepIndex ? 'is-on' : ''} ${tab === step.key ? 'is-current' : ''}`}
                            onClick={() => setTab(step.key)}
                            title={step.label}
                          >
                            <span>{i + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="staff-form-content">
                      {tab === 'basic' && (
                        <>
                          <div className="staff-form-card">
                            <div className="staff-form-section-title">Identity</div>
                            <div className="staff-form-grid">
                              <div>
                                <label>
                                  Employee ID <span className="staff-form-hint">(auto)</span>
                                </label>
                                <Field
                                  name="employee_code"
                                  className="staff-form-input is-readonly"
                                  readOnly
                                  disabled
                                  placeholder="Auto-generated"
                                />
                              </div>
                              <div className="staff-photo-field">
                                <label>Profile photo</label>
                                <div className="staff-photo-row">
                                  <div className={`staff-form-avatar ${uploadingPhoto ? 'is-uploading' : ''}`}>
                                    {avatarPreview ? (
                                      <img src={mediaUrl(avatarPreview)} alt="Profile" />
                                    ) : (
                                      <em>No photo</em>
                                    )}
                                    {uploadingPhoto && (
                                      <div className="staff-photo-overlay" role="status" aria-live="polite">
                                        <span className="staff-photo-spinner" />
                                        <small>Uploading…</small>
                                      </div>
                                    )}
                                  </div>
                                  <div className="staff-form-avatar-actions">
                                    <input
                                      ref={fileRef}
                                      type="file"
                                      accept="image/*"
                                      hidden
                                      disabled={uploadingPhoto}
                                      onChange={(e) => onPickAvatar(e.target.files?.[0], setFieldValue)}
                                    />
                                    <button
                                      type="button"
                                      className={`staff-form-file-btn ${uploadingPhoto ? 'is-busy' : ''}`}
                                      disabled={uploadingPhoto}
                                      onClick={() => !uploadingPhoto && fileRef.current?.click()}
                                    >
                                      {uploadingPhoto ? (
                                        <>
                                          <span className="staff-photo-spinner sm" /> Uploading…
                                        </>
                                      ) : (
                                        <>
                                          <CloudUpload size={15} /> Upload photo
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label>First name <span className="req">*</span></label>
                                <Field name="first_name" className="staff-form-input" placeholder="First" />
                                {touched.first_name && errors.first_name && (
                                  <p className="staff-form-error">{String(errors.first_name)}</p>
                                )}
                              </div>
                              <div>
                                <label>Initial</label>
                                <Field name="initial_name" className="staff-form-input" placeholder="Initial" />
                              </div>

                              <div>
                                <label>Last name <span className="req">*</span></label>
                                <Field name="last_name" className="staff-form-input" placeholder="Last" />
                                {touched.last_name && errors.last_name && (
                                  <p className="staff-form-error">{String(errors.last_name)}</p>
                                )}
                              </div>
                              <div>
                                <label>Date of birth <span className="req">*</span></label>
                                <Field name="date_of_birth" type="date" className="staff-form-input" />
                                {touched.date_of_birth && errors.date_of_birth && (
                                  <p className="staff-form-error">{String(errors.date_of_birth)}</p>
                                )}
                              </div>

                              <div>
                                <label>Age</label>
                                <input
                                  className="staff-form-input is-readonly"
                                  value={calcAge(values.date_of_birth) || '—'}
                                  readOnly
                                />
                              </div>
                              <div>
                                <label>Gender <span className="req">*</span></label>
                                <Field as="select" name="gender" className="staff-form-input">
                                  <option value="">Select</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </Field>
                                {touched.gender && errors.gender && (
                                  <p className="staff-form-error">{String(errors.gender)}</p>
                                )}
                              </div>

                              <div>
                                <label>Blood group</label>
                                <Field as="select" name="blood_group" className="staff-form-input">
                                  <option value="">Select</option>
                                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </Field>
                              </div>
                              <div>
                                <label>Marital status <span className="req">*</span></label>
                                <Field as="select" name="marital_status" className="staff-form-input">
                                  <option value="">Select</option>
                                  <option value="Single">Single</option>
                                  <option value="Married">Married</option>
                                  <option value="Divorced">Divorced</option>
                                  <option value="Widowed">Widowed</option>
                                </Field>
                                {touched.marital_status && errors.marital_status && (
                                  <p className="staff-form-error">{String(errors.marital_status)}</p>
                                )}
                              </div>

                              <div>
                                <label>Father name <span className="req">*</span></label>
                                <Field name="father_name" className="staff-form-input" placeholder="Father" />
                                {touched.father_name && errors.father_name && (
                                  <p className="staff-form-error">{String(errors.father_name)}</p>
                                )}
                              </div>
                              <div>
                                <label>Mother name</label>
                                <Field name="mother_name" className="staff-form-input" placeholder="Mother" />
                              </div>
                            </div>
                          </div>

                          <div className="staff-form-card">
                            <div className="staff-form-section-title">Contact & identity docs</div>
                            <div className="staff-form-grid">
                              <div>
                                <label>Email <span className="req">*</span></label>
                                <Field name="email" type="email" className="staff-form-input" />
                                {touched.email && errors.email && (
                                  <p className="staff-form-error">{String(errors.email)}</p>
                                )}
                              </div>
                              <div>
                                <label>Phone <span className="req">*</span></label>
                                <Field
                                  name="phone"
                                  className="staff-form-input"
                                  inputMode="numeric"
                                  maxLength={10}
                                  placeholder="10-digit mobile"
                                />
                                {touched.phone && errors.phone && (
                                  <p className="staff-form-error">{String(errors.phone)}</p>
                                )}
                              </div>
                              <div>
                                <label>Aadhaar</label>
                                <Field
                                  name="aadhaar"
                                  className="staff-form-input"
                                  inputMode="numeric"
                                  maxLength={12}
                                  placeholder="12-digit Aadhaar"
                                />
                                {touched.aadhaar && errors.aadhaar && (
                                  <p className="staff-form-error">{String(errors.aadhaar)}</p>
                                )}
                              </div>
                              <div>
                                <label>PAN</label>
                                <Field
                                  name="pan"
                                  className="staff-form-input"
                                  maxLength={10}
                                  placeholder="ABCDE1234F"
                                />
                                {touched.pan && errors.pan && (
                                  <p className="staff-form-error">{String(errors.pan)}</p>
                                )}
                              </div>
                              <div>
                                <label>Emergency contact</label>
                                <Field name="emergency_name" className="staff-form-input" placeholder="Name" />
                              </div>
                              <div>
                                <label>Emergency phone</label>
                                <Field
                                  name="emergency_phone"
                                  className="staff-form-input"
                                  inputMode="numeric"
                                  maxLength={10}
                                  placeholder="10-digit mobile"
                                />
                                {touched.emergency_phone && errors.emergency_phone && (
                                  <p className="staff-form-error">{String(errors.emergency_phone)}</p>
                                )}
                              </div>
                              <label className="staff-form-check span-2">
                                <input
                                  type="checkbox"
                                  checked={!!values.is_active}
                                  onChange={(e) => setFieldValue('is_active', e.target.checked)}
                                />
                                Active staff member
                              </label>
                            </div>
                          </div>
                        </>
                      )}

                      {tab === 'address' && (
                        <div className="staff-form-card">
                          <div className="staff-form-section-title">Address</div>
                          <div className="staff-form-grid">
                            <div className="span-2">
                              <label>Address line</label>
                              <Field as="textarea" name="address" rows={2} className="staff-form-input" placeholder="Door / street" />
                            </div>
                            <div>
                              <label>Landmark</label>
                              <Field name="landmark" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Pincode</label>
                              <PincodeInput
                                className="staff-form-input"
                                value={values.pincode}
                                setFieldValue={setFieldValue}
                              />
                              {touched.pincode && errors.pincode && (
                                <p className="staff-form-error">{String(errors.pincode)}</p>
                              )}
                            </div>
                            <div>
                              <label>Country</label>
                              <Field
                                name="country"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from pincode"
                              />
                            </div>
                            <div>
                              <label>City</label>
                              <Field
                                name="city"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from pincode"
                              />
                            </div>
                            <div>
                              <label>State</label>
                              <Field
                                name="state"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from pincode"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'education' && (
                        <FieldArray name="education">
                          {({ push, remove }) => (
                            <div className="staff-form-stack">
                              {values.education.map((_: any, index: number) => (
                                <div key={index} className="staff-form-card">
                                  <div className="staff-form-section-title">
                                    Education #{index + 1}
                                    {values.education.length > 1 && (
                                      <button type="button" className="staff-form-remove" onClick={() => remove(index)}>
                                        <Trash2 size={14} /> Remove
                                      </button>
                                    )}
                                  </div>
                                  <div className="staff-form-grid">
                                    <Field name={`education.${index}.degree`} className="staff-form-input" placeholder="Degree" />
                                    <Field name={`education.${index}.institution`} className="staff-form-input" placeholder="Institution" />
                                    <Field name={`education.${index}.year_from`} className="staff-form-input" placeholder="From year" />
                                    <Field name={`education.${index}.year_to`} className="staff-form-input" placeholder="To year" />
                                    <Field name={`education.${index}.grade`} className="staff-form-input" placeholder="Grade / %" />
                                  </div>
                                </div>
                              ))}
                              <button type="button" className="staff-form-add-row" onClick={() => push({ ...emptyEdu })}>
                                <Plus size={15} /> Add education
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      )}

                      {tab === 'experience' && (
                        <FieldArray name="experience">
                          {({ push, remove }) => (
                            <div className="staff-form-stack">
                              {values.experience.map((_: any, index: number) => (
                                <div key={index} className="staff-form-card">
                                  <div className="staff-form-section-title">
                                    Experience #{index + 1}
                                    {values.experience.length > 1 && (
                                      <button type="button" className="staff-form-remove" onClick={() => remove(index)}>
                                        <Trash2 size={14} /> Remove
                                      </button>
                                    )}
                                  </div>
                                  <div className="staff-form-grid">
                                    <Field name={`experience.${index}.company`} className="staff-form-input" placeholder="Company" />
                                    <Field name={`experience.${index}.designation`} className="staff-form-input" placeholder="Designation" />
                                    <Field name={`experience.${index}.year_from`} className="staff-form-input" placeholder="From year" />
                                    <Field name={`experience.${index}.year_to`} className="staff-form-input" placeholder="To year" />
                                    <Field
                                      as="textarea"
                                      name={`experience.${index}.description`}
                                      className="staff-form-input span-2"
                                      rows={2}
                                      placeholder="Description"
                                    />
                                  </div>
                                </div>
                              ))}
                              <button type="button" className="staff-form-add-row" onClick={() => push({ ...emptyExp })}>
                                <Plus size={15} /> Add experience
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      )}

                      {tab === 'bank' && (
                        <div className="staff-form-card">
                          <div className="staff-form-section-title">Bank details</div>
                          <div className="staff-form-grid">
                            <div>
                              <label>IFSC</label>
                              <IfscInput
                                name="ifsc_code"
                                className="staff-form-input"
                                value={values.ifsc_code}
                                setFieldValue={setFieldValue}
                              />
                              {touched.ifsc_code && errors.ifsc_code && (
                                <p className="staff-form-error">{String(errors.ifsc_code)}</p>
                              )}
                            </div>
                            <div>
                              <label>Bank name</label>
                              <Field
                                name="bank_name"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from IFSC"
                              />
                            </div>
                            <div>
                              <label>Branch name</label>
                              <Field
                                name="bank_branch"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from IFSC"
                              />
                            </div>
                            <div>
                              <label>Account holder</label>
                              <Field name="account_holder" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Account number</label>
                              <Field
                                name="account_number"
                                className="staff-form-input"
                                inputMode="numeric"
                                maxLength={18}
                                placeholder="9–18 digits"
                              />
                              {touched.account_number && errors.account_number && (
                                <p className="staff-form-error">{String(errors.account_number)}</p>
                              )}
                            </div>
                            <div className="span-2">
                              <label>Branch address</label>
                              <Field
                                name="bank_address"
                                className="staff-form-input is-readonly"
                                readOnly
                                tabIndex={-1}
                                placeholder="Auto from IFSC"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'office' && (
                        <div className="staff-form-card">
                          <div className="staff-form-section-title">Office details</div>
                          <div className="staff-form-grid">
                            <div>
                              <label>Role</label>
                              <Field as="select" name="roleID" className="staff-form-input">
                                <option value="">Select role</option>
                                {roleOptions.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} {r.level ? `(L${r.level})` : ''}
                                  </option>
                                ))}
                              </Field>
                            </div>
                            <div>
                              <label>Branch</label>
                              <Field
                                as="select"
                                name="branchID"
                                className="staff-form-input"
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                  setFieldValue('branchID', e.target.value);
                                  setFieldValue('warehouseID', '');
                                }}
                              >
                                <option value="">Select branch</option>
                                {branchOptions.map((b) => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </Field>
                            </div>
                            <div>
                              <label>Warehouse</label>
                              <Field as="select" name="warehouseID" className="staff-form-input">
                                <option value="">Select warehouse</option>
                                {warehouseOptions
                                  .filter((w) => {
                                    if (!values.branchID) return true;
                                    const bid = String(w.branch_id || w.branchID || '');
                                    return !bid || bid === String(values.branchID);
                                  })
                                  .map((w) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                  ))}
                              </Field>
                            </div>
                            <div>
                              <label>Department</label>
                              <Field name="department" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Designation</label>
                              <Field name="designation" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Join date</label>
                              <Field name="join_date" type="date" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Employment type</label>
                              <Field as="select" name="employment_type" className="staff-form-input">
                                <option value="">Select</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Intern">Intern</option>
                              </Field>
                            </div>
                            <div>
                              <label>Work location</label>
                              <Field name="work_location" className="staff-form-input" />
                            </div>
                            <div>
                              <label>Reporting to</label>
                              <Field name="reporting_to" className="staff-form-input" />
                            </div>
                          </div>

                          <div className="staff-form-section-title" style={{ marginTop: '1.1rem' }}>
                            {isEdit || createdId ? 'Login credentials' : 'Login account'}
                          </div>
                          <div className="staff-form-grid">
                            <div className="span-2">
                              <label>
                                <Mail size={14} className="staff-lbl-icon" /> Email (login ID){' '}
                                <span className="req">*</span>
                              </label>
                              <Field
                                name="email"
                                type="email"
                                className="staff-form-input"
                                placeholder="staff@company.com"
                                autoComplete="username"
                              />
                              {touched.email && errors.email && (
                                <p className="staff-form-error">{String(errors.email)}</p>
                              )}
                              <p className="staff-form-hint" style={{ marginTop: '0.35rem' }}>
                                Same email as Basic details — must be unique for login.
                              </p>
                            </div>
                            <div>
                              <label>
                                {isEdit || createdId ? 'New password' : 'Password'}{' '}
                                {!isEdit && !createdId ? (
                                  <span className="req">*</span>
                                ) : (
                                  <span className="staff-form-hint">(optional)</span>
                                )}
                              </label>
                              <div className="staff-password-wrap">
                                <Field
                                  name="password"
                                  type={showPassword ? 'text' : 'password'}
                                  className="staff-form-input"
                                  placeholder={
                                    isEdit || createdId ? 'Leave blank to keep current' : 'Min 6 characters'
                                  }
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  className="staff-password-toggle"
                                  onClick={() => setShowPassword((v) => !v)}
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  tabIndex={-1}
                                >
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              {touched.password && errors.password && (
                                <p className="staff-form-error">{String(errors.password)}</p>
                              )}
                            </div>
                            <div>
                              <label>Confirm password</label>
                              <div className="staff-password-wrap">
                                <Field
                                  name="confirm_password"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  className="staff-form-input"
                                  placeholder="Re-enter password"
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  className="staff-password-toggle"
                                  onClick={() => setShowConfirmPassword((v) => !v)}
                                  aria-label={
                                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                                  }
                                  tabIndex={-1}
                                >
                                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              {touched.confirm_password && errors.confirm_password && (
                                <p className="staff-form-error">{String(errors.confirm_password)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'documents' && (
                        <FieldArray name="documents">
                          {({ push, remove }) => (
                            <div className="staff-form-stack">
                              <p className="staff-form-hint">
                                Upload ID proof, resume, etc. (PDF / image / office, max 10MB) or paste a URL.
                              </p>
                              {values.documents.map((doc: any, index: number) => {
                                const fileUrl = doc?.file_url || '';
                                const preview = mediaUrl(fileUrl);
                                const uploading = uploadingDocIndex === index;
                                return (
                                  <div key={index} className="staff-form-card">
                                    <div className="staff-form-section-title">
                                      Document #{index + 1}
                                      {values.documents.length > 1 && (
                                        <button
                                          type="button"
                                          className="staff-form-remove"
                                          onClick={() => remove(index)}
                                        >
                                          <Trash2 size={14} /> Remove
                                        </button>
                                      )}
                                    </div>
                                    <div className="staff-form-grid">
                                      <div>
                                        <label>Doc type</label>
                                        <Field
                                          name={`documents.${index}.doc_type`}
                                          className="staff-form-input"
                                          placeholder="Aadhaar / Resume / PAN"
                                        />
                                      </div>
                                      <div>
                                        <label>Document name</label>
                                        <Field
                                          name={`documents.${index}.doc_name`}
                                          className="staff-form-input"
                                          placeholder="Document name"
                                        />
                                      </div>
                                      <div className="span-2">
                                        <label>File</label>
                                        <div className="staff-doc-file-row">
                                          <Field
                                            name={`documents.${index}.file_url`}
                                            className="staff-form-input"
                                            placeholder="Upload or paste URL"
                                          />
                                          <label
                                            className={`staff-doc-upload-btn ${uploading ? 'is-busy' : ''}`}
                                          >
                                            <Upload size={15} />
                                            {uploading ? 'Uploading…' : 'Upload'}
                                            <input
                                              type="file"
                                              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,image/*,application/pdf"
                                              disabled={uploading}
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                e.target.value = '';
                                                if (file) {
                                                  uploadStaffDocument(file, index, setFieldValue, values);
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                      </div>
                                      {fileUrl ? (
                                        <div className="span-2 staff-doc-preview">
                                          {isImageUrl(fileUrl) ? (
                                            <a
                                              href={preview}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="staff-doc-preview-img"
                                            >
                                              <img src={preview} alt={doc.doc_name || 'Document'} />
                                            </a>
                                          ) : (
                                            <a
                                              href={preview}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="staff-doc-preview-link"
                                            >
                                              {isPdfUrl(fileUrl) ? (
                                                <FileText size={16} />
                                              ) : (
                                                <FileImage size={16} />
                                              )}
                                              <span>{doc.doc_name || 'Open document'}</span>
                                              <ExternalLink size={14} />
                                            </a>
                                          )}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                              <button
                                type="button"
                                className="staff-form-add-row"
                                onClick={() => push({ ...emptyDoc })}
                              >
                                <Plus size={15} /> Add document
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      )}

                      {tab === 'history' && (
                        <div className="staff-history-panel">
                          <div className="staff-history-summary">
                            <div>
                              <p className="staff-history-kicker">Activity log</p>
                              <h4>{history.length} event{history.length === 1 ? '' : 's'}</h4>
                            </div>
                            <span className="staff-history-chip">
                              <Clock3 size={14} /> Timeline
                            </span>
                          </div>

                          {history.length === 0 ? (
                            <div className="staff-history-empty">
                              <History size={22} />
                              <strong>No activity yet</strong>
                              <p>Save profile tabs to start building this staff history.</p>
                            </div>
                          ) : (
                            <ol className="staff-history-timeline">
                              {history.map((h, index) => {
                                const meta = historyMeta(h.action);
                                const when = formatHistoryWhen(h.created_at);
                                const Icon = meta.Icon;
                                return (
                                  <li key={h.id || `${h.action}-${index}`} className={`staff-history-item is-${meta.tone}`}>
                                    <span className="staff-history-rail" aria-hidden />
                                    <span className="staff-history-dot">
                                      <Icon size={14} />
                                    </span>
                                    <article className="staff-history-card">
                                      <header>
                                        <span className={`staff-history-badge is-${meta.tone}`}>{meta.label}</span>
                                        <time>
                                          <strong>{when.date}</strong>
                                          <span>{when.time}</span>
                                        </time>
                                      </header>
                                      <p>{h.details || h.action || 'Activity recorded'}</p>
                                      {h.action && String(h.action).toLowerCase() !== meta.label.toLowerCase() ? (
                                        <small className="staff-history-action-code">{h.action}</small>
                                      ) : null}
                                    </article>
                                  </li>
                                );
                              })}
                            </ol>
                          )}
                        </div>
                      )}
                    </div>

                    {tab !== 'history' && (
                      <div className="staff-form-footer">
                        <button
                          type="button"
                          className="staff-form-btn ghost"
                          onClick={goPrev}
                          disabled={stepIndex === 0}
                        >
                          <ChevronLeft size={16} /> Previous
                        </button>
                        <div className="staff-form-footer-right">
                          <button type="button" className="staff-form-btn outline" onClick={onClose}>
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="staff-form-btn soft"
                            disabled={isSubmitting}
                            onClick={async () => {
                              await saveStaff(values, { stayOpen: true, section: tab });
                            }}
                          >
                            <Save size={15} />
                            {isSubmitting ? 'Saving...' : `Save ${activeMeta.label}`}
                          </button>
                          {stepIndex < STEPS.length - 1 ? (
                            <button
                              type="button"
                              className="staff-form-btn primary"
                              disabled={isSubmitting}
                              onClick={async () => {
                                await saveStaff(values, {
                                  stayOpen: true,
                                  goNextAfter: true,
                                  section: tab,
                                });
                              }}
                            >
                              Save & next <ChevronRight size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="staff-form-btn primary"
                              disabled={isSubmitting}
                              onClick={async () => {
                                await saveStaff(values, { stayOpen: false, section: 'all' });
                              }}
                            >
                              <Save size={15} /> Finish
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                </Form>
              );
            }}
          </Formik>
        )}
      </aside>
    </div>,
    document.body,
  );
}
