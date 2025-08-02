import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // Mock wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setAddress(mockAddress);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    toast.success('Wallet disconnected');
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={disconnectWallet}
        variant="outline"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
