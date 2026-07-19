import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Search, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingSpinner, StatCard } from '../../components/ui';
=======
import { Download, Search, Filter, CreditCard, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Input, Select, EmptyState } from '../../components/ui';
>>>>>>> 2116aaf6 (ui)
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
<<<<<<< HEAD
=======
  const [methodFilter, setMethodFilter] = useState('');
>>>>>>> 2116aaf6 (ui)

  useEffect(() => {
    Promise.all([
      api.get('/payments'),
      api.get('/members/dues'),
    ])
      .then(([p, d]) => {
        setPayments(p.data.payments);
        setDues(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  const filtered = payments.filter((p) => {
    if (!search) return true;
    const name = p.memberId?.fullName?.toLowerCase() || '';
    return name.includes(search.toLowerCase());
  });

  if (loading) return <DashboardLayout title="Payments"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Payments">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Payment History</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Pending Dues"
          value={formatCurrency(dues?.totalDue || 0)}
          subtitle={`${dues?.count || 0} members with dues`}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard title="Total Payments" value={payments.length} color="blue" />
      </div>

      {dues?.memberships?.length > 0 && (
        <div className="card p-5 mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
            <AlertTriangle size={18} /> Pending Payments
          </h3>
          <div className="space-y-2">
            {dues.memberships.slice(0, 5).map((m) => (
              <div key={m._id} className="flex justify-between items-center text-sm">
                <Link to={`/gym/members/${m.memberId?._id}`} className="text-primary-600 hover:underline">
                  {m.memberId?.fullName}
                </Link>
                <span className="font-medium">{formatCurrency(m.dueAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input className="input pl-10" placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Member</th>
                <th className="text-left p-3">Paid</th>
                <th className="text-left p-3">Due</th>
                <th className="text-left p-3">Method</th>
                <th className="text-left p-3">Collected By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">{formatDate(p.paymentDate)}</td>
                  <td className="p-3">{p.memberId?.fullName}</td>
                  <td className="p-3">{formatCurrency(p.paidAmount)}</td>
                  <td className="p-3">{formatCurrency(p.dueAmount)}</td>
                  <td className="p-3 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                  <td className="p-3">{p.collectedBy?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
=======
  const filteredPayments = payments.filter(p => {
    const matchesSearch = !search || 
      p.memberId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = !methodFilter || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.dueAmount || 0), 0);

  if (loading) return <DashboardLayout title="Payments" description="Track all income and payment history"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Payments" description="Track all income and payment history">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card title="Total Collected" icon={DollarSign} padding="sm">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
          <p className="text-sm text-gray-500 mt-1">{payments.length} transactions</p>
        </Card>
        <Card title="Total Due" icon={CreditCard} padding="sm">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDue)}</p>
          <p className="text-sm text-gray-500 mt-1">Outstanding balance</p>
        </Card>
        <Card title="This Month" icon={Calendar} padding="sm">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(payments.filter(p => {
              const paymentDate = new Date(p.paymentDate);
              const now = new Date();
              return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
            }).reduce((sum, p) => sum + (p.paidAmount || 0), 0))}
          </p>
          <p className="text-sm text-gray-500 mt-1">Current month</p>
        </Card>
>>>>>>> 2116aaf6 (ui)
      </div>

      {/* Toolbar */}
      <Card padding="sm" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search member or invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
            </Select>
          </div>
          <Button variant="secondary" icon={Download}>Export</Button>
        </div>
      </Card>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No payment records match your filters"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Invoice</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Member</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Paid</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Due</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Method</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Collected By</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600">{formatDate(p.paymentDate)}</td>
                    <td className="p-4 text-gray-600">{p.invoiceNumber || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#2563EB] font-medium text-xs">
                            {p.memberId?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{p.memberId?.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-900 font-medium">{formatCurrency(p.paidAmount)}</td>
                    <td className="p-4 text-right">
                      {p.dueAmount > 0 ? (
                        <span className="text-red-600 font-medium">{formatCurrency(p.dueAmount)}</span>
                      ) : (
                        <span className="text-green-600">{formatCurrency(0)}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="primary" size="sm">
                        {p.paymentMethod?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">{p.collectedBy?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
