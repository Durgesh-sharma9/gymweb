import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/helpers';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('gym_owner');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate(getDashboardPath(user.role));
      }
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-900 dark:to-gray-950 p-4">
      <div className="card w-full max-w-md p-8 dark:bg-gray-900 dark:border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary-600 flex items-center justify-center">
            <Dumbbell className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GymWeb</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gym Management Platform</p>
        </div>

        <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('gym_owner')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'gym_owner' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Gym Owner
          </button>
          <button
            type="button"
            onClick={() => setLoginType('trainer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'trainer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Trainer / Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder={loginType === 'gym_owner' ? 'owner@gym.com' : 'trainer@gym.com'}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : `Sign In as ${loginType === 'gym_owner' ? 'Gym Owner' : 'Trainer'}`}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary-600 hover:underline font-medium">
              Sign up for free trial
            </a>
          </p>
          <p className="text-sm text-gray-600">
            <a href="/" className="text-primary-600 hover:underline">
              Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
