import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/helpers';

export default function ChangePassword() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const forced = user?.mustChangePassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: forced ? null : currentPassword,
        newPassword,
      });
      
      // Fetch fresh user data from backend
      const meRes = await api.get('/auth/me');
      const updatedUser = meRes.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Password changed');
      navigate(getDashboardPath(user.role));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-xl font-bold mb-2">{forced ? 'Set New Password' : 'Change Password'}</h1>
        {forced && <p className="text-sm text-gray-500 mb-6">You must change your password before continuing.</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!forced && (
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
