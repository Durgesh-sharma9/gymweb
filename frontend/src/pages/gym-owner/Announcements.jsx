import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate } from '../../utils/helpers';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'all' });

  const load = () => {
    setLoading(true);
    api.get('/announcements')
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load announcements:', err);
        toast.error('Failed to load announcements');
        setItems([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      toast.success('Announcement created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> New Announcement</button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No announcements found" description="Send announcements to keep your members informed" action={<button onClick={() => setModal(true)} className="btn-primary">New Announcement</button>} />
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex justify-between">
                <h3 className="font-semibold">{a.title}</h3>
                <span className="text-xs text-gray-500 capitalize">{a.targetAudience} · {formatDate(a.sentAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="label">Message</label><textarea className="input" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          <div><label className="label">Target Audience</label>
            <select className="input" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="all">All Members</option>
              <option value="active">Active Members</option>
              <option value="expired">Expired Members</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Send</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
