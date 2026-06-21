import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, StatusBadge, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PERMISSIONS = [
  { key: 'addMember', label: 'Add Member' },
  { key: 'renewMembership', label: 'Renew Membership' },
  { key: 'viewAssignedMembers', label: 'View Assigned Members' },
  { key: 'collectFees', label: 'Collect Fees' },
];

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', permissions: {} });

  const load = () => {
    setLoading(true);
    api.get('/trainers')
      .then((res) => setTrainers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load trainers:', err);
        toast.error('Failed to load trainers');
        setTrainers([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trainers', form);
      toast.success('Trainer created. Credentials sent via email.');
      setModal(false);
      setForm({ name: '', email: '', mobile: '', permissions: {} });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/trainers/${editModal._id}`, editModal);
      toast.success('Trainer updated');
      setEditModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trainers</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Add Trainer</button>
      </div>

      {trainers.length === 0 ? (
        <EmptyState title="No trainers found" description="Add your first trainer to get started" action={<button onClick={() => setModal(true)} className="btn-primary">Add Trainer</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Members</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3">{t.email}</td>
                  <td className="p-3">{t.memberCount}</td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                  <td className="p-3">
                    <button onClick={() => setEditModal({ ...t })} className="text-primary-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Trainer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Mobile</label><input className="input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
          <div><label className="label">Permissions</label>
            <div className="space-y-2 mt-1">
              {PERMISSIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.permissions[key] || false} onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, [key]: e.target.checked } })} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Trainer">
        {editModal && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div><label className="label">Name</label><input className="input" value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} /></div>
            <div><label className="label">Status</label>
              <select className="input" value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div><label className="label">Permissions</label>
              <div className="space-y-2 mt-1">
                {PERMISSIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editModal.permissions?.[key] || false} onChange={(e) => setEditModal({ ...editModal, permissions: { ...editModal.permissions, [key]: e.target.checked } })} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditModal(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
