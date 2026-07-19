import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, CreditCard,
  Receipt, Settings, LogOut, Dumbbell, Megaphone, ClipboardList,
<<<<<<< HEAD
  UserPlus, Bell, Wallet, TrendingUp, CalendarCheck, FileBarChart,
=======
  UserPlus, Bell, Wallet, TrendingUp, ChevronLeft, ChevronRight,
>>>>>>> 2116aaf6 (ui)
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);

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
<<<<<<< HEAD
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Dumbbell className="text-white" size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">GymWeb</h1>
            {gym && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{gym.name}</p>}
=======
    <aside 
      className={`
        bg-white border-r border-gray-200 min-h-screen flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2563EB] rounded-lg">
            <Dumbbell className="text-white" size={20} />
>>>>>>> 2116aaf6 (ui)
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-gray-900">GymWeb</h1>
              {gym && <p className="text-xs text-gray-500 truncate">{gym.name}</p>}
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
<<<<<<< HEAD
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
=======
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2563EB]/10 text-[#2563EB] shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
>>>>>>> 2116aaf6 (ui)
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

<<<<<<< HEAD
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
=======
      <div className="p-3 border-t border-gray-100">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="font-medium text-sm text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        )}
        <button 
          onClick={handleLogout} 
          className={`
            flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
            text-red-600 hover:bg-red-50
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
>>>>>>> 2116aaf6 (ui)
        </button>
      </div>
    </aside>
  );
}
