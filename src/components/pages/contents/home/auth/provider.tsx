import { createContext, useContext } from 'react';
import { GoogleUserInfo } from '@/base/types/auth/google-oauth.types';
import { useGoogleOAuth } from '@/base/hooks/auth/use-google-oauth';

interface AuthContextType {
  user: GoogleUserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (roomId?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userInfo, isAuthenticated, isLoading, signInWithGoogle, signOut } = useGoogleOAuth();

  const value = {
    user: userInfo,
    isAuthenticated,
    isLoading,
    signIn: signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};