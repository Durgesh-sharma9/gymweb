import { useEffect, useState } from 'react';
import { Search, LogIn, LogOut, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatCard, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate } from '../../utils/helpers';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, checkedIn: 0, checkedOut: 0 });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  const load = () => {
    Promise.all([
      api.get('/attendance/today'),
      api.get('/members?status=active&limit=100'),
    ])
      .then(([att, mem]) => {
        setRecords(att.data.records);
        setSummary(att.data.summary);
        setMembers(mem.data.members);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCheckIn = async () => {
    if (!selectedMember) return toast.error('Select a member');
    try {
      await api.post('/attendance/check-in', { memberId: selectedMember });
      toast.success('Check-in recorded');
      setSelectedMember('');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      await api.post('/attendance/check-out', { memberId });
      toast.success('Check-out recorded');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = records.filter((r) => {
    if (!search) return true;
    const name = r.memberId?.fullName?.toLowerCase() || '';
    const mobile = r.memberId?.mobile || '';
    return name.includes(search.toLowerCase()) || mobile.includes(search);
  });

  if (loading) return <DashboardLayout title="Attendance"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Attendance">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Today's Visits" value={summary.total} icon={Users} color="blue" />
        <StatCard title="Currently In" value={summary.checkedIn} icon={LogIn} color="green" />
        <StatCard title="Checked Out" value={summary.checkedOut} icon={LogOut} color="purple" />
      </div>

      <div className="card p-4 mb-6 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Quick Check-in</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="input flex-1"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="">Select member...</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.fullName} — {m.mobile}</option>
            ))}
          </select>
          <button type="button" onClick={handleCheckIn} className="btn-primary whitespace-nowrap">
            <LogIn size={18} /> Check In
          </button>
        </div>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          className="input pl-10"
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No attendance today" description="Check in members to start tracking" />
      ) : (
        <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left p-3">Member</th>
                  <th className="text-left p-3">Check In</th>
                  <th className="text-left p-3">Check Out</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900 dark:text-white">{r.memberId?.fullName}</div>
                      <div className="text-xs text-gray-500">{r.memberId?.mobile}</div>
                    </td>
                    <td className="p-3">{new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3">
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.checkOut ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        <Clock size={12} />
                        {r.checkOut ? 'Completed' : 'In Gym'}
                      </span>
                    </td>
                    <td className="p-3">
                      {!r.checkOut && (
                        <button
                          type="button"
                          onClick={() => handleCheckOut(r.memberId._id)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
