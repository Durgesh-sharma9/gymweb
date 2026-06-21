import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { getDashboardPath } from './utils/helpers';

import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';

import Landing from './pages/public/Landing';
import Signup from './pages/public/Signup';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import VerifyEmail from './pages/public/VerifyEmail';

import SuperAdminDashboard from './pages/super-admin/Dashboard';
import GymOwners from './pages/super-admin/GymOwners';
import Gyms from './pages/super-admin/Gyms';
import PlatformPlans from './pages/super-admin/PlatformPlans';
import GymDetails from './pages/super-admin/GymDetails';
import SubscriptionRequests from './pages/super-admin/SubscriptionRequests';
import Revenue from './pages/super-admin/Revenue';
import Templates from './pages/super-admin/Templates';
import SuperAdminSettings from './pages/super-admin/Settings';
import ExportCenter from './pages/super-admin/ExportCenter';

import OwnerDashboard from './pages/gym-owner/Dashboard';
import Members from './pages/gym-owner/Members';
import MemberDetail from './pages/gym-owner/MemberDetail';
import Plans from './pages/gym-owner/Plans';
import Trainers from './pages/gym-owner/Trainers';
import Payments from './pages/gym-owner/Payments';
import Expenses from './pages/gym-owner/Expenses';
import Settings from './pages/gym-owner/Settings';
import Registrations from './pages/gym-owner/Registrations';
import Announcements from './pages/gym-owner/Announcements';
import ActivityLogs from './pages/gym-owner/ActivityLogs';

import TrainerDashboard from './pages/trainer/Dashboard';

import PublicRegister from './pages/public/Register';
import PublicInvoice from './pages/public/PublicInvoice';

import OnboardingWizard from './pages/gym-owner/OnboardingWizard';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  
  if (user.role === 'gym_owner' && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute roles={['gym_owner']}><OnboardingWizard /></ProtectedRoute>} />

      {/* Public */}
      <Route path="/register/:gymSlug" element={<PublicRegister />} />
      <Route path="/invoice/:token" element={<PublicInvoice />} />

      {/* Super Admin */}
      <Route path="/super-admin/dashboard" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/super-admin/gym-owners" element={<ProtectedRoute roles={['super_admin']}><GymOwners /></ProtectedRoute>} />
      <Route path="/super-admin/gyms" element={<ProtectedRoute roles={['super_admin']}><Gyms /></ProtectedRoute>} />
      <Route path="/super-admin/gyms/:id" element={<ProtectedRoute roles={['super_admin']}><GymDetails /></ProtectedRoute>} />
      <Route path="/super-admin/plans" element={<ProtectedRoute roles={['super_admin']}><PlatformPlans /></ProtectedRoute>} />
      <Route path="/super-admin/subscription-requests" element={<ProtectedRoute roles={['super_admin']}><SubscriptionRequests /></ProtectedRoute>} />
      <Route path="/super-admin/revenue" element={<ProtectedRoute roles={['super_admin']}><Revenue /></ProtectedRoute>} />
      <Route path="/super-admin/templates" element={<ProtectedRoute roles={['super_admin']}><Templates /></ProtectedRoute>} />
      <Route path="/super-admin/settings" element={<ProtectedRoute roles={['super_admin']}><SuperAdminSettings /></ProtectedRoute>} />
      <Route path="/super-admin/export" element={<ProtectedRoute roles={['super_admin']}><ExportCenter /></ProtectedRoute>} />

      {/* Gym Owner */}
      <Route path="/gym/dashboard" element={<ProtectedRoute roles={['gym_owner']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/gym/members" element={<ProtectedRoute roles={['gym_owner', 'trainer']}><Members /></ProtectedRoute>} />
      <Route path="/gym/members/:id" element={<ProtectedRoute roles={['gym_owner', 'trainer']}><MemberDetail /></ProtectedRoute>} />
      <Route path="/gym/plans" element={<ProtectedRoute roles={['gym_owner']}><Plans /></ProtectedRoute>} />
      <Route path="/gym/trainers" element={<ProtectedRoute roles={['gym_owner']}><Trainers /></ProtectedRoute>} />
      <Route path="/gym/payments" element={<ProtectedRoute roles={['gym_owner']}><Payments /></ProtectedRoute>} />
      <Route path="/gym/expenses" element={<ProtectedRoute roles={['gym_owner']}><Expenses /></ProtectedRoute>} />
      <Route path="/gym/settings" element={<ProtectedRoute roles={['gym_owner']}><Settings /></ProtectedRoute>} />
      <Route path="/gym/registrations" element={<ProtectedRoute roles={['gym_owner', 'trainer']}><Registrations /></ProtectedRoute>} />
      <Route path="/gym/announcements" element={<ProtectedRoute roles={['gym_owner']}><Announcements /></ProtectedRoute>} />
      <Route path="/gym/activity-logs" element={<ProtectedRoute roles={['gym_owner']}><ActivityLogs /></ProtectedRoute>} />

      {/* Trainer */}
      <Route path="/trainer/dashboard" element={<ProtectedRoute roles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/trainer/members" element={<ProtectedRoute roles={['trainer']}><Members /></ProtectedRoute>} />
      <Route path="/trainer/registrations" element={<ProtectedRoute roles={['trainer']}><Registrations /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
