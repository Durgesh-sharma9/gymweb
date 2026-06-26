import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency } from '../../utils/helpers';

export default function PlatformPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', durationMonths: 1, maxMembers: '', maxTrainers: '' });

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/super-admin/plans')
      .then((res) => {
        setPlans(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
        setError(err.message);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/plans', {
        ...form,
        price: Number(form.price),
        durationMonths: Number(form.durationMonths),
        maxMembers: form.maxMembers ? Number(form.maxMembers) : null,
        maxTrainers: form.maxTrainers ? Number(form.maxTrainers) : null,
      });
      toast.success('Plan created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  if (error) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">SaaS Plans</h1>
        <div className="card p-6 text-center">
          <p className="text-red-500">Error loading plans: {error}</p>
          <button onClick={load} className="btn-primary mt-4">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">SaaS Plans</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Add Plan</button>
      </div>

      {plans.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No plans found. Create your first plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p._id} className="card p-6">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(p.price)}<span className="text-sm text-gray-500">/mo</span></p>
              <ul className="mt-4 space-y-1 text-sm text-gray-600">
                <li>Max Members: {p.maxMembers ?? 'Unlimited'}</li>
                <li>Max Trainers: {p.maxTrainers ?? 'Unlimited'}</li>
              </ul>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create SaaS Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Plan Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Price (₹/month)</label><input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Max Members</label><input type="number" className="input" placeholder="Unlimited" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} /></div>
            <div><label className="label">Max Trainers</label><input type="number" className="input" placeholder="Unlimited" value={form.maxTrainers} onChange={(e) => setForm({ ...form, maxTrainers: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
