import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
=======
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, DollarSign, Download, MessageCircle, RefreshCw, User, Phone, MapPin, Activity, FileText, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
>>>>>>> 2116aaf6 (ui)
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Modal, Select, Input } from '../../components/ui';
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

  const currentMembership = member.currentMembershipId;
  const daysRemaining = currentMembership?.endDate 
    ? Math.ceil((new Date(currentMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <DashboardLayout>
<<<<<<< HEAD
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
=======
      <div className="mb-6">
        <Link to="/gym/members" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} /> Back to Members
        </Link>
>>>>>>> 2116aaf6 (ui)
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl font-bold">{member.fullName?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{member.fullName}</h1>
              <Badge
                variant={member.status === 'active' ? 'success' : member.status === 'expired' ? 'danger' : 'default'}
              >
                {member.status}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{member.memberId} · {member.mobile}</p>
            <div className="flex flex-wrap gap-2">
              {member.status !== 'inactive' && (
                <Button onClick={() => setRenewModal(true)} icon={RefreshCw}>Renew Membership</Button>
              )}
              {member.status === 'expired' && (
                <Button variant="secondary" onClick={() => handleStatus('inactive')}>Mark Inactive</Button>
              )}
              {member.status === 'inactive' && (
                <Button onClick={() => handleStatus('active')}>Reactivate</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Membership Overview */}
      {currentMembership && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card title="Plan" icon={Activity} padding="sm">
            <p className="text-lg font-semibold text-gray-900">{currentMembership.planName || 'Custom Plan'}</p>
            <p className="text-sm text-gray-500 mt-1">{currentMembership.isCustomPlan ? 'Custom' : 'Standard'}</p>
          </Card>

          <Card title="Start Date" icon={Calendar} padding="sm">
            <p className="text-lg font-semibold text-gray-900">{formatDate(currentMembership.startDate)}</p>
          </Card>

          <Card title="End Date" icon={Clock} padding="sm">
            <p className="text-lg font-semibold text-gray-900">{formatDate(currentMembership.endDate)}</p>
            {daysRemaining !== null && (
              <p className={`text-sm mt-1 ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days ago`}
              </p>
            )}
          </Card>

          <Card title="Amount Paid" icon={DollarSign} padding="sm">
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(currentMembership.paidAmount)}</p>
            {currentMembership.dueAmount > 0 && (
              <p className="text-sm text-red-600 mt-1">Due: {formatCurrency(currentMembership.dueAmount)}</p>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Details */}
        <Card title="Profile Information" icon={User}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{member.mobile}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{member.gender || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{member.address || '-'}</p>
              </div>
            </div>
            {member.assignedTrainerId && (
              <div className="flex items-start gap-3">
                <Activity size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Trainer</p>
                  <p className="font-medium text-gray-900">{member.assignedTrainerId.name}</p>
                </div>
              </div>
            )}
            {member.emergencyContactName && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</p>
                <p className="text-sm text-gray-600">{member.emergencyContactName}</p>
                <p className="text-sm text-gray-600">{member.emergencyContactMobile}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Payment History */}
        <Card title="Payment History" icon={CreditCard} className="lg:col-span-2">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Plan</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Paid</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Due</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                      <td className="p-3 text-gray-900">{p.planName || '-'}</td>
                      <td className="p-3 text-right text-gray-900">{formatCurrency(p.paidAmount)}</td>
                      <td className="p-3 text-right text-gray-900">{formatCurrency(p.dueAmount)}</td>
                      <td className="p-3 text-gray-600 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

<<<<<<< HEAD
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

=======
      {/* Notes */}
      {member.notes && (
        <Card title="Notes" icon={FileText} className="mb-6">
          <p className="text-gray-700">{member.notes}</p>
        </Card>
      )}

      {/* Membership History */}
      {history?.length > 0 && (
        <Card title="Membership Timeline" icon={Clock}>
          <div className="space-y-4">
            {history.map((h, index) => (
              <div key={h._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#2563EB]' : 'bg-gray-300'}`} />
                  {index < history.length - 1 && <div className="w-0.5 h-full bg-gray-200" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{h.planName || 'Custom Plan'}</p>
                    <Badge variant={h.status === 'active' ? 'success' : 'default'}>{h.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(h.startDate)} - {formatDate(h.endDate)}</p>
                  <p className="text-sm text-gray-600 mt-1">Paid: {formatCurrency(h.paidAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Renew Modal */}
>>>>>>> 2116aaf6 (ui)
      <Modal open={renewModal} onClose={() => setRenewModal(false)} title="Renew Membership">
        <form onSubmit={handleRenew} className="space-y-4">
          <Select
            label="Plan"
            value={renewForm.planId}
            onChange={(e) => {
              const plan = plans.find((p) => p._id === e.target.value);
              setRenewForm({ ...renewForm, planId: e.target.value, paidAmount: plan?.amount || '' });
            }}
            required
          >
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} - {formatCurrency(p.amount)}
              </option>
            ))}
          </Select>
          <Input
            label="Paid Amount"
            type="number"
            value={renewForm.paidAmount}
            onChange={(e) => setRenewForm({ ...renewForm, paidAmount: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            value={renewForm.paymentMethod}
            onChange={(e) => setRenewForm({ ...renewForm, paymentMethod: e.target.value })}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setRenewModal(false)}>Cancel</Button>
            <Button type="submit">Renew Membership</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
