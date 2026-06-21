import { useEffect, useState } from 'react';
import { Eye, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate } from '../../utils/helpers';

export default function Gyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/super-admin/gyms').then((res) => setGyms(res.data)).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/super-admin/gyms/${id}/status`, { status: newStatus });
      toast.success(`Gym ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      setGyms(gyms.map((g) => (g._id === id ? { ...g, status: newStatus } : g)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">All Gyms</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Gym</th>
              <th className="text-left p-3">Owner</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Members</th>
              <th className="text-left p-3">Trainers</th>
              <th className="text-left p-3">Subscription</th>
              <th className="text-left p-3">Trial End</th>
              <th className="text-left p-3">Sub End</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gyms.map((g) => (
              <tr key={g._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{g.name}</td>
                <td className="p-3">{g.ownerId?.name}</td>
                <td className="p-3">
                  <div className="text-xs">{g.ownerId?.email}</div>
                  <div className="text-xs text-gray-500">{g.ownerId?.mobile || '-'}</div>
                </td>
                <td className="p-3">{g.platformPlanId?.name || 'No Plan'}</td>
                <td className="p-3">{g.memberCount || 0} / {g.platformPlanId?.maxMembers ?? '∞'}</td>
                <td className="p-3">{g.trainerCount || 0} / {g.platformPlanId?.maxTrainers ?? '∞'}</td>
                <td className="p-3"><StatusBadge status={g.subscriptionStatus} /></td>
                <td className="p-3">{g.trialEnd ? formatDate(g.trialEnd) : '-'}</td>
                <td className="p-3">{g.subscriptionEnd ? formatDate(g.subscriptionEnd) : '-'}</td>
                <td className="p-3"><StatusBadge status={g.status} /></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/super-admin/gyms/${g._id}`)} className="text-primary-600 hover:underline" title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => toggleStatus(g._id, g.status)} className="text-yellow-600 hover:underline" title="Toggle Status">
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
