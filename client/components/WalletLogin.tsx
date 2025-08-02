import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ethers } from 'ethers';

interface WalletLoginProps {
  onSuccess?: () => void;
  showPasswordOption?: boolean;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletLogin({ onSuccess, showPasswordOption = true }: WalletLoginProps) {
  const { login } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [step, setStep] = useState<'connect' | 'sign' | 'password'>('connect');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [nonce, setNonce] = useState('');
  const [message, setMessage] = useState('');

  // Connect wallet (MetaMask or any injected wallet)
  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Generate nonce for signature
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!nonceResponse.ok) {
        throw new Error('Failed to generate authentication nonce');
      }

      const nonceData = await nonceResponse.json();
      setNonce(nonceData.nonce);
      setMessage(nonceData.message);
      setStep('sign');

      toast.success('Wallet connected! Please sign the message to authenticate.');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Sign message for authentication
  const signMessage = async () => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        throw new Error('Wallet not available');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();

      // Sign the message
      const signature = await signer.signMessage(message);

      // Send to backend for verification
      const loginResponse = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          nonce,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Authentication failed');
      }

      const loginData = await loginResponse.json();

      // Login with session token
      await login(loginData.sessionToken);

      if (onSuccess) {
        onSuccess();
      }

      toast.success(loginData.isNewUser ? 'Welcome to MetaBento!' : 'Welcome back!');
    } catch (error) {
      console.error('Message signing failed:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsConnecting(false);
    }
  };

  // Password-based login
  const passwordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress || !password) {
      toast.error('Please enter both wallet address and password');
      return;
    }

    try {
      setIsConnecting(true);

      const response = await fetch('/api/auth/password-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const loginData = await response.json();
      await login(loginData.sessionToken);

      if (onSuccess) {
        onSuccess();
      }

      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Password login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  if (step === 'sign') {
    return (
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center">Sign Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white mb-2">Wallet Connected</p>
            <p className="text-sm text-gray-300 font-mono break-all">{walletAddress}</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-white text-sm whitespace-pre-wrap">{message}</p>
          </div>

          <Button
            onClick={signMessage}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing...
              </div>
            ) : (
              'Sign Message to Login'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setStep('connect')}
            className="w-full text-white hover:text-purple-300 hover:bg-white/10"
          >
            Back to Connect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center">Connect to MetaBento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showPasswordLogin ? (
          // Wallet Connection
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 text-sm">
                Securely connect using your Monad wallet or any Web3 wallet
              </p>
            </div>

            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </div>
              )}
            </Button>

            {showPasswordOption && (
              <>
                <Separator className="bg-white/20" />
                
                <Button
                  variant="ghost"
                  onClick={() => setShowPasswordLogin(true)}
                  className="w-full text-white hover:text-purple-300 hover:bg-white/10"
                >
                  Login with Wallet + Password
                </Button>
              </>
            )}
          </>
        ) : (
          // Password Login Form
          <form onSubmit={passwordLogin} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Wallet + Password Login</h3>
              <p className="text-gray-300 text-sm">
                Enter your wallet address and password
              </p>
            </div>

            <div>
              <Label htmlFor="wallet" className="text-white">Wallet Address</Label>
              <Input
                id="wallet"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
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

            <Button
              type="submit"
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPasswordLogin(false)}
              className="w-full text-white hover:text-purple-300 hover:bg-white/10"
            >
              Back to Wallet Connect
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
