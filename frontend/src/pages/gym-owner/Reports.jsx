import { useEffect, useState } from 'react';
import { Wallet, Users, CalendarCheck } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, StatCard } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TABS = [
  { id: 'revenue', label: 'Revenue', icon: Wallet },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'members', label: 'Members', icon: Users },
];

export default function Reports() {
  const [tab, setTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [range, setRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(range);
    const endpoint = tab === 'revenue' ? '/reports/revenue' : tab === 'attendance' ? '/reports/attendance' : '/reports/members';
    api.get(`${endpoint}?${params}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [tab, range]);

  const maxBar = tab === 'revenue'
    ? Math.max(...(data?.dailyRevenue?.map((d) => d.revenue) || [1]), 1)
    : Math.max(...(data?.dailyStats?.map((d) => d.count) || [1]), 1);

  return (
    <DashboardLayout title="Reports">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Reports</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab !== 'members' && (
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="date" className="input w-auto" value={range.startDate} onChange={(e) => setRange({ ...range, startDate: e.target.value })} />
          <span className="self-center text-gray-500">to</span>
          <input type="date" className="input w-auto" value={range.endDate} onChange={(e) => setRange({ ...range, endDate: e.target.value })} />
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <>
          {tab === 'revenue' && data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={Wallet} color="green" />
                <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={Wallet} color="red" />
                <StatCard title="Net Profit" value={formatCurrency(data.netProfit)} icon={Wallet} color="blue" />
              </div>
              <div className="card p-5 mb-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Daily Revenue</h3>
                <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
                  {data.dailyRevenue?.map((d) => (
                    <div key={d._id} className="flex flex-col items-center min-w-[48px]">
                      <div
                        className="w-8 bg-primary-500 rounded-t transition-all"
                        style={{ height: `${(d.revenue / maxBar) * 120}px`, minHeight: d.revenue ? 4 : 0 }}
                        title={formatCurrency(d.revenue)}
                      />
                      <span className="text-[10px] text-gray-500 mt-1 rotate-[-45deg] origin-top-left">{d._id?.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Member</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments?.slice(0, 50).map((p) => (
                      <tr key={p._id} className="border-b dark:border-gray-800">
                        <td className="p-3">{formatDate(p.paymentDate)}</td>
                        <td className="p-3">{p.memberId?.fullName}</td>
                        <td className="p-3">{formatCurrency(p.paidAmount)}</td>
                        <td className="p-3 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'attendance' && data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <StatCard title="Total Visits" value={data.totalVisits} icon={CalendarCheck} color="blue" />
                <StatCard title="Unique Members" value={data.uniqueMembers} icon={Users} color="green" />
              </div>
              <div className="card p-5 mb-6 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Daily Attendance</h3>
                <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
                  {data.dailyStats?.map((d) => (
                    <div key={d.date} className="flex flex-col items-center min-w-[48px]">
                      <div
                        className="w-8 bg-green-500 rounded-t"
                        style={{ height: `${(d.count / maxBar) * 120}px`, minHeight: d.count ? 4 : 0 }}
                      />
                      <span className="text-[10px] text-gray-500 mt-1">{d.date?.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'members' && data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {data.statusBreakdown?.map((s) => (
                  <StatCard key={s._id} title={s._id || 'Unknown'} value={s.count} icon={Users} color="blue" />
                ))}
                <StatCard title="New This Month" value={data.newMembersThisMonth} icon={Users} color="green" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Plan Distribution</h3>
                  {data.planBreakdown?.map((p) => (
                    <div key={p._id} className="flex justify-between py-2 border-b dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">{p._id || 'Custom'}</span>
                      <span className="font-medium">{p.count}</span>
                    </div>
                  ))}
                </div>
                <div className="card p-5 dark:bg-gray-900 dark:border-gray-800">
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Expiring Soon (30 days)</h3>
                  {data.expiringMembers?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No memberships expiring soon</p>
                  ) : (
                    data.expiringMembers?.map((m) => (
                      <div key={m._id} className="flex justify-between py-2 border-b dark:border-gray-800 last:border-0">
                        <span>{m.memberId?.fullName}</span>
                        <span className="text-sm text-gray-500">{formatDate(m.endDate)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
