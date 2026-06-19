import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`/api/v1/auth/verify-email/${token}`);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          )}
          {status === 'success' && (
            <CheckCircle className="mx-auto text-green-600" size={64} />
          )}
          {status === 'error' && (
            <XCircle className="mx-auto text-red-600" size={64} />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="text-gray-600 mb-8">{message}</p>

        {status === 'success' && (
          <Link to="/login" className="btn-primary w-full">
            Proceed to Login
          </Link>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Link to="/login" className="btn-primary w-full block">
              Go to Login
            </Link>
            <p className="text-sm text-gray-500">
              Need help? <Link to="/contact" className="text-primary-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link to="/" className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600">
            <Dumbbell size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
