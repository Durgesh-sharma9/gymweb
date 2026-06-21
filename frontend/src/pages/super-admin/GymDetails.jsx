import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserCog, TrendingUp, Activity } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/super-admin/gyms/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const { gym, stats } = data;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/super-admin/gyms')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{gym.name}</h1>
        <StatusBadge status={gym.status} />
      </div>

      <div className="flex border-b mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'trainers', label: 'Trainers', icon: UserCog },
          { id: 'revenue', label: 'Revenue', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab gym={gym} stats={stats} />}
      {activeTab === 'members' && <MembersTab gymId={gym._id} />}
      {activeTab === 'trainers' && <TrainersTab gymId={gym._id} />}
      {activeTab === 'revenue' && <RevenueTab gymId={gym._id} />}
    </DashboardLayout>
  );
}

function OverviewTab({ gym, stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Gym Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span>{gym.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Slug:</span><span>{gym.slug}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City:</span><span>{gym.city || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address:</span><span>{gym.address || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span><span>{gym.mobile || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{gym.email || '-'}</span></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Owner Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span>{gym.ownerId?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{gym.ownerId?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span><span>{gym.ownerId?.mobile || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={gym.ownerId?.status} /></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Current Plan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Plan:</span><span>{gym.platformPlanId?.name || 'No Plan'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Price:</span><span>{gym.platformPlanId ? formatCurrency(gym.platformPlanId.price) + '/mo' : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Members:</span><span>{gym.platformPlanId?.maxMembers ?? 'Unlimited'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Trainers:</span><span>{gym.platformPlanId?.maxTrainers ?? 'Unlimited'}</span></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Subscription Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={gym.subscriptionStatus} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Start:</span><span>{gym.subscriptionStart ? formatDate(gym.subscriptionStart) : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">End:</span><span>{gym.subscriptionEnd ? formatDate(gym.subscriptionEnd) : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial:</span><span>{gym.isTrial ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial End:</span><span>{gym.trialEnd ? formatDate(gym.trialEnd) : '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{stats.memberCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active Members</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeMembers}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Expired Members</p>
          <p className="text-2xl font-bold text-red-600">{stats.expiredMembers}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Trainers</p>
          <p className="text-2xl font-bold">{stats.trainerCount}</p>
        </div>
      </div>
    </div>
  );
}

function MembersTab({ gymId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/members?gymId=${gymId}`).then((res) => setMembers(res.data)).finally(() => setLoading(false));
  }, [gymId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Mobile</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id} className="border-b hover:bg-gray-50">
              <td className="p-3">{m.fullName}</td>
              <td className="p-3">{m.mobile}</td>
              <td className="p-3"><StatusBadge status={m.status} /></td>
              <td className="p-3">{formatDate(m.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrainersTab({ gymId }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/trainers?gymId=${gymId}`).then((res) => setTrainers(res.data)).finally(() => setLoading(false));
  }, [gymId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Mobile</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t._id} className="border-b hover:bg-gray-50">
              <td className="p-3">{t.name}</td>
              <td className="p-3">{t.email}</td>
              <td className="p-3">{t.mobile || '-'}</td>
              <td className="p-3"><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RevenueTab({ gymId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/payments?gymId=${gymId}`).then((res) => setPayments(res.data)).finally(() => setLoading(false));
  }, [gymId]);

  if (loading) return <LoadingSpinner />;

  const totalRevenue = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold">{payments.length}</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Member</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.memberId?.fullName || '-'}</td>
                <td className="p-3">{formatCurrency(p.paidAmount)}</td>
                <td className="p-3">{formatDate(p.paymentDate)}</td>
                <td className="p-3 capitalize">{p.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
