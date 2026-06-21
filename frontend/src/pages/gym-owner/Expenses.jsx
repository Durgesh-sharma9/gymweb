import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

const CATEGORIES = ['rent', 'electricity', 'water', 'equipment', 'trainer_salary', 'other'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: 'rent', title: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], notes: '' });

  const load = () => {
    setLoading(true);
    api.get('/expenses')
      .then((res) => setExpenses(Array.isArray(res.data?.expenses) ? res.data.expenses : []))
      .catch((err) => {
        console.error('Failed to load expenses:', err);
        toast.error('Failed to load expenses');
        setExpenses([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      toast.success('Expense added');
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
        <h1 className="text-2xl font-bold">Expenses</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Add Expense</button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses found" description="Track your gym expenses by adding your first expense" action={<button onClick={() => setModal(true)} className="btn-primary">Add Expense</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(e.expenseDate)}</td>
                  <td className="p-3">{e.title}</td>
                  <td className="p-3 capitalize">{e.category.replace('_', ' ')}</td>
                  <td className="p-3">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="label">Amount</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} required /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
