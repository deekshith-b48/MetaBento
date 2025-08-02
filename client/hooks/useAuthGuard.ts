import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Hook to protect routes that require authentication
export function useRequireAuth(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Please connect your wallet to access this page');
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { user, isLoading, isAuthenticated: !!user };
}

// Hook to redirect authenticated users away from auth pages
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  return { user, isLoading, isAuthenticated: !!user };
}

// Hook to check if user owns a specific wallet
export function useWalletOwnership(walletAddress?: string) {
  const { user } = useAuth();
  
  const isOwner = user && walletAddress 
    ? user.wallet_address.toLowerCase() === walletAddress.toLowerCase()
    : false;

  return { isOwner, user };
}

// Hook to check if user can edit a profile
export function useCanEditProfile(profileWallet?: string) {
  const { user } = useAuth();
  
  const canEdit = user && profileWallet
    ? user.wallet_address.toLowerCase() === profileWallet.toLowerCase()
    : false;

  return { canEdit, user };
}
