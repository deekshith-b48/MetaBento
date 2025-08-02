import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Users, Zap, QrCode, Globe } from 'lucide-react';

export default function Index() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Mock wallet connection - in production use wagmi or ethers.js
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      localStorage.setItem('walletAddress', mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-web3-900 via-purple-900 to-web3-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-lg border border-web3-300/20 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Connected!</h2>
              <p className="text-muted-foreground text-sm break-all">
                {walletAddress}
              </p>
            </div>
            <Link to="/profile" className="block">
              <Button className="w-full bg-gradient-to-r from-web3-500 to-web3-600 hover:from-web3-600 hover:to-web3-700 text-white font-semibold py-3">
                Setup Your Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-web3-900 via-purple-900 to-web3-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Branding */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-r from-neon-cyan via-web3-500 to-neon-purple rounded-full p-1">
              <div className="flex items-center justify-center w-full h-full bg-web3-900 rounded-full">
                <Globe className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-web3-200 to-neon-cyan bg-clip-text text-transparent mb-4">
              MetaBento
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Your Gateway to Web3 Networking
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-cyan to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Wallet-First</h3>
              <p className="text-white/70 text-sm">Connect with your Web3 identity</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-purple to-pink-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">QR Connect</h3>
              <p className="text-white/70 text-sm">Scan to instantly network</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-green to-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Earn XP</h3>
              <p className="text-white/70 text-sm">Build your network reputation</p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-4">
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-web3-500 to-web3-600 hover:from-web3-600 hover:to-web3-700 text-white font-bold py-4 px-8 text-lg rounded-full shadow-2xl shadow-web3-500/25 transition-all duration-300 hover:scale-105 hover:shadow-web3-500/40"
            >
              {isConnecting ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  🔐 Connect Wallet
                </div>
              )}
            </Button>
            <p className="text-white/60 text-sm">
              Supports MetaMask, WalletConnect & Monad Testnet
            </p>
          </div>

          {/* Network Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1.2K+</div>
              <div className="text-white/60 text-sm">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5.8K+</div>
              <div className="text-white/60 text-sm">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-web3-300">15K+</div>
              <div className="text-white/60 text-sm">XP Earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
