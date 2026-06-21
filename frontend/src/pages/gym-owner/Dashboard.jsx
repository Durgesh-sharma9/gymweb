import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Clock, Wallet, TrendingUp, Receipt, AlertTriangle, X, Info } from 'lucide-react';
import api from '../../api/axios';
import { StatCard, LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const { user, gym } = useAuth();

  useEffect(() => {
    api.get('/gym/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {gym?.isTrial && gym?.trialDaysRemaining !== undefined && showTrialBanner && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info size={24} />
            <div>
              <p className="font-semibold">Free Trial Active</p>
              <p className="text-sm text-primary-100">{gym.trialDaysRemaining} days remaining in your free trial</p>
            </div>
          </div>
          <button onClick={() => setShowTrialBanner(false)} className="text-white hover:text-primary-200">
            <X size={20} />
          </button>
        </div>
      )}

      {!user?.emailVerified && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-yellow-600" />
            <div>
              <p className="font-semibold">Please verify your email</p>
              <p className="text-sm text-yellow-700">Check your inbox for the verification link</p>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Members" value={data.totalMembers} icon={Users} color="blue" />
        <StatCard title="Active" value={data.activeMembers} icon={UserCheck} color="green" />
        <StatCard title="Expired" value={data.expiredMembers} icon={Clock} color="yellow" />
        <StatCard title="Inactive" value={data.inactiveMembers} icon={UserX} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Monthly Revenue" value={formatCurrency(data.monthlyRevenue)} icon={TrendingUp} color="green" />
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={Wallet} color="blue" />
        <StatCard title="Monthly Expenses" value={formatCurrency(data.monthlyExpenses)} icon={Receipt} color="red" />
        <StatCard title="Monthly Profit" value={formatCurrency(data.monthlyProfit)} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-500" /> Due Payments</h3>
          <p className="text-2xl font-bold">{formatCurrency(data.totalDueAmount)}</p>
          <p className="text-sm text-gray-500">{data.membersWithDuesCount} members with dues</p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Pending Registrations</h3>
          <p className="text-2xl font-bold">{data.pendingRegistrations}</p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
        </div>

        {data.upcomingRenewals?.length > 0 && (
          <div className="card p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3">Upcoming Renewals (7 days)</h3>
            <div className="space-y-2">
              {data.upcomingRenewals.map((m) => (
                <div key={m._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span>{m.memberId?.fullName}</span>
                  <span className="text-sm text-gray-500">{formatDate(m.endDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.expiryReminders?.length > 0 && (
          <div className="card p-5 lg:col-span-2 border-yellow-200 bg-yellow-50">
            <h3 className="font-semibold mb-3 text-yellow-800">Expiry Reminders (7+ days expired)</h3>
            <p className="text-sm text-yellow-700 mb-3">Do you want to mark these members inactive?</p>
            <div className="space-y-2">
              {data.expiryReminders.map((m) => (
                <div key={m._id} className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
                  <div>
                    <span className="font-medium">{m.fullName}</span>
                    <span className="text-sm text-gray-500 ml-2">{m.mobile}</span>
                  </div>
                  <StatusBadge status="expired" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
