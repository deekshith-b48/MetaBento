import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// If using Next.js, replace with useRouter

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  fallback,
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, isLoading, onboardingRequired, loginWithWallet, loginWithEmail, mode, setMode } = useAuth();
  const navigate = typeof useNavigate !== 'undefined' ? useNavigate() : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If onboarding is required, redirect to onboarding wizard
  useEffect(() => {
    if (user && onboardingRequired && navigate) {
      navigate('/onboarding');
    }
  }, [user, onboardingRequired, navigate]);

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-8 max-w-md w-full mx-4">
          <CardContent className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
              <p className="text-gray-300">Choose a login method to continue:</p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                variant="glass"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full flex items-center justify-center gap-2"
                onClick={loginWithWallet}
              >
                <Wallet className="w-5 h-5" /> Login with Wallet
              </Button>
              <Button
                variant="glass"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-full flex items-center justify-center gap-2"
                onClick={loginWithEmail}
              >
                <Mail className="w-5 h-5" /> Login with Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mode toggle (Professional/Casual) - show if user is logged in
  // This can be moved to a global header/sidebar, but shown here for demo
  const handleModeToggle = () => {
    setMode(mode === 'professional' ? 'casual' : 'professional');
  };

  // Render children if authenticated or auth not required
  return (
    <div className="relative">
      {user && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <span className="text-xs text-white bg-black/30 px-2 py-1 rounded-full">
            Mode: <b>{mode === 'professional' ? 'Professional' : 'Casual'}</b>
          </span>
          <Button
            size="sm"
            variant="glass"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            onClick={handleModeToggle}
          >
            Toggle Mode
          </Button>
        </div>
      )}
      {/* Render children (profile, grid, etc.) */}
      {children}
    </div>
  );
}
