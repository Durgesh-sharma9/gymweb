import { useEffect, useState } from 'react';
import { Plus, Search, AlertCircle, Download, MessageCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge, Modal, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [form, setForm] = useState({
    fullName: '', mobile: '', gender: 'male', address: '', dateOfBirth: '',
    emergencyContactName: '', emergencyContactMobile: '', notes: '',
    planId: '', paidAmount: '', paymentMethod: 'cash', discountType: '', discountValue: '',
  });
  const [pricing, setPricing] = useState(null);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    Promise.all([
      api.get(`/members?${params}`),
      api.get('/plans?status=active'),
      api.get('/gym/settings'),
      api.get('/gym/limits'),
    ]).then(([m, p, s, l]) => {
      setMembers(m.data.members);
      setPlans(p.data);
      setSettings(s.data);
      setLimits(l.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [search, statusFilter]);

  const checkMobile = async (mobile) => {
    if (mobile.length < 10) return;
    try {
      const res = await api.get(`/members/check-mobile/${mobile}`);
      if (res.data.exists) setDuplicateModal(res.data.member);
    } catch { /* ignore */ }
  };

  const previewPricing = async (planId) => {
    const plan = plans.find((p) => p._id === planId);
    if (!plan) return;
    const res = await api.post('/pricing/preview', {
      baseAmount: plan.amount,
      discountType: form.discountType || null,
      discountValue: Number(form.discountValue) || 0,
    });
    setPricing(res.data);
    setForm({ ...form, planId, paidAmount: res.data.finalAmount });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (limits?.memberLimitReached) {
      toast.error(`Member limit reached (${limits.currentMembers}/${limits.maxMembers}). Upgrade your plan to add more members.`);
      return;
    }
    try {
      const res = await api.post('/members', {
        ...form,
        paidAmount: Number(form.paidAmount),
        discountValue: Number(form.discountValue) || 0,
      });
      toast.success('Member added');
      setModal(false);
      setSuccessModal(res.data);
      load();
    } catch (err) {
      if (err.status === 409 && err.data?.data?.member) {
        setDuplicateModal(err.data.data.member);
      } else {
        toast.error(err.message);
      }
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          onClick={() => setModal(true)}
          className="btn-primary"
          disabled={limits?.memberLimitReached}
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      {limits?.memberLimitReached && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-600" size={20} />
          <div>
            <p className="font-medium text-yellow-800">Member limit reached</p>
            <p className="text-sm text-yellow-700">
              You have reached your plan limit of {limits.maxMembers} members. 
              <Link to="/gym/subscription-request" className="underline ml-2">Upgrade your plan</Link> to add more members.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input className="input pl-10" placeholder="Search name or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {members.length === 0 ? (
        <EmptyState title="No members found" description="Add your first member to get started" action={<button onClick={() => setModal(true)} className="btn-primary">Add Member</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Mobile</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Membership End</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{m.fullName}</td>
                  <td className="p-3">{m.mobile}</td>
                  <td className="p-3"><StatusBadge status={m.status} /></td>
                  <td className="p-3">{m.currentMembershipId ? formatDate(m.currentMembershipId.endDate) : '-'}</td>
                  <td className="p-3">
                    <Link to={`/gym/members/${m._id}`} className="text-primary-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Member" size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
          <div><label className="label">Mobile</label><input className="input" value={form.mobile} onChange={(e) => { setForm({ ...form, mobile: e.target.value }); checkMobile(e.target.value); }} required /></div>
          <div><label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">Emergency Contact Name</label><input className="input" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} /></div>
          <div><label className="label">Emergency Contact Mobile</label><input className="input" value={form.emergencyContactMobile} onChange={(e) => setForm({ ...form, emergencyContactMobile: e.target.value })} /></div>
          <div className="col-span-2"><label className="label">Notes</label><textarea className="input" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any medical conditions, restrictions, etc." /></div>
          <div><label className="label">Plan</label>
            <select className="input" value={form.planId} onChange={(e) => previewPricing(e.target.value)} required>
              <option value="">Select plan</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} - {formatCurrency(p.amount)}</option>)}
            </select>
          </div>
          {settings?.discountEnabled && (
            <>
              <div><label className="label">Discount Type</label>
                <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                  <option value="">None</option><option value="fixed">Fixed</option><option value="percentage">Percentage</option>
                </select>
              </div>
              <div><label className="label">Discount Value</label><input type="number" className="input" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></div>
            </>
          )}
          {pricing && (
            <div className="col-span-2 bg-gray-50 p-3 rounded-lg text-sm">
              <p>Plan Amount: <strong>{formatCurrency(pricing.baseAmount)}</strong></p>
              {pricing.discount.amount > 0 && <p>Discount: <strong>{formatCurrency(pricing.discount.amount)}</strong></p>}
              <p>Final Amount: <strong>{formatCurrency(pricing.finalAmount)}</strong></p>
              {pricing.tax.enabled && <p>Tax ({pricing.tax.name}): {formatCurrency(pricing.tax.amount)}</p>}
            </div>
          )}
          <div><label className="label">Paid Amount</label><input type="number" className="input" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required /></div>
          <div><label className="label">Payment Method</label>
            <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="card">Card</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!duplicateModal} onClose={() => setDuplicateModal(null)} title="Existing Member Found">
        {duplicateModal && (
          <div>
            <p className="mb-4">A member with mobile <strong>{duplicateModal.mobile}</strong> already exists: <strong>{duplicateModal.fullName}</strong></p>
            <div className="flex gap-2">
              <Link to={`/gym/members/${duplicateModal._id}?action=renew`} className="btn-primary">Renew Membership</Link>
              {duplicateModal.status === 'inactive' && (
                <button className="btn-secondary" onClick={async () => {
                  await api.put(`/members/${duplicateModal._id}/status`, { status: 'active' });
                  toast.success('Member reactivated');
                  setDuplicateModal(null);
                  load();
                }}>Reactivate Member</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!successModal} onClose={() => setSuccessModal(null)} title="Member Added Successfully" size="md">
        {successModal && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">✅ Member Added Successfully</p>
              <p className="text-green-700 text-sm">Member ID: {successModal.member?.memberId || 'Generating...'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => window.open(`${window.location.origin}/invoice/${successModal.invoice?.publicToken}`, '_blank')} className="btn-primary flex items-center justify-center gap-2">
                <Eye size={18} /> View Receipt
              </button>
              <button onClick={async () => {
                const response = await api.get(`/invoices/${successModal.invoice?._id}/pdf`, { responseType: 'arraybuffer' });
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `receipt_${successModal.invoice?.invoiceNumber}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              }} className="btn-secondary flex items-center justify-center gap-2">
                <Download size={18} /> Download PDF
              </button>
              <button onClick={() => {
                const message = `🏋️ Welcome to ${successModal.gym?.name || 'Our Gym'}\n\nHello ${successModal.member?.fullName},\n\nYour membership has been successfully activated.\n\n📋 Membership Details\n\nMember ID: ${successModal.member?.memberId}\nPlan: ${successModal.membership?.planName || successModal.invoice?.membershipSnapshot?.planName}\n\n💰 Payment Details\n\nPlan Amount: ₹${successModal.invoice?.lineItems?.baseAmount}\nDiscount: ₹${successModal.invoice?.lineItems?.discount}\nAmount Paid: ₹${successModal.invoice?.lineItems?.finalAmount}\n\n📅 Membership Period\n\nStart Date: ${formatDate(successModal.membership?.startDate)}\nExpiry Date: ${formatDate(successModal.membership?.endDate)}\n\n🧾 Receipt\n\nView / Download Receipt:\n${window.location.origin}/invoice/${successModal.invoice?.publicToken}\n\nThank you for choosing ${successModal.gym?.name || 'Our Gym'}.\n\nFor assistance please contact us.\n\n${successModal.gym?.name || 'Our Gym'}\n${successModal.gym?.mobile}`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${successModal.member?.mobile}?text=${encodedMessage}`, '_blank');
              }} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                <MessageCircle size={18} /> Send WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
