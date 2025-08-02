import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle, 
  Award, 
  Zap, 
  Users, 
  Star,
  Coins,
  TrendingUp,
  Gift,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface QRScannerEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedUser {
  id: string;
  username: string;
  displayName: string;
  auraPoints: number;
  connections: number;
  rank: number;
  avatarUrl?: string;
}

interface ConnectionResult {
  success: boolean;
  connection: {
    id: string;
    pointsAwarded: number;
    scannerPoints: number;
    referrerPoints: number;
  };
  message: string;
}

export default function QRScannerEnhanced({ isOpen, onClose }: QRScannerEnhancedProps) {
  const { user, sessionToken } = useAuth();
  const [step, setStep] = useState<'scan' | 'confirm' | 'success'>('scan');
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep('scan');
    setScannedUser(null);
    setConnectionResult(null);
    setIsProcessing(false);
    onClose();
  };

  // Mock QR code scanning - In production, integrate with a real QR scanner library
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Simulate QR code processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, extract user ID from QR code data
      // For demo, we'll create mock data
      const mockUserId = 'user-' + Math.random().toString(36).substr(2, 9);
      
      // Mock getting user profile from QR code data
      const mockUser: ScannedUser = {
        id: mockUserId,
        username: 'deekshith',
        displayName: 'Deekshith B',
        auraPoints: 2840,
        connections: 89,
        rank: 3,
        avatarUrl: undefined
      };
      
      setScannedUser(mockUser);
      setStep('confirm');
      toast.success('QR code scanned successfully!');
      
    } catch (error) {
      console.error('QR scan failed:', error);
      toast.error('Failed to scan QR code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnect = async () => {
    if (!user || !sessionToken || !scannedUser) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/aurapoints/qr-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannerId: user.id,
          referrerId: scannedUser.id,
          sessionToken
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setConnectionResult(data);
        setStep('success');
        toast.success(data.message);
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraClick = () => {
    // In production, open camera for live QR scanning
    toast.info('Camera QR scanning coming soon! Please use image upload for now.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-lg border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-purple-400" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        {step === 'scan' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect & Earn Aura Points</h3>
              <p className="text-white/70 text-sm">
                Scan someone's QR code to connect and both of you will earn 10 Aura Points!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCameraClick}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 h-20 flex-col gap-2"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Camera</span>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 h-20 flex-col gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
                <span className="text-sm">Upload Image</span>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Rewards Info */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-300/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h4 className="text-white font-semibold">Referral Rewards</h4>
                    <p className="text-white/70 text-sm">Both you and the person you connect with earn 10 Aura Points!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'confirm' && scannedUser && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">QR Code Detected!</h3>
              <p className="text-white/70 text-sm">
                Confirm connection with this user
              </p>
            </div>

            {/* User Profile Card */}
            <Card className="bg-black/30 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{scannedUser.displayName}</h4>
                    <p className="text-white/60 text-sm">@{scannedUser.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold">
                      <Award className="w-4 h-4" />
                      {scannedUser.auraPoints.toLocaleString()}
                    </div>
                    <div className="text-white/60 text-xs">Aura Points</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
                      <Users className="w-4 h-4" />
                      {scannedUser.connections}
                    </div>
                    <div className="text-white/60 text-xs">Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-400 font-bold">
                      <TrendingUp className="w-4 h-4" />
                      #{scannedUser.rank}
                    </div>
                    <div className="text-white/60 text-xs">Rank</div>
                  </div>
                </div>

                {/* Connection Reward Preview */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-300/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-300" />
                      <span className="text-white text-sm">Connection Reward</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Award className="w-4 h-4" />
                      +10 AP each
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('scan')}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Connect & Earn
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && connectionResult && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-white animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Connection Successful!</h3>
              <p className="text-white/70">
                {connectionResult.message}
              </p>
            </div>

            {/* Rewards Summary */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-300/20">
              <CardContent className="p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Aura Points Awarded
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <div className="text-white font-semibold">You Earned</div>
                    <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                      <Award className="w-5 h-5" />
                      +{connectionResult.connection.pointsAwarded}
                    </div>
                    <div className="text-white/60 text-sm">Total: {connectionResult.connection.scannerPoints}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <div className="text-white font-semibold">They Earned</div>
                    <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                      <Award className="w-5 h-5" />
                      +{connectionResult.connection.pointsAwarded}
                    </div>
                    <div className="text-white/60 text-sm">Total: {connectionResult.connection.referrerPoints}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Awesome!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
