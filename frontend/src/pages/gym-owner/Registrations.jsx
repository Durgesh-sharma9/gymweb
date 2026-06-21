import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate } from '../../utils/helpers';

export default function Registrations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/registrations?status=pending')
      .then((res) => setRequests(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load registrations:', err);
        toast.error('Failed to load registrations');
        setRequests([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approve = async (id) => {
    try {
      await api.put(`/registrations/${id}/approve`);
      toast.success('Registration approved');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const reject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.put(`/registrations/${id}/reject`, { reason });
      toast.success('Registration rejected');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Pending Registrations</h1>
      {requests.length === 0 ? (
        <EmptyState title="No pending registrations" description="Registration requests will appear here when members sign up" />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="card p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{r.fullName}</h3>
                <p className="text-sm text-gray-500">{r.mobile} · {formatDate(r.createdAt)}</p>
                {r.fitnessGoal && <p className="text-sm mt-1">Goal: {r.fitnessGoal}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(r._id)} className="btn-primary">Approve</button>
                <button onClick={() => reject(r._id)} className="btn-danger">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
