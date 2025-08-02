import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Upload, Scan, CheckCircle, Gift, Zap, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedUser {
  id: string;
  username: string;
  displayName: string;
  aPoints: number;
  totalConnections: number;
  avatarUrl?: string;
}

export default function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const { user, sessionToken } = useAuth();
  const [step, setStep] = useState<'scan' | 'confirm' | 'success'>('scan');
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock QR code scanning (in production, use a real QR scanner library)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Mock QR decoding - in production, use qr-scanner or similar library
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock scanned user data
      const mockUser: ScannedUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        username: 'sarah_dev',
        displayName: 'Sarah Chen',
        aPoints: 350,
        totalConnections: 15,
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
    if (!user || !scannedUser || !sessionToken) {
      toast.error('Authentication required');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/apoints/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: scannedUser.id,
          connectionType: 'qr_scan',
          sessionToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection failed');
      }

      const result = await response.json();
      setConnectionResult(result);
      setStep('success');
      
      toast.success(`Connected! You both earned ${result.pointsAwarded} A-Points!`);
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setStep('scan');
    setScannedUser(null);
    setConnectionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  if (step === 'success' && connectionResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Connection Successful!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 text-center">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Connection Summary */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Connected with {scannedUser?.displayName}!
              </h3>
              <p className="text-muted-foreground">
                You're now part of each other's professional network
              </p>
            </div>

            {/* A-Points Reward */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-purple-300">A-Points Earned!</span>
                </div>
                <div className="text-2xl font-bold text-purple-200">
                  +{connectionResult.pointsAwarded} A-Points
                </div>
                <p className="text-xs text-purple-300 mt-1">
                  Both users received this reward
                </p>
              </CardContent>
            </Card>

            {/* Updated Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {connectionResult.fromUser.newPoints}
                </div>
                <div className="text-xs text-muted-foreground">Your A-Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {connectionResult.fromUser.newConnections}
                </div>
                <div className="text-xs text-muted-foreground">Your Connections</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button 
                onClick={resetScanner}
                variant="outline" 
                className="w-full"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan Another QR
              </Button>
              
              <Button 
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'confirm' && scannedUser) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Connection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Scanned User Profile */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                {scannedUser.avatarUrl ? (
                  <img src={scannedUser.avatarUrl} alt={scannedUser.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {scannedUser.displayName.charAt(0)}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground">
                {scannedUser.displayName}
              </h3>
              <p className="text-muted-foreground">@{scannedUser.username}</p>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-foreground">{scannedUser.aPoints}</span>
                </div>
                <div className="text-xs text-muted-foreground">A-Points</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-foreground">{scannedUser.totalConnections}</span>
                </div>
                <div className="text-xs text-muted-foreground">Connections</div>
              </div>
            </div>

            {/* Reward Preview */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-300/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-green-300">Mutual Reward</span>
                </div>
                <div className="text-lg font-bold text-green-200">
                  +15 A-Points Each
                </div>
                <p className="text-xs text-green-300 mt-1">
                  QR scan bonus included
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleConnect}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    🤝 Connect Now
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full"
                disabled={isProcessing}
              >
                Scan Different QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center gap-2 justify-center">
            <Scan className="w-5 h-5 text-purple-400" />
            Scan QR to Connect
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Connect & Earn A-Points
            </h3>
            <p className="text-muted-foreground text-sm">
              Scan another user's QR code to connect and both earn A-Points rewards
            </p>
          </div>

          {/* Rewards Info */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-300/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-300">Rewards</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-200">QR Scan:</span>
                  <span className="text-yellow-100">+15 A-Points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-200">First Connection:</span>
                  <span className="text-yellow-100">+25 A-Points</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scanner Actions */}
          <div className="space-y-3">
            {/* Camera Scanner (Future Implementation) */}
            <Button
              variant="outline"
              className="w-full"
              disabled
            >
              <Camera className="w-4 h-4 mr-2" />
              📷 Scan with Camera (Coming Soon)
            </Button>

            {/* File Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    📁 Upload QR Image
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* User Stats Preview */}
          {user && (
            <div className="border-t pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Your Current Stats</p>
                <div className="flex justify-center gap-4">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                    <Zap className="w-3 h-3 mr-1" />
                    {user.a_points || 100} A-Points
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    <Users className="w-3 h-3 mr-1" />
                    {user.total_connections || 0} Connections
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
