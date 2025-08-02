import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  History,
  Calculator,
  Wallet,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserPoints {
  auraPoints: number;
  connections: number;
  rank: number;
}

interface SwapHistory {
  id: string;
  points_swapped: number;
  token_amount: number;
  status: string;
  created_at: string;
  exchange_rate: number;
}

export default function TokenSwap() {
  const { user, sessionToken } = useAuth();
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [swapHistory, setSwapHistory] = useState<SwapHistory[]>([]);
  const [pointsToSwap, setPointsToSwap] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'swap' | 'history'>('swap');

  const EXCHANGE_RATE = 100; // 100 Aura Points = 1 MONAD
  const MIN_SWAP = 100; // Minimum 100 points to swap

  useEffect(() => {
    if (!user || !sessionToken) {
      navigate('/');
      return;
    }
    
    loadUserData();
    loadSwapHistory();
  }, [user, sessionToken]);

  const loadUserData = async () => {
    if (!user || !sessionToken) return;

    try {
      const response = await fetch('/api/aurapoints/user-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sessionToken }),
      });

      const data = await response.json();
      if (data.success) {
        setUserPoints({
          auraPoints: data.user.auraPoints,
          connections: data.user.connections,
          rank: data.user.rank
        });
      }
    } catch (error) {
      console.error('Failed to load user points:', error);
    }
  };

  const loadSwapHistory = async () => {
    if (!user || !sessionToken) return;

    try {
      const response = await fetch('/api/aurapoints/swap-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sessionToken }),
      });

      const data = await response.json();
      if (data.success) {
        setSwapHistory(data.swaps);
      }
    } catch (error) {
      console.error('Failed to load swap history:', error);
    }
  };

  const handleSwap = async () => {
    if (!user || !sessionToken || !pointsToSwap) return;

    const points = parseInt(pointsToSwap);
    if (isNaN(points) || points < MIN_SWAP) {
      toast.error(`Minimum swap is ${MIN_SWAP} Aura Points`);
      return;
    }

    if (!userPoints || points > userPoints.auraPoints) {
      toast.error('Insufficient Aura Points');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/aurapoints/swap-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pointsToSwap: points,
          sessionToken
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setPointsToSwap('');
        loadUserData();
        loadSwapHistory();
      } else {
        throw new Error(data.error || 'Swap failed');
      }
    } catch (error) {
      console.error('Token swap failed:', error);
      toast.error(error instanceof Error ? error.message : 'Swap failed');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTokens = (points: string) => {
    const p = parseInt(points);
    return isNaN(p) ? 0 : p / EXCHANGE_RATE;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-300"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-300"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300">{status}</Badge>;
    }
  };

  if (!userPoints) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Aura Points Token Swap
          </h1>
          <p className="text-white/70 text-lg">
            Exchange your Aura Points for Monad tokens
          </p>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{userPoints.auraPoints.toLocaleString()}</div>
              <div className="text-white/60">Aura Points</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">#{userPoints.rank}</div>
              <div className="text-white/60">Global Rank</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{userPoints.connections}</div>
              <div className="text-white/60">Connections</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Token Swap Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                Swap Aura Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Exchange Rate Info */}
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-300/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-300" />
                    <span className="text-white font-medium">Exchange Rate</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{EXCHANGE_RATE} AP = 1 MONAD</div>
                    <div className="text-white/60 text-xs">Minimum: {MIN_SWAP} AP</div>
                  </div>
                </div>
              </div>

              {/* Swap Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="points" className="text-white">Aura Points to Swap</Label>
                  <Input
                    id="points"
                    type="number"
                    min={MIN_SWAP}
                    max={userPoints.auraPoints}
                    value={pointsToSwap}
                    onChange={(e) => setPointsToSwap(e.target.value)}
                    placeholder={`Minimum ${MIN_SWAP} points`}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                {/* Conversion Preview */}
                {pointsToSwap && (
                  <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-white">{parseInt(pointsToSwap).toLocaleString()} AP</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60" />
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold">{calculateTokens(pointsToSwap).toFixed(2)} MONAD</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSwap}
                  disabled={isLoading || !pointsToSwap || parseInt(pointsToSwap) < MIN_SWAP}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Swap...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Swap for MONAD
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Swap History */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="w-6 h-6 text-blue-400" />
                Swap History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {swapHistory.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No swaps yet</p>
                  <p className="text-sm">Start by swapping some Aura Points!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {swapHistory.map((swap) => (
                    <div key={swap.id} className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{swap.points_swapped} AP</span>
                          <ArrowRight className="w-4 h-4 text-white/60" />
                          <span className="text-green-400 font-bold">{swap.token_amount} MONAD</span>
                        </div>
                        {getStatusBadge(swap.status)}
                      </div>
                      <div className="text-white/60 text-xs">
                        {new Date(swap.created_at).toLocaleDateString()} at {new Date(swap.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-300/20 mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">How Token Swaps Work</h3>
            <div className="grid md:grid-cols-2 gap-6 text-white/70">
              <div>
                <h4 className="text-white font-semibold mb-2">Exchange Process</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 100 Aura Points = 1 MONAD token</li>
                  <li>• Minimum swap: 100 Aura Points</li>
                  <li>• Tokens distributed to your wallet address</li>
                  <li>• Processing time: 1-3 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Earning Points</h4>
                <ul className="space-y-1 text-sm">
                  <li>• QR connections: 10 points each (both parties)</li>
                  <li>• Achievements: 50-200 points</li>
                  <li>• Daily activities: Variable rewards</li>
                  <li>• Special events: Bonus multipliers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
