import { useState, useCallback, useEffect } from 'react';
import { GoogleUserInfo } from '@/base/types/auth/google-oauth.types';

export const useGoogleOAuth = () => {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First check localStorage for immediate UI updates
      const localUser = localStorage.getItem('user');
      const localAuth = localStorage.getItem('isAuthenticated');
      
      if (localUser && localAuth === 'true') {
        const userData = JSON.parse(localUser);
        setUserInfo(userData);
        setIsAuthenticated(true);
      }

      // Then verify with server - FIXED: Use correct backend URL
      const backendUrl = import.meta.env.VITE_APP_URL_CHAT_SOCKET;
      const response = await fetch(`${backendUrl}/api/auth/status`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUserInfo(data.user);
          setIsAuthenticated(true);
          // Store in localStorage for session persistence
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          // Clear localStorage if not authenticated
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          setUserInfo(null);
          setIsAuthenticated(false);
        }
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setUserInfo(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      setUserInfo(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback((roomId?: string) => {
    try {
      setError(null);
      
      // FIXED: Build the correct Google OAuth URL pointing to backend
      const backendUrl = import.meta.env.VITE_APP_URL_CHAT_SOCKET;
      let authUrl = `${backendUrl}/auth/google`;
      
      // Add roomId as query parameter if provided
      if (roomId) {
        authUrl += `?roomId=${encodeURIComponent(roomId)}`;
      }
      
      console.log('Redirecting to OAuth URL:', authUrl);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Google OAuth error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_APP_URL_CHAT_SOCKET;
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUserInfo(null);
      setIsAuthenticated(false);
      setError(null);
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      // Redirect to home
      window.location.href = '/';
    }
  }, []);

  return {
    userInfo,
    isAuthenticated,
    error,
    isLoading,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
  };
};