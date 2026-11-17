import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { staffServices } from '../../../../redux/staff/staff.services';
import { Loader } from '../../../../components/ui/Loader';

const TABS = [
  { key: 'basic', label: 'Basic Details' },
  { key: 'education', label: 'Education Details' },
  { key: 'experience', label: 'Experience Details' },
  { key: 'documents', label: 'Upload Documents' },
  { key: 'history', label: 'History' },
] as const;

const basicSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  role: Yup.string().required('Role is required'),
});

const emptyEdu = { degree: '', institution: '', year_from: '', year_to: '', grade: '' };
const emptyExp = { company: '', designation: '', year_from: '', year_to: '', description: '' };
const emptyDoc = { doc_type: '', doc_name: '', file_url: '' };

export default function StaffFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('basic');
  const [loading, setLoading] = useState(isEdit);
  const [history, setHistory] = useState<any[]>([]);
  const [initial, setInitial] = useState<any>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    is_active: true,
    address: '',
    city: '',
    state: '',
    pincode: '',
    education: [{ ...emptyEdu }],
    experience: [{ ...emptyExp }],
    documents: [{ ...emptyDoc }],
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    staffServices.http
      .get(`/panel/staff/${id}`)
      .then((res) => {
        const s = res.data.staff;
        setInitial({
          name: s.name || '',
          email: s.email || '',
          phone: s.phone || '',
          password: '',
          role: s.role || 'staff',
          is_active: !!s.is_active,
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          pincode: s.pincode || '',
          education: res.data.education?.length ? res.data.education : [{ ...emptyEdu }],
          experience: res.data.experience?.length ? res.data.experience : [{ ...emptyExp }],
          documents: res.data.documents?.length ? res.data.documents : [{ ...emptyDoc }],
        });
        setHistory(res.data.history || []);
      })
      .catch((e) => toast.error(e.response?.data?.message || 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  if (loading) return <div className="p-10"><Loader /></div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Staff' : 'Add Staff'}</h1>
          <p className="text-sm text-slate-500">Complete all tabs and save</p>
        </div>
        <Link to="/panel/staff" className="btn btn-outline">Back to Staff</Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${tab === t.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={tab === 'basic' ? basicSchema : undefined}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload = {
              ...values,
              education: (values.education || []).filter((r: any) => r.degree && r.institution),
              experience: (values.experience || []).filter((r: any) => r.company && r.designation),
              documents: (values.documents || []).filter((r: any) => r.doc_type && r.doc_name && r.file_url),
            };
            if (isEdit) {
              await staffServices.http.put(`/panel/staff/${id}`, payload);
              toast.success('Staff updated');
            } else {
              if (!values.password) {
                toast.error('Password is required');
                setSubmitting(false);
                return;
              }
              const { data } = await staffServices.http.post('/panel/staff', payload);
              toast.success('Staff created');
              navigate(`/panel/staff/${data.id}`);
              return;
            }
            navigate('/panel/staff');
          } catch (e: any) {
            toast.error(e.response?.data?.message || 'Save failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => (
          <Form className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            {tab === 'basic' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Name</label>
                  <Field name="name" className="input" />
                  {touched.name && errors.name && <p className="mt-1 text-sm text-red-600">{String(errors.name)}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Mail ID</label>
                  <Field name="email" type="email" className="input" />
                  {touched.email && errors.email && <p className="mt-1 text-sm text-red-600">{String(errors.email)}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Phone Number</label>
                  <Field name="phone" className="input" />
                  {touched.phone && errors.phone && <p className="mt-1 text-sm text-red-600">{String(errors.phone)}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm">Password {isEdit ? '(optional)' : ''}</label>
                  <Field name="password" type="password" className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Role</label>
                  <Field as="select" name="role" className="select">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </Field>
                </div>
                <div>
                  <label className="mb-1 block text-sm">City / Location</label>
                  <Field name="city" className="input" placeholder="City" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">State</label>
                  <Field name="state" className="input" />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Pincode</label>
                  <Field name="pincode" className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm">Address</label>
                  <Field as="textarea" name="address" rows={2} className="input" />
                </div>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!values.is_active}
                    onChange={(e) => setFieldValue('is_active', e.target.checked)}
                  />
                  Is Active
                </label>
              </div>
            )}

            {tab === 'education' && (
              <FieldArray name="education">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.education.map((_: any, index: number) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                        <Field name={`education.${index}.degree`} className="input" placeholder="Degree" />
                        <Field name={`education.${index}.institution`} className="input" placeholder="Institution" />
                        <Field name={`education.${index}.year_from`} className="input" placeholder="From Year" />
                        <Field name={`education.${index}.year_to`} className="input" placeholder="To Year" />
                        <Field name={`education.${index}.grade`} className="input" placeholder="Grade / %" />
                        <button type="button" className="text-sm text-red-600" onClick={() => remove(index)}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => push({ ...emptyEdu })}>Add Education</button>
                  </div>
                )}
              </FieldArray>
            )}

            {tab === 'experience' && (
              <FieldArray name="experience">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.experience.map((_: any, index: number) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                        <Field name={`experience.${index}.company`} className="input" placeholder="Company" />
                        <Field name={`experience.${index}.designation`} className="input" placeholder="Designation" />
                        <Field name={`experience.${index}.year_from`} className="input" placeholder="From Year" />
                        <Field name={`experience.${index}.year_to`} className="input" placeholder="To Year" />
                        <Field as="textarea" name={`experience.${index}.description`} className="input md:col-span-2" rows={2} placeholder="Description" />
                        <button type="button" className="text-sm text-red-600" onClick={() => remove(index)}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => push({ ...emptyExp })}>Add Experience</button>
                  </div>
                )}
              </FieldArray>
            )}

            {tab === 'documents' && (
              <FieldArray name="documents">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">Paste document URL for now (ID proof, resume, etc.).</p>
                    {values.documents.map((_: any, index: number) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                        <Field name={`documents.${index}.doc_type`} className="input" placeholder="Doc Type (Aadhaar/Resume)" />
                        <Field name={`documents.${index}.doc_name`} className="input" placeholder="Document Name" />
                        <Field name={`documents.${index}.file_url`} className="input md:col-span-2" placeholder="File URL" />
                        <button type="button" className="text-sm text-red-600" onClick={() => remove(index)}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" onClick={() => push({ ...emptyDoc })}>Add Document</button>
                  </div>
                )}
              </FieldArray>
            )}

            {tab === 'history' && (
              <div className="space-y-2">
                {!isEdit && <p className="text-sm text-slate-500">History will appear after staff is created.</p>}
                {history.length === 0 && isEdit && <p className="text-sm text-slate-500">No history yet.</p>}
                {history.map((h) => (
                  <div key={h.id} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <strong className="capitalize">{h.action}</strong>
                      <span className="text-slate-500">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{h.details || '—'}</p>
                  </div>
                ))}
              </div>
            )}

            {tab !== 'history' && (
              <div className="mt-6 flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Staff'}
                </button>
                <Link to="/panel/staff" className="btn btn-outline">Cancel</Link>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}
