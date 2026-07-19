import { useEffect, useState } from 'react';
import { Plus, Search, AlertCircle, Download, MessageCircle, Eye, Filter, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Input, Select, Card, Modal, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function Members() {
  const { user, hasPermission } = useAuth();
  const isTrainer = user?.role === 'trainer';
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

  if (loading) return <DashboardLayout title="Members" description="Manage all gym members, memberships and renewals"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Members" description="Manage all gym members, memberships and renewals from one place">
      {/* Limit Warning */}
      {limits?.memberLimitReached && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Member limit reached</p>
              <p className="text-sm text-yellow-700">
                You have reached your plan limit of {limits.maxMembers} members.{' '}
                <Link to="/gym/subscription-request" className="underline font-medium">Upgrade your plan</Link> to add more members.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Toolbar */}
      <Card padding="sm" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          {!isTrainer || hasPermission('addMember') ? (
            <Button
              onClick={() => setModal(true)}
              icon={Plus}
              disabled={limits?.memberLimitReached}
            >
              Add Member
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Members Table */}
      {members.length === 0 ? (
        <EmptyState
          title="No members found"
          description="Add your first member to get started"
          action={!isTrainer || hasPermission('addMember') ? (
            <Button onClick={() => setModal(true)} icon={Plus}>Add Member</Button>
          ) : null}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Member</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Mobile</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Membership End</th>
                  <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2563EB]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#2563EB] font-medium text-sm">
                            {m.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.fullName}</p>
                          <p className="text-xs text-gray-500">{m.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{m.mobile}</td>
                    <td className="p-4">
                      <Badge
                        variant={m.status === 'active' ? 'success' : m.status === 'expired' ? 'danger' : 'default'}
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">
                      {m.currentMembershipId ? formatDate(m.currentMembershipId.endDate) : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/gym/members/${m._id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} className="text-gray-600" />
                        </Link>
                        {!isTrainer || hasPermission('renewMembership') ? (
                          <Link
                            to={`/gym/members/${m._id}?action=renew`}
                            className="p-2 hover:bg-[#2563EB]/10 rounded-lg transition-colors"
                            title="Renew"
                          >
                            <Plus size={18} className="text-[#2563EB]" />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Member" size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <Card title="Personal Details" padding="sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
              <Input
                label="Mobile"
                value={form.mobile}
                onChange={(e) => { setForm({ ...form, mobile: e.target.value }); checkMobile(e.target.value); }}
                required
              />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
              <Input
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="col-span-1 sm:col-span-2"
              />
              <Input
                label="Emergency Contact Name"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              />
              <Input
                label="Emergency Contact Mobile"
                value={form.emergencyContactMobile}
                onChange={(e) => setForm({ ...form, emergencyContactMobile: e.target.value })}
              />
            </div>
          </Card>

          {/* Membership Details */}
          <Card title="Membership Details" padding="sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Plan"
                value={form.planId}
                onChange={(e) => previewPricing(e.target.value)}
                required
              >
                <option value="">Select plan</option>
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {formatCurrency(p.amount)}
                  </option>
                ))}
              </Select>
              {settings?.discountEnabled && (
                <>
                  <Select
                    label="Discount Type"
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </Select>
                  <Input
                    label="Discount Value"
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  />
                </>
              )}
            </div>
            {pricing && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">Plan Amount: <strong className="text-gray-900">{formatCurrency(pricing.baseAmount)}</strong></p>
                {pricing.discount.amount > 0 && (
                  <p className="text-sm">Discount: <strong className="text-green-600">{formatCurrency(pricing.discount.amount)}</strong></p>
                )}
                <p className="text-sm">Final Amount: <strong className="text-[#2563EB]">{formatCurrency(pricing.finalAmount)}</strong></p>
                {pricing.tax.enabled && (
                  <p className="text-sm">Tax ({pricing.tax.name}): {formatCurrency(pricing.tax.amount)}</p>
                )}
              </div>
            )}
          </Card>

          {/* Payment Details */}
          <Card title="Payment Details" padding="sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Paid Amount"
                type="number"
                value={form.paidAmount}
                onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                required
              />
              <Select
                label="Payment Method"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </Select>
            </div>
          </Card>

          {/* Notes */}
          <Card title="Notes" padding="sm">
            <Input
              label="Additional Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              helper="Any medical conditions, restrictions, etc."
            />
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>

      {/* Duplicate Member Modal */}
      <Modal open={!!duplicateModal} onClose={() => setDuplicateModal(null)} title="Existing Member Found">
        {duplicateModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              A member with mobile <strong>{duplicateModal.mobile}</strong> already exists: <strong>{duplicateModal.fullName}</strong>
            </p>
            <div className="flex gap-3">
              <Link to={`/gym/members/${duplicateModal._id}?action=renew`} className="flex-1">
                <Button className="w-full">Renew Membership</Button>
              </Link>
              {duplicateModal.status === 'inactive' && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await api.put(`/members/${duplicateModal._id}/status`, { status: 'active' });
                    toast.success('Member reactivated');
                    setDuplicateModal(null);
                    load();
                  }}
                >
                  Reactivate Member
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal open={!!successModal} onClose={() => setSuccessModal(null)} title="Member Added Successfully">
        {successModal && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye size={32} className="text-green-600" />
              </div>
              <p className="text-green-800 font-semibold text-lg">Member Added Successfully</p>
              <p className="text-green-700 text-sm mt-1">Member ID: {successModal.member?.memberId || 'Generating...'}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.open(`${window.location.origin}/invoice/${successModal.invoice?.publicToken}`, '_blank')}
                icon={Eye}
              >
                View Receipt
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
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
                }}
                icon={Download}
              >
                Download PDF
              </Button>
              <Button
                onClick={() => {
                  const message = `🏋️ Welcome to ${successModal.gym?.name || 'Our Gym'}\n\nHello ${successModal.member?.fullName},\n\nYour membership has been successfully activated.\n\n📋 Membership Details\n\nMember ID: ${successModal.member?.memberId}\nPlan: ${successModal.membership?.planName || successModal.invoice?.membershipSnapshot?.planName}\n\n💰 Payment Details\n\nPlan Amount: ₹${successModal.invoice?.lineItems?.baseAmount}\nDiscount: ₹${successModal.invoice?.lineItems?.discount}\nAmount Paid: ₹${successModal.invoice?.lineItems?.finalAmount}\n\n📅 Membership Period\n\nStart Date: ${formatDate(successModal.membership?.startDate)}\nExpiry Date: ${formatDate(successModal.membership?.endDate)}\n\n🧾 Receipt\n\nView / Download Receipt:\n${window.location.origin}/invoice/${successModal.invoice?.publicToken}\n\nThank you for choosing ${successModal.gym?.name || 'Our Gym'}.\n\nFor assistance please contact us.\n\n${successModal.gym?.name || 'Our Gym'}\n${successModal.gym?.mobile}`;
                  const encodedMessage = encodeURIComponent(message);
                  window.open(`https://wa.me/${successModal.member?.mobile}?text=${encodedMessage}`, '_blank');
                }}
                className="bg-[#16A34A] hover:bg-[#158a3d]"
                icon={MessageCircle}
              >
                Send WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
