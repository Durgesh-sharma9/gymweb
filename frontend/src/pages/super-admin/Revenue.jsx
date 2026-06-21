import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/super-admin/revenue').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Platform Revenue</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.monthlyRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="text-2xl font-bold text-green-600">{data.activeSubscriptions}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Expired Subscriptions</p>
          <p className="text-2xl font-bold text-red-600">{data.expiredSubscriptions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Plan-wise Revenue</h3>
          {data.planWiseRevenue?.length > 0 ? (
            <div className="space-y-3">
              {data.planWiseRevenue.map((item) => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-medium">{item._id || 'No Plan'}</span>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.revenue || 0)}</p>
                    <p className="text-xs text-gray-500">{item.count} gyms</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No revenue data</p>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign size={18} /> Recent Payments</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Gym</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Method</th>
            </tr>
          </thead>
          <tbody>
            {data.recentPayments?.length > 0 ? (
              data.recentPayments.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.gymId?.name || '-'}</td>
                  <td className="p-3 font-semibold">{formatCurrency(p.paidAmount)}</td>
                  <td className="p-3">{formatDate(p.paymentDate)}</td>
                  <td className="p-3 capitalize">{p.paymentMethod}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
