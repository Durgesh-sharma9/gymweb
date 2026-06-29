import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Users, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingSpinner } from '../../components/ui';

export default function TrainerProfile() {
  const { user, gym, loading } = useAuth();

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="max-w-2xl space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{user?.mobile || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Assigned Members</p>
                <p className="font-medium">{user?.memberCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user?.status === 'active' ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{user?.status || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Gym Information</h3>
          <div className="space-y-2">
            <p><span className="text-gray-500">Gym Name:</span> {gym?.name}</p>
            <p><span className="text-gray-500">Address:</span> {gym?.address || 'Not provided'}</p>
            <p><span className="text-gray-500">Mobile:</span> {gym?.mobile || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
