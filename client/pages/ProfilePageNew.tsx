import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  QrCode, 
  Share, 
  Copy, 
  Check, 
  LogOut, 
  ArrowLeft,
  Zap,
  Users,
  Star,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Sparkles,
  Trophy,
  Eye,
  Scan,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DualAuthModal from '@/components/DualAuthModal';
import QRScannerEnhanced from '@/components/QRScannerEnhanced';
import APointsLeaderboard from '@/components/APointsLeaderboard';
import ProfileSetupWizard from '@/components/ProfileSetupWizard';
import {
  LinkedInCardModern as LinkedInCard,
  GitHubCardModern as GitHubCard,
  TwitterCardModern as TwitterCard,
  InstagramCardModern as InstagramCard,
  SpotifyCardModern as SpotifyCard,
  WalletCardModern as WalletCard,
  WebsiteCardModern as WebsiteCard,
  ENSCardModern as ENSCard,
  PortfolioCardModern as PortfolioCard
} from '@/components/ProfileCardModern';

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  walletAddress: string;
  ensName?: string;
  avatar?: string;
  auraPoints: number;
  totalConnections: number;
  links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    spotify?: string;
    website?: string;
    portfolio?: string;
  };
}

const mockProfile: UserProfile = {
  username: 'deekshith',
  displayName: 'Deekshith B',
  bio: 'Web3 Developer & Blockchain Enthusiast building the future of decentralized applications',
  walletAddress: '0x742d35Cc6473C4b0f4b9bC81C5E4D44E2C4F4B4e',
  ensName: 'deekshith.eth',
  auraPoints: 2840,
  totalConnections: 89,
  links: {
    linkedin: 'https://linkedin.com/in/deekshith',
    github: 'https://github.com/deekshith',
    twitter: 'https://x.com/deekshith',
    instagram: 'https://instagram.com/deekshith',
    spotify: 'https://open.spotify.com/user/deekshith',
    website: 'https://deekshith.dev',
    portfolio: 'https://portfolio.deekshith.dev'
  }
};

export default function ProfilePageNew() {
  const { user, logout: authLogout, isLoading } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isProfessionalMode, setIsProfessionalMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const currentUsername = username || 'deekshith';
  const isOwnProfile = user?.username === currentUsername;

  useEffect(() => {
    const mode = searchParams.get('mode');
    const savedMode = localStorage.getItem('metabento-default-mode');
    
    if (mode === 'casual') {
      setIsProfessionalMode(false);
    } else if (mode === 'professional') {
      setIsProfessionalMode(true);
    } else if (savedMode === 'casual') {
      setIsProfessionalMode(false);
    }
  }, [searchParams]);

  const toggleMode = (professional: boolean) => {
    setIsProfessionalMode(professional);
    const newParams = new URLSearchParams(searchParams);
    
    if (professional) {
      newParams.delete('mode');
      localStorage.setItem('metabento-default-mode', 'professional');
    } else {
      newParams.set('mode', 'casual');
      localStorage.setItem('metabento-default-mode', 'casual');
    }
    setSearchParams(newParams);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const professionalCards = [
    profile.links.linkedin && <LinkedInCard key="linkedin" value="@deekshith" href={profile.links.linkedin} />,
    profile.links.github && <GitHubCard key="github" value="@deekshith" href={profile.links.github} />,
    profile.links.portfolio && <PortfolioCard key="portfolio" value="View My Portfolio" href={profile.links.portfolio} />,
    <WalletCard key="wallet" value={formatAddress(profile.walletAddress)} />,
    profile.ensName && <ENSCard key="ens" value={profile.ensName} />,
    profile.links.website && <WebsiteCard key="website" value="Professional Website" href={profile.links.website} />
  ].filter(Boolean);

  const casualCards = [
    profile.links.instagram && <InstagramCard key="instagram" value="@deekshith" href={profile.links.instagram} />,
    profile.links.twitter && <TwitterCard key="twitter" value="@deekshith" href={profile.links.twitter} />,
    profile.links.spotify && <SpotifyCard key="spotify" value="My Music" href={profile.links.spotify} />,
    profile.links.website && <WebsiteCard key="website" value="Personal Blog" href={profile.links.website} />,
    <WalletCard key="wallet" value={formatAddress(profile.walletAddress)} />,
    profile.ensName && <ENSCard key="ens" value={profile.ensName} />
  ].filter(Boolean);

  const currentCards = isProfessionalMode ? professionalCards : casualCards;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Glass Orbs */}
        <div className="absolute top-32 right-1/4 w-4 h-4 bg-white/30 rounded-full blur-sm animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-6 h-6 bg-purple-300/40 rounded-full blur-sm animate-bounce delay-500"></div>
        <div className="absolute top-64 left-1/3 w-3 h-3 bg-blue-300/50 rounded-full blur-sm animate-bounce delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-white/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                MetaBento
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowScanner(true)}
                className="bg-green-500/20 backdrop-blur-sm border-green-300/30 text-green-200 hover:bg-green-500/30 transition-all duration-300"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
            )}

            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-lg border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-center text-white">Share Profile</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                  <div className="bg-white p-6 rounded-lg inline-block">
                    <QRCodeSVG 
                      value={window.location.href} 
                      size={200}
                      fgColor="#6D28D9"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{profile.displayName}</p>
                    <p className="text-xs text-white/60">metabento.io/{currentUsername}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyProfileLink}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Share className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>

            {user ? (
              <>
                {isOwnProfile && (
                  <>
                    <Link to="/token-swap">
                      <Button variant="outline" size="sm" className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-300/30 text-yellow-200 hover:bg-yellow-500/30 transition-all duration-300">
                        <Trophy className="w-4 h-4 mr-2" />
                        Token Swap
                      </Button>
                    </Link>
                    <Link to="/settings">
                      <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={authLogout}
                  className="bg-red-500/20 backdrop-blur-sm border-red-300/30 text-red-200 hover:bg-red-500/30 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLogin(true)}
                className="bg-green-500/20 backdrop-blur-sm border-green-300/30 text-green-200 hover:bg-green-500/30 transition-all duration-300"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        {/* Profile Header */}
        <div className="mb-16">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-2xl ring-2 ring-white/20">
                      {profile.displayName.charAt(0)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white/20 animate-pulse"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{profile.displayName}</h1>
                    <p className="text-purple-200/80 mb-3 text-sm sm:text-base">@{currentUsername}</p>
                    <p className="text-white/70 leading-relaxed text-sm sm:text-base max-w-2xl">{profile.bio}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto">
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-yellow-400 mb-1">
                      <Trophy className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-bold text-lg">{profile.auraPoints.toLocaleString()}</div>
                    </div>
                    <div className="text-white/60 text-xs">Aura Points</div>
                  </div>

                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-blue-400 mb-1">
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-bold text-lg">{profile.totalConnections}</div>
                    </div>
                    <div className="text-white/60 text-xs">Connections</div>
                  </div>

                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-purple-400 mb-1">
                      <Star className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-bold text-lg">#47</div>
                    </div>
                    <div className="text-white/60 text-xs">Rank</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center mb-16">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex items-center gap-6 px-8 py-4">
              <button
                onClick={() => toggleMode(true)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isProfessionalMode
                    ? 'bg-blue-500/20 text-white border border-blue-400/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Professional</span>
              </button>

              <div className="w-px h-6 bg-white/20"></div>

              <button
                onClick={() => toggleMode(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                  !isProfessionalMode
                    ? 'bg-pink-500/20 text-white border border-pink-400/30'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Casual</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Bento Grid */}
        <div className="mb-16">
          {/* Setup Prompt for Own Profile */}
          {isOwnProfile && currentCards.length === 0 && (
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-300/20 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Welcome to MetaBento!
                </h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  Let's set up your {isProfessionalMode ? 'professional' : 'casual'} profile by adding your social accounts and links.
                </p>
                <Button
                  onClick={() => setShowProfileSetup(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Setup Profile
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[140px] sm:auto-rows-[160px]">
            {currentCards.length > 0 ? currentCards : (
              // Show placeholder cards for non-owners or add account option for owners
              isOwnProfile ? (
                <Card
                  onClick={() => setShowProfileSetup(true)}
                  className="col-span-1 row-span-1 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-105 flex items-center justify-center group"
                >
                  <div className="text-center text-white/60 group-hover:text-white/80">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">Add Account</span>
                  </div>
                </Card>
              ) : (
                <div className="col-span-4 text-center py-16">
                  <div className="text-white/60 mb-4">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>This user hasn't set up their {isProfessionalMode ? 'professional' : 'casual'} profile yet.</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Mode Indicator */}
        <div className="flex justify-center mb-12">
          <Badge 
            className={`px-6 py-2 text-sm font-medium ${
              isProfessionalMode 
                ? 'bg-blue-500/20 text-blue-200 border-blue-300/30' 
                : 'bg-pink-500/20 text-pink-200 border-pink-300/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {isProfessionalMode ? (
                <><Star className="w-4 h-4" /> Professional Mode Active</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Casual Mode Active</>
              )}
            </div>
          </Badge>
        </div>

        {/* A-Points Leaderboard */}
        <APointsLeaderboard />
      </main>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Connect to MetaBento</DialogTitle>
          </DialogHeader>
          <DualAuthModal onSuccess={() => setShowLogin(false)} />
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRScannerEnhanced
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />

      {/* Profile Setup Wizard */}
      <ProfileSetupWizard
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        currentMode={isProfessionalMode ? 'professional' : 'casual'}
      />
    </div>
  );
}
