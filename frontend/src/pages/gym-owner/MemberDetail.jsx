import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge, Modal } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewModal, setRenewModal] = useState(searchParams.get('action') === 'renew');
  const [editModal, setEditModal] = useState(false);
  const [renewForm, setRenewForm] = useState({ planId: '', paidAmount: '', paymentMethod: 'cash' });
  const [editForm, setEditForm] = useState({});

  const load = () => {
    Promise.all([api.get(`/members/${id}`), api.get('/plans?status=active')])
      .then(([m, p]) => {
        setData(m.data);
        setEditForm({
          fullName: m.data.member.fullName,
          mobile: m.data.member.mobile,
          gender: m.data.member.gender || 'male',
          address: m.data.member.address || '',
          notes: m.data.member.notes || '',
        });
        setPlans(p.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleRenew = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/members/${id}/renew`, { ...renewForm, paidAmount: Number(renewForm.paidAmount) });
      toast.success('Membership renewed');
      setRenewModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatus = async (status) => {
    try {
      await api.put(`/members/${id}/status`, { status });
      toast.success(`Member marked ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${id}`, editForm);
      toast.success('Member updated');
      setEditModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/members/${id}`);
      toast.success('Member deleted');
      navigate('/gym/members');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  const { member, history, payments } = data;

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{member.fullName}</h1>
          <p className="text-gray-500">{member.mobile} · <StatusBadge status={member.status} /></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditModal(true)} className="btn-secondary">Edit</button>
          {member.status !== 'inactive' && (
            <button type="button" onClick={() => setRenewModal(true)} className="btn-primary">Renew</button>
          )}
          {member.status === 'expired' && (
            <button type="button" onClick={() => handleStatus('inactive')} className="btn-secondary">Mark Inactive</button>
          )}
          {member.status === 'inactive' && (
            <button type="button" onClick={() => handleStatus('active')} className="btn-primary">Reactivate</button>
          )}
          <button type="button" onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold mb-3">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Gender</dt><dd className="capitalize">{member.gender || '-'}</dd></div>
            <div><dt className="text-gray-500">Address</dt><dd>{member.address || '-'}</dd></div>
            <div><dt className="text-gray-500">Fitness Goal</dt><dd>{member.fitnessGoal || '-'}</dd></div>
            <div><dt className="text-gray-500">Trainer</dt><dd>{member.assignedTrainerId?.name || 'Unassigned'}</dd></div>
          </dl>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Payment History</h3>
          {payments.length === 0 ? <p className="text-gray-500 text-sm">No payments yet</p> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2">Date</th><th className="text-left py-2">Paid</th><th className="text-left py-2">Due</th><th className="text-left py-2">Method</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="py-2">{formatDate(p.paymentDate)}</td>
                    <td className="py-2">{formatCurrency(p.paidAmount)}</td>
                    <td className="py-2">{formatCurrency(p.dueAmount)}</td>
                    <td className="py-2 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Member">
        <form onSubmit={handleEdit} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} required /></div>
          <div><label className="label">Mobile</label><input className="input" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} required /></div>
          <div><label className="label">Gender</label>
            <select className="input" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Address</label><input className="input" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
          <div><label className="label">Notes</label><textarea className="input" rows="2" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={renewModal} onClose={() => setRenewModal(false)} title="Renew Membership">
        <form onSubmit={handleRenew} className="space-y-4">
          <div><label className="label">Plan</label>
            <select className="input" value={renewForm.planId} onChange={(e) => {
              const plan = plans.find((p) => p._id === e.target.value);
              setRenewForm({ ...renewForm, planId: e.target.value, paidAmount: plan?.amount || '' });
            }} required>
              <option value="">Select plan</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} - {formatCurrency(p.amount)}</option>)}
            </select>
          </div>
          <div><label className="label">Paid Amount</label><input type="number" className="input" value={renewForm.paidAmount} onChange={(e) => setRenewForm({ ...renewForm, paidAmount: e.target.value })} required /></div>
          <div><label className="label">Payment Method</label>
            <select className="input" value={renewForm.paymentMethod} onChange={(e) => setRenewForm({ ...renewForm, paymentMethod: e.target.value })}>
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="card">Card</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRenewModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Renew</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
