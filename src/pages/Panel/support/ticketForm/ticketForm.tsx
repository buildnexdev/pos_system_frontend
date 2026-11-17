import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { supportServices } from '../../../../redux/support/support.services';
import '../_shared/SupportPages.scss';

export default function SupportTicketFormPage() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<{ priorities: string[]; modules: Array<{ key: string; label: string }> }>({
    priorities: ['low', 'medium', 'high', 'critical'],
    modules: [],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: '',
    related_module: '',
    priority: 'medium',
    description: '',
  });
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    Promise.all([
      supportServices.http.get('/panel/support/meta'),
      supportServices.http.get('/panel/support/categories'),
    ]).then(([m, c]) => {
      setMeta({
        priorities: m.data.priorities || [],
        modules: m.data.modules || [],
      });
      const cats = c.data.categories || [];
      setCategories(cats);
      if (cats[0]) setForm((f) => ({ ...f, category: cats[0].name }));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files) Array.from(files).forEach((f) => fd.append('attachments', f));
      const { data } = await supportServices.http.post('/panel/support/tickets', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Ticket ${data.ticket?.ticket_no || ''} created`);
      navigate(`/panel/support/tickets/${data.ticket.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create ticket');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sup-page">
      <section className="sup-hero">
        <div>
          <p className="sup-kicker">Support</p>
          <h1>Create Support Ticket</h1>
          <p>Describe the issue clearly and attach screenshots so our team can help faster.</p>
        </div>
        <Link to="/panel/support" className="sup-btn">
          <ArrowLeft size={16} /> Back to Help
        </Link>
      </section>

      <form className="sup-panel" onSubmit={submit}>
        <div className="sup-panel-head">
          <h2>Ticket details</h2>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Ticket ID is auto-generated on submit</span>
        </div>
        <div className="sup-form-grid">
          <label className="sup-label full">
            Subject
            <input
              className="sup-input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Short summary of the issue"
              required
            />
          </label>
          <label className="sup-label">
            Category
            <select
              className="sup-select"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="sup-label">
            Related module
            <select
              className="sup-select"
              value={form.related_module}
              onChange={(e) => setForm({ ...form, related_module: e.target.value })}
            >
              <option value="">Select module</option>
              {meta.modules.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="sup-label">
            Priority
            <select
              className="sup-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {meta.priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="sup-label full">
            Description
            <textarea
              className="sup-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened? Steps to reproduce, expected vs actual result…"
              required
            />
          </label>
          <label className="sup-label full">
            Attachments (Image / PDF)
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </label>
        </div>
        <div className="sup-reply-actions" style={{ padding: '0 1rem 1rem' }}>
          <button type="submit" className="sup-btn primary" disabled={saving}>
            <Send size={16} /> {saving ? 'Submitting…' : 'Submit Ticket'}
          </button>
          {files?.length ? (
            <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <Paperclip size={14} /> {files.length} file(s) selected
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
