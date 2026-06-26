import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, CreditCard,
  Receipt, Settings, LogOut, Dumbbell, Megaphone, ClipboardList,
  UserPlus, Bell, Wallet, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ownerLinks = [
  { to: '/gym/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gym/members', icon: Users, label: 'Members' },
  { to: '/gym/trainers', icon: UserCog, label: 'Trainers' },
  { to: '/gym/plans', icon: CreditCard, label: 'Plans' },
  { to: '/gym/payments', icon: Wallet, label: 'Payments' },
  { to: '/gym/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/gym/registrations', icon: UserPlus, label: 'Registrations' },
  { to: '/gym/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/gym/activity-logs', icon: ClipboardList, label: 'Activity Logs' },
  { to: '/gym/subscription-request', icon: TrendingUp, label: 'Subscription' },
  { to: '/gym/settings', icon: Settings, label: 'Settings' },
];

const trainerLinks = [
  { to: '/trainer/dashboard', icon: LayoutDashboard, label: 'Dashboard', perm: null },
  { to: '/trainer/members', icon: Users, label: 'My Members', perm: 'viewAssignedMembers' },
  { to: '/trainer/collect-fee', icon: Wallet, label: 'Collect Fee', perm: 'collectFees' },
  { to: '/trainer/add-member', icon: UserPlus, label: 'Add Member', perm: 'addMember' },
  { to: '/trainer/registrations', icon: Bell, label: 'Registrations', perm: 'addMember' },
];

const superAdminLinks = [
  { to: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/super-admin/gyms', icon: Dumbbell, label: 'Gyms' },
  { to: '/super-admin/plans', icon: CreditCard, label: 'Plans' },
  { to: '/super-admin/subscription-requests', icon: Bell, label: 'Subscription Requests' },
  { to: '/super-admin/revenue', icon: Wallet, label: 'Revenue' },
  { to: '/super-admin/templates', icon: Receipt, label: 'Templates' },
  { to: '/super-admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, gym, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  let links = ownerLinks;
  if (user?.role === 'super_admin') links = superAdminLinks;
  if (user?.role === 'trainer') {
    links = trainerLinks.filter((l) => !l.perm || hasPermission(l.perm));
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-primary-600" size={24} />
          <div>
            <h1 className="font-bold text-lg">GymWeb</h1>
            {gym && <p className="text-xs text-gray-500 truncate">{gym.name}</p>}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t">
        <div className="px-3 py-2 text-sm">
          <p className="font-medium truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
