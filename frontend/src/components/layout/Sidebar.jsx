import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, CreditCard,
  Receipt, Settings, LogOut, Dumbbell, Megaphone, ClipboardList,
  UserPlus, Bell, Wallet, TrendingUp, CalendarCheck, FileBarChart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ownerLinks = [
  { to: '/gym/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gym/members', icon: Users, label: 'Members' },
  { to: '/gym/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/gym/trainers', icon: UserCog, label: 'Staff' },
  { to: '/gym/plans', icon: CreditCard, label: 'Plans' },
  { to: '/gym/payments', icon: Wallet, label: 'Payments' },
  { to: '/gym/receipts', icon: Receipt, label: 'Receipts' },
  { to: '/gym/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/gym/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/gym/registrations', icon: UserPlus, label: 'Registrations' },
  { to: '/gym/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/gym/activity-logs', icon: ClipboardList, label: 'Activity Logs' },
  { to: '/gym/subscription-request', icon: TrendingUp, label: 'Subscription' },
  { to: '/gym/settings', icon: Settings, label: 'Settings' },
];

const trainerLinks = [
  { to: '/trainer/dashboard', icon: LayoutDashboard, label: 'Dashboard', perm: null },
  { to: '/trainer/members', icon: Users, label: 'Members', perm: 'viewAssignedMembers' },
  { to: '/trainer/attendance', icon: CalendarCheck, label: 'Attendance', perm: 'viewAssignedMembers' },
  { to: '/trainer/profile', icon: UserCog, label: 'Profile', perm: null },
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

export default function Sidebar({ onNavigate }) {
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
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Dumbbell className="text-white" size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">GymWeb</h1>
            {gym && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{gym.name}</p>}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="px-3 py-2 text-sm">
          <p className="font-medium truncate text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
