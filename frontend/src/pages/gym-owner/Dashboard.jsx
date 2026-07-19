import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Users, UserCheck, UserX, Clock, Wallet, TrendingUp, Receipt, AlertTriangle, X, Info, CalendarCheck, Activity } from 'lucide-react';
=======
import { Users, UserCheck, UserX, Clock, Wallet, TrendingUp, Receipt, AlertTriangle, X, Info, ArrowUpRight, Calendar, CreditCard, DollarSign } from 'lucide-react';
>>>>>>> 2116aaf6 (ui)
import api from '../../api/axios';
import { StatCard, LoadingSpinner, Badge, Button, Card } from '../../components/ui';
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

<<<<<<< HEAD
  if (loading) return <DashboardLayout title="Dashboard"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard">
      {gym?.isTrial && gym?.trialDaysRemaining !== undefined && showTrialBanner && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl mb-6 flex items-center justify-between">
=======
  if (loading) return <DashboardLayout title="Dashboard" description="Overview of your gym performance"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard" description="Track your gym's performance and member activity">
      {/* Trial Banner */}
      {gym?.isTrial && gym?.trialDaysRemaining !== undefined && showTrialBanner && (
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white p-4 rounded-2xl mb-6 flex items-center justify-between shadow-sm">
>>>>>>> 2116aaf6 (ui)
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Info size={20} />
            </div>
            <div>
              <p className="font-semibold">Free Trial Active</p>
              <p className="text-sm text-blue-100">{gym.trialDaysRemaining} days remaining in your free trial</p>
            </div>
          </div>
<<<<<<< HEAD
          <button type="button" onClick={() => setShowTrialBanner(false)} className="text-white hover:text-primary-200">
=======
          <button onClick={() => setShowTrialBanner(false)} className="text-white hover:text-blue-200 transition-colors">
>>>>>>> 2116aaf6 (ui)
            <X size={20} />
          </button>
        </div>
      )}

      {/* Email Verification Banner */}
      {!user?.emailVerified && (
<<<<<<< HEAD
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle size={24} />
          <div>
            <p className="font-semibold">Please verify your email</p>
            <p className="text-sm">Check your inbox for the verification link</p>
=======
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-2xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold">Please verify your email</p>
              <p className="text-sm text-yellow-700">Check your inbox for the verification link</p>
            </div>
>>>>>>> 2116aaf6 (ui)
          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          title="Total Members"
          description="All registered members"
          icon={Users}
          action={<Badge variant="success">+{data.newMembersThisMonth || 0} this month</Badge>}
        >
          <p className="text-3xl font-bold text-gray-900">{data.totalMembers}</p>
        </Card>

        <Card
          title="Active Members"
          description="Currently active"
          icon={UserCheck}
        >
          <p className="text-3xl font-bold text-gray-900">{data.activeMembers}</p>
          <p className="text-sm text-gray-500 mt-1">{Math.round((data.activeMembers / data.totalMembers) * 100)}% of total</p>
        </Card>

        <Card
          title="Monthly Revenue"
          description="This month's collections"
          icon={TrendingUp}
          action={<Badge variant="success">+12%</Badge>}
        >
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.monthlyRevenue)}</p>
        </Card>

        <Card
          title="Expiring Soon"
          description="Expiring this week"
          icon={Clock}
          action={<Badge variant="warning">{data.expiringThisWeek || 0} members</Badge>}
        >
          <p className="text-3xl font-bold text-gray-900">{data.expiringToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">expiring today</p>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Total Revenue" icon={Wallet} padding="sm">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</p>
        </Card>

        <Card title="Monthly Expenses" icon={Receipt} padding="sm">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.monthlyExpenses)}</p>
        </Card>

        <Card title="Monthly Profit" icon={DollarSign} padding="sm">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(data.monthlyProfit)}</p>
        </Card>

        <Card title="Inactive Members" icon={UserX} padding="sm">
          <p className="text-xl font-bold text-gray-900">{data.inactiveMembers}</p>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Due Payments */}
        <Card
          title="Due Payments"
          description="Outstanding payments"
          icon={CreditCard}
          action={<Button variant="primary" size="sm" icon={ArrowUpRight}>View All</Button>}
        >
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.totalDueAmount)}</p>
          <p className="text-sm text-gray-500 mt-1">{data.membersWithDuesCount} members with dues</p>
        </Card>

        {/* Pending Registrations */}
        <Card
          title="Pending Registrations"
          description="Awaiting approval"
          icon={Calendar}
          action={<Button variant="secondary" size="sm">Review</Button>}
        >
          <p className="text-3xl font-bold text-gray-900">{data.pendingRegistrations}</p>
          <p className="text-sm text-gray-500 mt-1">Need your attention</p>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" icon={TrendingUp} padding="sm">
          <div className="space-y-2">
            <Button variant="primary" className="w-full justify-start" icon={Users}>Add Member</Button>
            <Button variant="secondary" className="w-full justify-start" icon={CreditCard}>View Payments</Button>
            <Button variant="secondary" className="w-full justify-start" icon={Receipt}>View Reports</Button>
>>>>>>> 2116aaf6 (ui)
          </div>
        </Card>
      </div>

<<<<<<< HEAD
        {data.expiryReminders?.length > 0 && (
          <div className="card p-5 lg:col-span-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
            <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-300">Expiry Reminders</h3>
            <div className="space-y-2">
              {data.expiryReminders.map((m) => (
                <div key={m._id} className="flex justify-between items-center py-2 bg-white dark:bg-gray-900 rounded-lg px-3">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{m.fullName}</span>
                    <span className="text-sm text-gray-500 ml-2">{m.mobile}</span>
=======
      {/* Upcoming Renewals */}
      {data.upcomingRenewals?.length > 0 && (
        <Card
          title="Upcoming Renewals"
          description="Memberships expiring in next 7 days"
          icon={Clock}
          className="mb-6"
        >
          <div className="space-y-3">
            {data.upcomingRenewals.map((m) => (
              <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                    <Users size={18} className="text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{m.memberId?.fullName}</p>
                    <p className="text-sm text-gray-500">{m.memberId?.mobile}</p>
>>>>>>> 2116aaf6 (ui)
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatDate(m.endDate)}</p>
                  <Badge variant="warning" size="sm">Expiring</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expiry Reminders */}
      {data.expiryReminders?.length > 0 && (
        <Card
          title="Expired Members"
          description="Memberships expired 7+ days ago"
          icon={AlertTriangle}
          className="border-yellow-200 bg-yellow-50/50"
        >
          <p className="text-sm text-yellow-700 mb-4">Do you want to mark these members inactive?</p>
          <div className="space-y-3">
            {data.expiryReminders.map((m) => (
              <div key={m._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <UserX size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{m.fullName}</p>
                    <p className="text-sm text-gray-500">{m.mobile}</p>
                  </div>
                </div>
                <Badge variant="danger">Expired</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
