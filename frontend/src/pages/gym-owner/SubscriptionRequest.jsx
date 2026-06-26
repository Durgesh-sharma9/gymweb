import { useEffect, useState } from 'react';
import { Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Modal, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency } from '../../utils/helpers';

export default function SubscriptionRequest() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/public/plans'),
      api.get('/gym/details').catch(() => ({ data: { gym: { platformPlanId: null } } })),
      api.get('/gym/subscription-requests'),
    ])
      .then(([plansRes, detailsRes, requestsRes]) => {
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
        setCurrentPlan(detailsRes.data.gym?.platformPlanId);
        setMyRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        toast.error('Failed to load data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gym/subscription-request', { requestedPlanId: selectedPlan._id });
      toast.success('Subscription request submitted successfully');
      setModal(false);
      setSelectedPlan(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const hasPendingRequest = myRequests.some(r => r.gymId?._id === currentPlan?.gymId && r.status === 'pending');

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Subscription Upgrade</h1>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4">Current Plan</h3>
        {currentPlan ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{currentPlan.name}</p>
              <p className="text-gray-500">{formatCurrency(currentPlan.price)}/month</p>
            </div>
            <StatusBadge status="active" />
          </div>
        ) : (
          <p className="text-gray-500">No active plan</p>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans.filter(p => p._id !== currentPlan?._id).map((plan) => (
          <div key={plan._id} className="card p-6 border-2 border-transparent hover:border-primary-500 transition-colors">
            <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
            <p className="text-2xl font-bold mb-4">{formatCurrency(plan.price)}<span className="text-sm text-gray-500">/mo</span></p>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>Max Members: {plan.maxMembers ?? 'Unlimited'}</li>
              <li>Max Trainers: {plan.maxTrainers ?? 'Unlimited'}</li>
              <li>Duration: {plan.durationMonths} months</li>
            </ul>
            {plan.features && plan.features.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">FEATURES</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {plan.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => { setSelectedPlan(plan); setModal(true); }}
              className="btn-primary w-full"
              disabled={hasPendingRequest}
            >
              {hasPendingRequest ? 'Request Pending' : 'Request Upgrade'}
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-4">My Requests</h3>
      <div className="card overflow-x-auto">
        {myRequests.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Requested Plan</th>
                <th className="text-left p-3">Current Plan</th>
                <th className="text-left p-3">Request Date</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((req) => (
                <tr key={req._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{req.requestedPlanId?.name}</td>
                  <td className="p-3">{req.currentPlanId?.name || 'No Plan'}</td>
                  <td className="p-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-3"><StatusBadge status={req.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm p-4">No subscription requests found</p>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Confirm Subscription Upgrade">
        {selectedPlan && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to upgrade to <strong>{selectedPlan.name}</strong>?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">{selectedPlan.name}</p>
              <p className="text-2xl font-bold">{formatCurrency(selectedPlan.price)}/month</p>
              <p className="text-sm text-gray-500">Max Members: {selectedPlan.maxMembers ?? 'Unlimited'}</p>
              <p className="text-sm text-gray-500">Max Trainers: {selectedPlan.maxTrainers ?? 'Unlimited'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary">
                <Send size={16} className="mr-2" /> Submit Request
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
