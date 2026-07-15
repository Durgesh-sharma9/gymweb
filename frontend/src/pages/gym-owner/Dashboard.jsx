import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Clock, Wallet, TrendingUp, Receipt, AlertTriangle, X, Info, CalendarCheck, Activity } from 'lucide-react';
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

  if (loading) return <DashboardLayout title="Dashboard"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard">
      {gym?.isTrial && gym?.trialDaysRemaining !== undefined && showTrialBanner && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info size={24} />
            <div>
              <p className="font-semibold">Free Trial Active</p>
              <p className="text-sm text-primary-100">{gym.trialDaysRemaining} days remaining in your free trial</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowTrialBanner(false)} className="text-white hover:text-primary-200">
            <X size={20} />
          </button>
        </div>
      )}

      {!user?.emailVerified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">Please verify your email</p>
            <p className="text-sm">Check your inbox for the verification link</p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Members" value={data.totalMembers} icon={Users} color="blue" />
        <StatCard title="Active" value={data.activeMembers} icon={UserCheck} color="green" />
        <StatCard title="Expired" value={data.expiredMembers} icon={Clock} color="yellow" />
        <StatCard title="Inactive" value={data.inactiveMembers} icon={UserX} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Revenue" value={formatCurrency(data.todayRevenue)} icon={Wallet} color="green" />
        <StatCard title="Monthly Revenue" value={formatCurrency(data.monthlyRevenue)} icon={TrendingUp} color="blue" />
        <StatCard title="Today's Attendance" value={data.todayAttendance || 0} icon={CalendarCheck} color="purple" />
        <StatCard title="Monthly Attendance" value={data.monthlyAttendance || 0} icon={CalendarCheck} color="blue" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={Wallet} color="blue" />
        <StatCard title="Monthly Expenses" value={formatCurrency(data.monthlyExpenses)} icon={Receipt} color="red" />
        <StatCard title="Monthly Profit" value={formatCurrency(data.monthlyProfit)} icon={TrendingUp} color="purple" />
        <StatCard title="Staff" value={data.totalTrainers} icon={Users} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Expiring Today" value={data.expiringToday || 0} icon={AlertTriangle} color="red" />
        <StatCard title="Expiring This Week" value={data.expiringThisWeek || 0} icon={Clock} color="yellow" />
        <StatCard title="Pending Registrations" value={data.pendingRegistrations} icon={Users} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle size={18} className="text-yellow-500" /> Due Payments
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalDueAmount)}</p>
          <p className="text-sm text-gray-500">{data.membersWithDuesCount} members with dues</p>
        </div>

        {data.recentActivities?.length > 0 && (
          <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity size={18} /> Recent Activities
            </h3>
            <div className="space-y-2">
              {data.recentActivities.map((a) => (
                <div key={a._id} className="flex justify-between items-start py-2 border-b dark:border-gray-800 last:border-0 text-sm">
                  <div>
                    <p className="text-gray-900 dark:text-white">{a.description}</p>
                    <p className="text-xs text-gray-500">{a.performedBy?.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatDate(a.performedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.upcomingRenewals?.length > 0 && (
          <div className="card p-5 lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Upcoming Renewals (7 days)</h3>
            <div className="space-y-2">
              {data.upcomingRenewals.map((m) => (
                <div key={m._id} className="flex justify-between items-center py-2 border-b dark:border-gray-800 last:border-0">
                  <span className="text-gray-900 dark:text-white">{m.memberId?.fullName}</span>
                  <span className="text-sm text-gray-500">{formatDate(m.endDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.expiryReminders?.length > 0 && (
          <div className="card p-5 lg:col-span-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-300">Expiry Reminders</h3>
            <div className="space-y-2">
              {data.expiryReminders.map((m) => (
                <div key={m._id} className="flex justify-between items-center py-2 bg-white dark:bg-gray-900 rounded-lg px-3">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{m.fullName}</span>
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
