import { useState, useEffect } from 'react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface WagmiWalletConnectProps {
  onSuccess?: () => void;
}

export default function WagmiWalletConnect({ onSuccess }: WagmiWalletConnectProps) {
  const { login } = useAuth();
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { signMessage, isPending: isSigningPending } = useSignMessage();
  const { disconnect } = useDisconnect();
  
  const [step, setStep] = useState<'connect' | 'sign' | 'setup'>('connect');
  const [nonce, setNonce] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile setup state for new users
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Handle wallet connection state changes
  useEffect(() => {
    if (isConnected && address && step === 'connect') {
      handleWalletConnected();
    }
  }, [isConnected, address, step]);

  const handleWalletConnected = async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      // Check if wallet exists in database
      const checkResponse = await fetch('/api/auth/check-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData?.error || 'Failed to check wallet status');
      }

      if (checkData.exists) {
        // Existing user - proceed to signature
        await generateNonceAndSign();
      } else {
        // New user - show profile setup
        setStep('setup');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process wallet connection');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNonceAndSign = async () => {
    try {
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const nonceData = await nonceResponse.json();

      if (!nonceResponse.ok) {
        throw new Error(nonceData?.error || 'Failed to generate authentication nonce');
      }

      setNonce(nonceData.nonce);
      setMessage(nonceData.message);
      setStep('sign');
    } catch (error) {
      console.error('Nonce generation failed:', error);
      toast.error('Failed to generate authentication challenge');
    }
  };

  const handleSignMessage = async () => {
    if (!address || !message) return;

    try {
      const signature = await signMessage({ message });

      const loginResponse = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: address, 
          signature, 
          nonce 
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData?.error || 'Authentication failed');
      }

      await login(loginData.sessionToken);
      toast.success('Successfully authenticated!');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Authentication failed:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !displayName || !address) {
      toast.error('Username and display name are required');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/wallet-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          username,
          displayName,
          email: email || undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Profile creation failed');
      }

      toast.success('Profile created! Please sign to complete authentication.');
      await generateNonceAndSign();
    } catch (error) {
      console.error('Profile setup failed:', error);
      toast.error(error instanceof Error ? error.message : 'Profile setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectorClick = (connector: any) => {
    connect({ connector });
  };

  const handleSwitchWallet = () => {
    disconnect();
    setStep('connect');
  };

  // Connect Step
  if (step === 'connect') {
    return (
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative overflow-hidden">
        {/* Glass Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl animate-pulse delay-700"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-white text-center flex items-center gap-2 justify-center">
            <Wallet className="w-5 h-5 text-purple-400 animate-pulse" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {isConnected && address ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Wallet Connected</p>
                <p className="text-sm text-white/70 font-mono break-all bg-black/20 rounded-lg px-3 py-2">
                  {address}
                </p>
                <Badge className="mt-2 bg-green-500/20 text-green-200">
                  {connector?.name} Connected
                </Badge>
              </div>
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-white/70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Choose a Wallet</h3>
                <p className="text-white/70 text-sm">
                  Connect with your preferred Web3 wallet to continue
                </p>
              </div>

              <div className="space-y-3">
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => handleConnectorClick(connector)}
                    disabled={isPending}
                    className="w-full justify-start bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{connector.name}</div>
                        <div className="text-xs text-white/60">
                          {connector.type === 'injected' && 'Browser Extension'}
                          {connector.type === 'walletConnect' && 'Mobile & Desktop'}
                          {connector.name.includes('MetaMask') && 'Most Popular'}
                        </div>
                      </div>
                    </div>
                    {isPending && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                  </Button>
                ))}
              </div>

              <div className="text-center text-xs text-white/60">
                <div className="flex items-center justify-center gap-1">
                  <span>Powered by</span>
                  <span className="text-purple-300">Wagmi</span>
                  <span>&</span>
                  <span className="text-purple-300">RainbowKit</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Sign Message Step
  if (step === 'sign') {
    return (
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-400/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-white text-center flex items-center gap-2 justify-center">
            <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
            Sign Authentication Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <CheckCircle className="w-10 h-10 text-white animate-pulse" />
            </div>
            <p className="text-white font-semibold mb-2">Wallet Connected via {connector?.name}</p>
            <p className="text-sm text-white/70 font-mono break-all bg-black/20 rounded-lg px-3 py-2">{address}</p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <p className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignMessage}
              disabled={isSigningPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isSigningPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing Message...
                </div>
              ) : (
                'Sign Message to Complete Login'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSwitchWallet}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Switch Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Profile Setup Step
  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-white text-center flex items-center gap-2 justify-center">
            <Wallet className="w-5 h-5 text-purple-400 animate-pulse" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <form onSubmit={handleProfileSetup} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-300 font-mono break-all bg-black/20 rounded-lg px-3 py-2">
                {address}
              </p>
            </div>

            <div>
              <label htmlFor="username" className="block text-white font-medium mb-2">
                Username *
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-white font-medium mb-2">
                Display Name *
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Display Name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email (Optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Profile...
                  </div>
                ) : (
                  'Create Profile'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSwitchWallet}
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Switch Wallet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
}
