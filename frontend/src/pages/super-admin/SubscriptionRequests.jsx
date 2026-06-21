import { useEffect, useState } from 'react';
import { Check, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge, Modal } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function SubscriptionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/super-admin/subscription-requests')
      .then((res) => setRequests(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load subscription requests:', err);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/super-admin/subscription-requests/${id}/approve`);
      toast.success('Subscription approved');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/super-admin/subscription-requests/${rejectModal._id}/reject`, { reason: rejectionReason });
      toast.success('Subscription request rejected');
      setRejectModal(null);
      setRejectionReason('');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Subscription Requests</h1>

      {requests.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No pending subscription requests</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Gym</th>
                <th className="text-left p-3">Current Plan</th>
                <th className="text-left p-3">Requested Plan</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Request Date</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{req.gymId?.name}</td>
                  <td className="p-3">{req.currentPlanId?.name || 'No Plan'}</td>
                  <td className="p-3">{req.requestedPlanId?.name}</td>
                  <td className="p-3">{formatCurrency(req.requestedPlanId?.price || 0)}/mo</td>
                  <td className="p-3">{formatDate(req.createdAt)}</td>
                  <td className="p-3"><StatusBadge status={req.status} /></td>
                  <td className="p-3">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setRejectModal(req)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <span className="text-green-600 text-sm">Approved</span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="text-red-600 text-sm">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Subscription Request">
        {rejectModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to reject the subscription request for <strong>{rejectModal.gymId?.name}</strong>?
            </p>
            <div>
              <label className="label">Rejection Reason</label>
              <textarea
                className="input"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleReject} className="btn-danger">Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
