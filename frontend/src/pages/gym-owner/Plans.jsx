import { useEffect, useState } from 'react';
import { Plus, Clock, DollarSign, Check, X, Zap, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Modal, Input, Select, EmptyState } from '../../components/ui';
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

  const getDurationText = (type, value) => {
    const typeLabels = { days: 'Days', months: 'Months', years: 'Years' };
    return `${value} ${typeLabels[type]}`;
  };

  if (loading) return <DashboardLayout title="Membership Plans" description="Create and manage membership plans"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Membership Plans" description="Create and manage membership plans for your gym">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setModal(true)} icon={Plus}>Add Plan</Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          title="No plans found"
          description="Create your first membership plan to get started"
          action={<Button onClick={() => setModal(true)} icon={Plus}>Add Plan</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card
              key={p._id}
              className={`relative overflow-hidden hover:shadow-lg transition-shadow ${p.status === 'active' ? 'border-[#2563EB]' : 'border-gray-200'}`}
            >
              {p.status === 'active' && (
                <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-xs px-3 py-1 rounded-bl-lg">
                  Active
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${p.status === 'active' ? 'bg-[#2563EB]' : 'bg-gray-100'}`}>
                  {p.status === 'active' ? (
                    <Zap size={32} className="text-white" />
                  ) : (
                    <Clock size={32} className="text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                  <span className="text-gray-500">/{p.durationType}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{getDurationText(p.durationType, p.durationValue)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <DollarSign size={16} className="text-gray-400" />
                  <span>One-time payment</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={p.status === 'active' ? 'secondary' : 'primary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleStatus(p._id, p.status)}
                >
                  {p.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Create Plan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="Monthly - 30 Days"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Duration Type"
              value={form.durationType}
              onChange={(e) => setForm({ ...form, durationType: e.target.value })}
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </Select>
            <Input
              label="Duration Value"
              type="number"
              value={form.durationValue}
              onChange={(e) => setForm({ ...form, durationValue: e.target.value })}
              required
            />
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
