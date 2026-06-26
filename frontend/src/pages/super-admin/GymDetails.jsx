import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserCog, TrendingUp, Activity, User, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function GymDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log('Gym ID from URL:', id);
    api.get(`/super-admin/gyms/${id}`)
      .then((res) => {
        console.log('API Response:', res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.error('Failed to load gym details:', err);
        setError(err.message || 'Failed to load gym details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/super-admin/gyms')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Gym not found'}</p>
          <button onClick={() => navigate('/super-admin/gyms')} className="btn-primary">Back to Gyms</button>
        </div>
      </DashboardLayout>
    );
  }

  const { gym, stats, activityLogs } = data;

  if (!gym) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/super-admin/gyms')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">Gym data not available</p>
          <button onClick={() => navigate('/super-admin/gyms')} className="btn-primary">Back to Gyms</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/super-admin/gyms')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{gym?.name || 'Unknown Gym'}</h1>
        <StatusBadge status={gym?.status} />
      </div>

      <div className="flex border-b mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'trainers', label: 'Trainers', icon: UserCog },
          { id: 'owner', label: 'Owner', icon: User },
          { id: 'activity', label: 'Activity', icon: Activity },
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
      {activeTab === 'owner' && <OwnerTab gym={gym} />}
      {activeTab === 'activity' && <ActivityTab activityLogs={activityLogs} />}
    </DashboardLayout>
  );
}

function OverviewTab({ gym, stats }) {
  const handleExportSummary = async () => {
    try {
      const response = await api.get(`/super-admin/export/summary/${gym._id}`);
      const data = response.data;
      const content = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'gym_summary.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  if (!gym) return <div className="card p-8 text-center text-gray-500">Gym data not available</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleExportSummary} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export Gym Summary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Gym Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span>{gym?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Slug:</span><span>{gym?.slug || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City:</span><span>{gym?.city || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Address:</span><span>{gym?.address || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span><span>{gym?.mobile || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{gym?.email || '-'}</span></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Owner Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span>{gym?.ownerId?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{gym?.ownerId?.email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Mobile:</span><span>{gym?.ownerId?.mobile || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={gym?.ownerId?.status} /></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Current Plan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Plan:</span><span>{gym?.platformPlanId?.name || 'No Plan'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Price:</span><span>{gym?.platformPlanId ? formatCurrency(gym.platformPlanId.price) + '/mo' : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Members:</span><span>{gym?.platformPlanId?.maxMembers ?? 'Unlimited'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Trainers:</span><span>{gym?.platformPlanId?.maxTrainers ?? 'Unlimited'}</span></div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Subscription Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status:</span><StatusBadge status={gym?.subscriptionStatus} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Start:</span><span>{gym?.subscriptionStart ? formatDate(gym.subscriptionStart) : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">End:</span><span>{gym?.subscriptionEnd ? formatDate(gym.subscriptionEnd) : '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial:</span><span>{gym?.isTrial ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial End:</span><span>{gym?.trialEnd ? formatDate(gym.trialEnd) : '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{stats?.memberCount || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active Members</p>
          <p className="text-2xl font-bold text-green-600">{stats?.activeMembers || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Expired Members</p>
          <p className="text-2xl font-bold text-red-600">{stats?.expiredMembers || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Trainers</p>
          <p className="text-2xl font-bold">{stats?.trainerCount || 0}</p>
        </div>
      </div>
    </div>
  );
}

function MembersTab({ gymId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/super-admin/gyms/${gymId}/members`).then((res) => {
      console.log('Members API Response:', res.data);
      setMembers(Array.isArray(res.data) ? res.data : []);
    }).finally(() => setLoading(false));
  }, [gymId]);

  const filteredMembers = members.filter(m => 
    m.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    m.mobile?.includes(search)
  );

  const handleExportMembers = async (format) => {
    try {
      console.log('handleExportMembers - Requesting format:', format);
      console.log('handleExportMembers - Gym ID:', gymId);
      const response = await api.get(`/super-admin/export/members/${gymId}?format=${format}`, { responseType: 'arraybuffer' });
      console.log('handleExportMembers - Response data type:', typeof response.data);
      console.log('handleExportMembers - Response data length:', response.data?.length || 0);
      console.log('handleExportMembers - Response headers:', response.headers);
      let blob;
      if (format === 'xlsx') {
        blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else if (format === 'pdf') {
        blob = new Blob([response.data], { type: 'application/pdf' });
      }
      console.log('handleExportMembers - Blob created, size:', blob.size);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gym_members_${gymId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('handleExportMembers - Export completed');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => handleExportMembers('xlsx')} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export Excel
        </button>
        <button onClick={() => handleExportMembers('pdf')} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export PDF
        </button>
      </div>

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
            {filteredMembers.map((m) => (
              <tr key={m._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{m.fullName}</td>
                <td className="p-3">{m.mobile}</td>
                <td className="p-3"><StatusBadge status={m.status} /></td>
                <td className="p-3">{formatDate(m.createdAt)}</td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrainersTab({ gymId }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const handleExportTrainers = async (format) => {
    try {
      const response = await api.get(`/super-admin/export/trainers/${gymId}?format=${format}`, { responseType: 'arraybuffer' });
      let blob;
      if (format === 'xlsx') {
        blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else if (format === 'pdf') {
        blob = new Blob([response.data], { type: 'application/pdf' });
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gym_trainers_${gymId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  useEffect(() => {
    api.get(`/super-admin/gyms/${gymId}/trainers`).then((res) => setTrainers(Array.isArray(res.data) ? res.data : [])).finally(() => setLoading(false));
  }, [gymId]);

  const filteredTrainers = trainers.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.mobile?.includes(search)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Search trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => handleExportTrainers('xlsx')} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export Excel
        </button>
        <button onClick={() => handleExportTrainers('pdf')} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export PDF
        </button>
      </div>

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
            {filteredTrainers.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.mobile || '-'}</td>
                <td className="p-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
            {filteredTrainers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No trainers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OwnerTab({ gym }) {
  const handleExportOwner = async (format) => {
    try {
      const response = await api.get(`/super-admin/export/owner/${gym._id}?format=${format}`, { responseType: 'arraybuffer' });
      let blob;
      if (format === 'xlsx') {
        blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else if (format === 'pdf') {
        blob = new Blob([response.data], { type: 'application/pdf' });
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gym_owner_${gym._id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  if (!gym) return <div className="card p-8 text-center text-gray-500">Gym data not available</div>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-semibold mb-4">Owner Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{gym.ownerId?.name || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{gym.ownerId?.email || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Mobile</span>
            <span className="font-medium">{gym.ownerId?.mobile || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Status</span>
            <StatusBadge status={gym.ownerId?.status} />
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Current Plan</span>
            <span className="font-medium">{gym.platformPlanId?.name || 'No Plan'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Plan Price</span>
            <span className="font-medium">{gym.platformPlanId ? formatCurrency(gym.platformPlanId.price) + '/mo' : '-'}</span>
          </div>
        </div>
        <button onClick={() => handleExportOwner('xlsx')} className="btn-primary mt-6 flex items-center gap-2">
          <Download size={16} /> Export Excel
        </button>
        <button onClick={() => handleExportOwner('pdf')} className="btn-primary mt-6 flex items-center gap-2">
          <Download size={16} /> Export PDF
        </button>
      </div>
    </div>
  );
}

function ActivityTab({ activityLogs }) {
  if (!activityLogs) return <div className="card p-8 text-center text-gray-500">No activity logs available</div>;

  return (
    <div className="card overflow-x-auto">
      <h3 className="font-semibold mb-4">Activity Logs</h3>
      {activityLogs?.length > 0 ? (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Performed By</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log) => (
              <tr key={log._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{log.action}</td>
                <td className="p-3">{log.description}</td>
                <td className="p-3">{log.performedBy?.name || 'System'}</td>
                <td className="p-3">{formatDate(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm p-6">No activity logs found</p>
      )}
    </div>
  );
}
