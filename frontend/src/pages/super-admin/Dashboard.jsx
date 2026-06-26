import { useEffect, useState } from 'react';
import { Building2, Users, Dumbbell, TrendingUp, Clock, AlertTriangle, Calendar } from 'lucide-react';
import api from '../../api/axios';
import { StatCard, LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/super-admin/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Platform Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Gyms" value={data.totalGyms} icon={Building2} color="blue" />
        <StatCard title="Active Gyms" value={data.activeGyms} icon={Dumbbell} color="green" />
        <StatCard title="Trial Gyms" value={data.trialGyms} icon={Clock} color="yellow" />
        <StatCard title="Expired Subscriptions" value={data.expiredSubscriptions} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Members" value={data.totalMembers} icon={Users} color="purple" />
        <StatCard title="Total Trainers" value={data.totalTrainers} icon={Users} color="blue" />
        <StatCard title="Monthly SaaS Revenue" value={formatCurrency(data.monthlySaaSRevenue)} icon={TrendingUp} color="green" />
        <StatCard title="Total SaaS Revenue" value={formatCurrency(data.totalSaaSRevenue)} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 size={18} /> Recent Gym Registrations</h3>
          {data.recentGyms?.length > 0 ? (
            <div className="space-y-3">
              {data.recentGyms.map((gym) => (
                <div key={gym._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{gym.name}</p>
                    <p className="text-sm text-gray-500">{gym.ownerId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{gym.platformPlanId?.name || 'No Plan'}</p>
                    <p className="text-xs text-gray-500">{formatDate(gym.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent registrations</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-500" /> Expiring Subscriptions</h3>
          {data.expiringSubscriptions?.length > 0 ? (
            <div className="space-y-3">
              {data.expiringSubscriptions.map((gym) => (
                <div key={gym._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{gym.name}</p>
                    <p className="text-sm text-gray-500">{gym.platformPlanId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">{formatDate(gym.subscriptionEnd)}</p>
                    <p className="text-xs text-gray-500">{Math.ceil((new Date(gym.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))} days left</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No expiring subscriptions</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
