import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Trophy, Star, Zap, Users, Crown, Medal, Award, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  aPoints: number;
  totalConnections: number;
  avatarUrl?: string;
}

interface UserStats {
  user: {
    id: string;
    username: string;
    displayName: string;
    aPoints: number;
    totalConnections: number;
    memberSince: string;
    connectionsThisWeek: number;
  };
  recentTransactions: Array<{
    id: string;
    points_change: number;
    transaction_type: string;
    description: string;
    created_at: string;
  }>;
  achievements: Array<{
    id: string;
    achievement_type: string;
    achievement_name: string;
    achievement_description: string;
    points_awarded: number;
    unlocked_at: string;
  }>;
  stats: {
    rank: number;
    pointsThisWeek: number;
  };
}

interface Connection {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  connectionType: string;
  pointsAwarded: number;
  connectedAt: string;
}

export default function APointsLeaderboard() {
  const { user, sessionToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserStats();
      fetchConnections();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/apoints/leaderboard?limit=20');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/apoints/stats/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchConnections = async () => {
    if (!user || !sessionToken) return;
    
    try {
      const response = await fetch(`/api/apoints/connections/${user.id}?sessionToken=${sessionToken}`);
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'daily_bonus':
        return <Calendar className="w-4 h-4 text-green-500" />;
      default:
        return <Star className="w-4 h-4 text-purple-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 relative overflow-hidden">
      {/* Glass Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-700"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
          A-Points Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-sm border border-white/20">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
              disabled={!user}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              My Stats
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/70 transition-all duration-300"
              disabled={!user}
            >
              <Users className="w-4 h-4 mr-2" />
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4 mt-6">
            <div className="space-y-3">
              {leaderboard.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-300/20' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(item.rank)}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatarUrl} alt={item.displayName} />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {item.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.displayName}</p>
                    <p className="text-white/60 text-sm">@{item.username}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Zap className="w-4 h-4" />
                      {item.aPoints}
                    </div>
                    <div className="text-white/60 text-xs">
                      {item.totalConnections} connections
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-6">
            {userStats ? (
              <div className="space-y-4">
                {/* User Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">{userStats.user.aPoints}</span>
                    </div>
                    <p className="text-white/60 text-sm">Total A-Points</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-300/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{userStats.user.totalConnections}</span>
                    </div>
                    <p className="text-white/60 text-sm">Connections</p>
                  </div>
                </div>

                {/* Weekly Stats */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">This Week</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-green-400 font-bold">+{userStats.stats.pointsThisWeek}</div>
                      <div className="text-white/60 text-sm">A-Points Earned</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{userStats.user.connectionsThisWeek}</div>
                      <div className="text-white/60 text-sm">New Connections</div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h4 className="text-white font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {userStats.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{transaction.description}</p>
                          <p className="text-white/60 text-xs">{formatDate(transaction.created_at)}</p>
                        </div>
                        <div className={`font-bold text-sm ${
                          transaction.points_change > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.points_change > 0 ? '+' : ''}{transaction.points_change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                {userStats.achievements.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Achievements</h4>
                    <div className="space-y-2">
                      {userStats.achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-300/20 rounded">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <div className="flex-1">
                            <p className="text-white font-medium">{achievement.achievement_name}</p>
                            <p className="text-white/60 text-sm">{achievement.achievement_description}</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-200">
                            +{achievement.points_awarded}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white/60">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Log in to view your stats</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 mt-6">
            {connections.length > 0 ? (
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={connection.user.avatarUrl} alt={connection.user.displayName} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {connection.user.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{connection.user.displayName}</p>
                      <p className="text-white/60 text-sm">@{connection.user.username}</p>
                    </div>

                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-200 mb-1">
                        +{connection.pointsAwarded} A-Points
                      </Badge>
                      <p className="text-white/60 text-xs">{formatDate(connection.connectedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No connections yet</p>
                <p className="text-sm">Start scanning QR codes to build your network!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
