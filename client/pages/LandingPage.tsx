import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Globe,
  Zap,
  Users,
  QrCode,
  Sparkles,
  ArrowRight,
  Search,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Star,
  Trophy,
  Shield,
  Wallet,
  Mail,
  ToggleLeft,
  Grid3x3,
  Database,
  TrendingUp,
  BarChart3,
  Coins,
  Award
} from 'lucide-react';
import DualAuthModal from '@/components/DualAuthModal';
import ThreeBackground from '@/components/ThreeBackground';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const username = searchQuery.replace('@', '');
      window.location.href = `/${username}`;
    }
  };

  const featuredUsers = [
    {
      username: 'deekshith',
      name: 'Deekshith B',
      role: 'Web3 Developer',
      auraPoints: 2840,
      connections: 89,
      avatar: 'DB',
      tags: ['Solidity', 'React', 'DeFi']
    },
    {
      username: 'sarah',
      name: 'Sarah Chen',
      role: 'Smart Contract Auditor',
      auraPoints: 3200,
      connections: 124,
      avatar: 'SC',
      tags: ['Security', 'Audit', 'Web3']
    },
    {
      username: 'alex',
      name: 'Alex Rivera',
      role: 'NFT Artist & Creator',
      auraPoints: 2150,
      connections: 67,
      avatar: 'AR',
      tags: ['NFT', 'Art', 'Metaverse']
    }
  ];

  const stats = [
    { label: 'Active Users', value: '12.5K+', icon: Users },
    { label: 'Connections Made', value: '48.2K+', icon: QrCode },
    { label: 'A-Points Earned', value: '2.1M+', icon: Zap },
    { label: 'Countries', value: '95+', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Three.js Animated Background */}
      <ThreeBackground />

      {/* Navigation */}
      <nav className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              MetaBento
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1 text-white/70 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            
            {user ? (
              <Link to={`/${user.username}`}>
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                  My Profile
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm">Unified Identity Grid</span>
            <Badge className="bg-purple-500/20 text-purple-200 text-xs">Beta</Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              All your digital
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              identities. One smart profile.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Manage and present your professional & casual digital identities using a bento-grid layout with seamless wallet-based access.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-white/60 ml-3" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Find profiles... (e.g., deekshith)"
                    className="border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 flex-1"
                  />
                  <Button 
                    onClick={handleSearch}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
            
            <Button 
              onClick={() => setShowAuth(true)}
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
            >
              <Mail className="w-5 h-5 mr-2" />
              Sign Up with Email
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ToggleLeft className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Smart Toggle Mode</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Switch between Professional and Casual modes instantly
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Grid3x3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Modular Bento Grid</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Customizable cards that adapt to your preferences
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Secure Web3 Login</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Monad wallet or email authentication
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Aura Points System</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Earn rewards through QR referrals and connections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-white/70 text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Login with Monad or Email</h3>
              <p className="text-white/70 leading-relaxed">
                Connect securely using your Web3 wallet or traditional email authentication
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Customize your bento grid</h3>
              <p className="text-white/70 leading-relaxed">
                Add cards for your social links, portfolio, and switch between Professional and Casual modes
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Share your smart profile</h3>
              <p className="text-white/70 leading-relaxed">
                Get your unique metabento.io/username URL and connect with your network
              </p>
            </div>
          </div>
        </div>

        {/* Research-backed Stats */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Digital Identity Management Matters
            </h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Backed by industry research and addressing real user pain points in the digital age
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Database className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400 mb-2">150+</div>
                <div className="text-white text-sm mb-2">Online Accounts</div>
                <div className="text-white/60 text-xs">per internet user</div>
                <div className="text-white/40 text-xs mt-2 italic">Dashlane Password Manager Report, 2023</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-400 mb-2">41%</div>
                <div className="text-white text-sm mb-2">Multiple Personas</div>
                <div className="text-white/60 text-xs">professionals maintain</div>
                <div className="text-white/40 text-xs mt-2 italic">LinkedIn Professional Identity Study, 2022</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400 mb-2">70%</div>
                <div className="text-white text-sm mb-2">Prefer Decentralized</div>
                <div className="text-white/60 text-xs">identity systems (Gen Z)</div>
                <div className="text-white/40 text-xs mt-2 italic">World Economic Forum Digital Identity Report, 2023</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-400 mb-2">84%</div>
                <div className="text-white text-sm mb-2">Time Wasted</div>
                <div className="text-white/60 text-xs">managing profiles</div>
                <div className="text-white/40 text-xs mt-2 italic">Digital Identity Research Institute, 2023</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg border border-purple-300/20 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-4">The Problem MetaBento Solves</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="text-purple-300 font-semibold mb-2">Digital Fragmentation Crisis</h4>
                    <p className="text-white/70 text-sm">
                      Users struggle to manage 150+ accounts across platforms, leading to forgotten passwords,
                      security vulnerabilities, and inconsistent personal branding.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-2">Professional-Personal Split</h4>
                    <p className="text-white/70 text-sm">
                      41% of professionals need separate digital identities but lack tools to manage them efficiently,
                      leading to context collapse and privacy concerns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Users */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Profiles
            </h2>
            <p className="text-white/70 text-lg">
              Discover amazing Web3 professionals in our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredUsers.map((user, index) => (
              <Link key={index} to={`/${user.username}`}>
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
                        {user.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        <p className="text-white/70 text-sm">@{user.username}</p>
                      </div>
                    </div>

                    <p className="text-white/80 mb-4">{user.role}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold">
                          <Award className="w-4 h-4" />
                          {user.auraPoints}
                        </div>
                        <div className="text-white/60 text-xs">Aura Points</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
                          <Users className="w-4 h-4" />
                          {user.connections}
                        </div>
                        <div className="text-white/60 text-xs">Connections</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} className="bg-purple-500/20 text-purple-200 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-300/30 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <Star className="w-6 h-6 text-yellow-300" />
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tired of linktrees? Try MetaBento.
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                A smart profile for your split digital life. Professional today. Creator tomorrow. Switch in a click.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  Create Your Profile
                </Button>
                
                <div className="flex items-center gap-2 text-white/70">
                  <span className="text-sm">Connect with</span>
                  <div className="flex gap-1">
                    <Github className="w-4 h-4" />
                    <Twitter className="w-4 h-4" />
                    <Linkedin className="w-4 h-4" />
                    <Instagram className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">MetaBento</span>
              <Badge className="bg-purple-500/20 text-purple-200 text-xs">Beta</Badge>
            </div>
            
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <span>© 2024 MetaBento</span>
              <span>Built for the future of identity</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Connect to MetaBento</DialogTitle>
          </DialogHeader>
          <DualAuthModal onSuccess={() => setShowAuth(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
