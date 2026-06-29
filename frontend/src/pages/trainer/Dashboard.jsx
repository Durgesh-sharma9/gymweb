import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { StatCard, LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, UserCheck, Clock, Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function TrainerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    api.get('/gym/trainer/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Dashboard error:', err);
        toast.error('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!data) return <DashboardLayout><div className="p-8 text-center text-gray-500">Failed to load dashboard data</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Trainer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Members" value={data.assignedCount} icon={Users} color="blue" />
        <StatCard title="Active Members" value={data.activeCount} icon={UserCheck} color="green" />
        <StatCard title="Expired Members" value={data.expiredCount} icon={Clock} color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard title="Expiring This Week" value={data.expiringThisWeek} icon={Clock} color="orange" />
        {hasPermission('collectFees') && (
          <StatCard title="Today's Collections" value={formatCurrency(data.todayCollections.total)} icon={Wallet} color="green" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Users size={18} className="text-primary-600" /> Recent Members</h3>
          {data.recentMembers?.length > 0 ? (
            <div className="space-y-2">
              {data.recentMembers.map((m) => (
                <Link key={m._id} to={`/gym/members/${m._id}`} className="block p-2 hover:bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{m.fullName}</span>
                    <span className="text-xs text-gray-500">{formatDate(m.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500">{m.currentMembershipId?.planName || 'No Plan'}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No members yet</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /> Recent Renewals</h3>
          {data.recentRenewals?.length > 0 ? (
            <div className="space-y-2">
              {data.recentRenewals?.map((r) => (
                <div key={r._id} className="p-2 hover:bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{r.memberId?.fullName}</span>
                    <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500">{formatCurrency(r.finalAmount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No renewals yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
