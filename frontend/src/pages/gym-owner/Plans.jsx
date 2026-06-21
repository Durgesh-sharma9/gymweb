import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, StatusBadge, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency } from '../../utils/helpers';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', durationType: 'days', durationValue: 30, amount: '' });

  const load = () => {
    setLoading(true);
    api.get('/plans')
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load plans:', err);
        toast.error('Failed to load plans');
        setPlans([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/plans', { ...form, amount: Number(form.amount), durationValue: Number(form.durationValue) });
      toast.success('Plan created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async (id, status) => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    await api.put(`/plans/${id}/status`, { status: newStatus });
    load();
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Add Plan</button>
      </div>

      {plans.length === 0 ? (
        <EmptyState title="No plans found" description="Create your first membership plan to get started" action={<button onClick={() => setModal(true)} className="btn-primary">Add Plan</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(p.amount)}</p>
              <p className="text-sm text-gray-500">{p.durationValue} {p.durationType}</p>
              <button onClick={() => toggleStatus(p._id, p.status)} className="text-sm text-primary-600 mt-3 hover:underline">
                {p.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Plan Name</label><input className="input" placeholder="Monthly - 30 Days" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Duration Type</label>
              <select className="input" value={form.durationType} onChange={(e) => setForm({ ...form, durationType: e.target.value })}>
                <option value="days">Days</option><option value="months">Months</option><option value="years">Years</option>
              </select>
            </div>
            <div><label className="label">Duration Value</label><input type="number" className="input" value={form.durationValue} onChange={(e) => setForm({ ...form, durationValue: e.target.value })} required /></div>
          </div>
          <div><label className="label">Amount (₹)</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
