import { useEffect, useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingSpinner, StatCard } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      </div>
    </DashboardLayout>
  );
}
