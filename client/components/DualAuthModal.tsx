import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wallet, Mail, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import WagmiWalletConnect from './WagmiWalletConnect';

interface DualAuthModalProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function DualAuthModal({ onSuccess }: DualAuthModalProps) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'email'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  
  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Email Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (isSignUp && (!username || !displayName)) {
      toast.error('Username and display name are required');
      return;
    }

    setIsLoading(true);
    
    try {
      const endpoint = isSignUp ? '/api/auth/email-signup' : '/api/auth/email-login';
      const body = isSignUp 
        ? { email, password, username, displayName }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data?.error || `HTTP ${response.status}: Authentication failed`);
      }

      if (!data.sessionToken) {
        throw new Error('No session token received from server');
      }

      await login(data.sessionToken);

      if (onSuccess) onSuccess();
      toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!');
    } catch (error) {
      console.error('Email auth failed:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Glass Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-white text-center flex items-center gap-2 justify-center">
          <Globe className="w-5 h-5 text-purple-400 animate-pulse" />
          Connect to MetaBento
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'wallet' | 'email')}>
          <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-sm border border-white/20">
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Monad Wallet
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4 mt-6">
            <WagmiWalletConnect onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h3>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your-username"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayName" className="text-white">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Display Name"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>

              <Separator className="bg-white/20" />

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-white hover:text-purple-300 hover:bg-white/10"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
