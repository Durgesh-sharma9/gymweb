import { useEffect, useState } from 'react';
import { Plus, AlertCircle, Users, Mail, Phone, Edit, CheckSquare, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Modal, Input, Select, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

const PERMISSIONS = [
  { key: 'addMember', label: 'Add Member', icon: Users },
  { key: 'renewMembership', label: 'Renew Membership', icon: CheckSquare },
  { key: 'viewAssignedMembers', label: 'View Assigned Members', icon: Users },
  { key: 'collectFees', label: 'Collect Fees', icon: Shield },
];

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', permissions: {} });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/trainers'),
      api.get('/gym/limits'),
    ])
      .then(([t, l]) => {
        setTrainers(Array.isArray(t.data) ? t.data : []);
        setLimits(l.data);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        toast.error('Failed to load data');
        setTrainers([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (limits?.trainerLimitReached) {
      toast.error(`Trainer limit reached (${limits.currentTrainers}/${limits.maxTrainers}). Upgrade your plan to add more trainers.`);
      return;
    }
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

  if (loading) return <DashboardLayout title="Trainers" description="Manage gym trainers and their permissions"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Trainers" description="Manage gym trainers and their permissions">
      {/* Limit Warning */}
      {limits?.trainerLimitReached && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Trainer limit reached</p>
              <p className="text-sm text-yellow-700">
                You have reached your plan limit of {limits.maxTrainers} trainers.{' '}
                <Link to="/gym/subscription-request" className="underline font-medium">Upgrade your plan</Link> to add more trainers.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{trainers.length} trainer{trainers.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => setModal(true)}
          icon={Plus}
          disabled={limits?.trainerLimitReached}
        >
          Add Trainer
        </Button>
      </div>

      {/* Trainers Grid */}
      {trainers.length === 0 ? (
        <EmptyState
          title="No trainers found"
          description="Add your first trainer to get started"
          action={<Button onClick={() => setModal(true)} icon={Plus}>Add Trainer</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((t) => (
            <Card key={t._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">{t.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
                    <Badge variant={t.status === 'active' ? 'success' : 'default'}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{t.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{t.memberCount || 0} member{t.memberCount !== 1 ? 's' : ''}</span>
                </div>
                {t.mobile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{t.mobile}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {PERMISSIONS.filter(p => t.permissions?.[p.key]).map(p => (
                    <Badge key={p.key} variant="primary" size="sm">{p.label}</Badge>
                  ))}
                  {Object.keys(t.permissions || {}).length === 0 && (
                    <span className="text-xs text-gray-400">No permissions</span>
                  )}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setEditModal({ ...t })}
                icon={Edit}
              >
                Edit Trainer
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Trainer">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          <Card title="Permissions" icon={Shield} padding="sm">
            <div className="space-y-3">
              {PERMISSIONS.map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.permissions[key] || false}
                    onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, [key]: e.target.checked } })}
                    className="w-4 h-4 text-[#2563EB] rounded"
                  />
                  <Icon size={18} className="text-gray-500" />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </Card>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create Trainer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Trainer Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Trainer">
        {editModal && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Name"
              value={editModal.name}
              onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
            />
            <Select
              label="Status"
              value={editModal.status}
              onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Card title="Permissions" icon={Shield} padding="sm">
              <div className="space-y-3">
                {PERMISSIONS.map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={editModal.permissions?.[key] || false}
                      onChange={(e) => setEditModal({ ...editModal, permissions: { ...editModal.permissions, [key]: e.target.checked } })}
                      className="w-4 h-4 text-[#2563EB] rounded"
                    />
                    <Icon size={18} className="text-gray-500" />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </Card>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
