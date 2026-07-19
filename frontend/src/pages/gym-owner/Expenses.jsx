import { useEffect, useState } from 'react';
import { Plus, TrendingDown, Calendar, DollarSign, Building2, Zap, Droplet, Dumbbell, Users, MoreHorizontal, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Modal, Input, Select, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

const CATEGORIES = [
  { key: 'rent', label: 'Rent', icon: Building2 },
  { key: 'electricity', label: 'Electricity', icon: Zap },
  { key: 'water', label: 'Water', icon: Droplet },
  { key: 'equipment', label: 'Equipment', icon: Dumbbell },
  { key: 'trainer_salary', label: 'Trainer Salary', icon: Users },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
];

const CATEGORY_COLORS = {
  rent: 'bg-blue-100 text-blue-700',
  electricity: 'bg-yellow-100 text-yellow-700',
  water: 'bg-cyan-100 text-cyan-700',
  equipment: 'bg-purple-100 text-purple-700',
  trainer_salary: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: 'rent', title: '', amount: '', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
  const [categoryFilter, setCategoryFilter] = useState('');

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

  const filteredExpenses = expenses.filter(e => !categoryFilter || e.category === categoryFilter);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.expenseDate);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) return <DashboardLayout title="Expenses" description="Track and manage gym expenses"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Expenses" description="Track and manage gym expenses">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card title="Total Expenses" icon={TrendingDown} padding="sm">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </Card>
        <Card title="This Month" icon={Calendar} padding="sm">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthExpenses)}</p>
          <p className="text-sm text-gray-500 mt-1">Current month</p>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {CATEGORIES.map((cat) => {
          const categoryTotal = expenses.filter(e => e.category === cat.key).reduce((sum, e) => sum + (e.amount || 0), 0);
          return (
            <Card
              key={cat.key}
              padding="sm"
              className={`cursor-pointer hover:shadow-md transition-shadow ${categoryFilter === cat.key ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : ''}`}
              onClick={() => setCategoryFilter(categoryFilter === cat.key ? '' : cat.key)}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${CATEGORY_COLORS[cat.key]}`}>
                  <cat.icon size={20} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{cat.label}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(categoryTotal)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setModal(true)} icon={Plus}>Add Expense</Button>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="Track your gym expenses by adding your first expense"
          action={<Button onClick={() => setModal(true)} icon={Plus}>Add Expense</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e) => {
                  const category = CATEGORIES.find(c => c.key === e.category);
                  return (
                    <tr key={e._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">{formatDate(e.expenseDate)}</td>
                      <td className="p-4 font-medium text-gray-900">{e.title}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[e.category]}`}>
                          {category && <category.icon size={14} />}
                          {e.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(e.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </Select>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Input
            label="Date"
            type="date"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
