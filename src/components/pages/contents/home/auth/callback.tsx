import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedBackground from '@/components/partials/background/Animated';
import { Video } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state'); // May contain roomId
        
        if (error) {
          setStatus('error');
          setErrorMessage('Google OAuth authorization was denied or failed');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received from Google');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Send the authorization code to your backend
        const response = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            code,
            state,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          
          // Store user information locally for session persistence
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isAuthenticated', 'true');
          }

          // Redirect based on whether there's a roomId in state
          setTimeout(() => {
            if (data.roomId) {
              navigate(`/room/${data.roomId}`);
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Authentication failed');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMessage('Failed to process authentication');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing Google authentication...';
      case 'success':
        return 'Authentication successful! Redirecting...';
      case 'error':
        return errorMessage || 'Authentication failed. Redirecting to home...';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              {/* Logo */}
              <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-orange-300 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8 text-white" />
              </div>

              {/* Status Indicator */}
              <div className="mb-6">
                {status === 'processing' && (
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                )}
                {status === 'success' && (
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-4 h-4 border-l-2 border-b-2 border-green-600 dark:border-green-400 rotate-[-45deg] translate-y-[-1px]"></div>
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-red-600 dark:text-red-400 text-lg font-bold">×</div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {status === 'processing' && 'Authenticating'}
                {status === 'success' && 'Welcome!'}
                {status === 'error' && 'Authentication Failed'}
              </h2>
              
              <p className={`text-sm ${getStatusColor()} mb-4`}>
                {getStatusMessage()}
              </p>

              {/* Additional Information */}
              {status === 'processing' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please wait while we complete your sign-in...
                </p>
              )}
              
              {status === 'success' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You'll be redirected shortly...
                </p>
              )}
              
              {status === 'error' && (
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Go to Home Page
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;