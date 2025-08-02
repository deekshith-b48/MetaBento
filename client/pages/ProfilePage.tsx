import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, QrCode, Share, Copy, Check, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DualAuthModal from '@/components/DualAuthModal';
import QRScanner from '@/components/QRScanner';
import APointsLeaderboard from '@/components/APointsLeaderboard';
import { 
  LinkedInCard, 
  GitHubCard, 
  TwitterCard, 
  InstagramCard, 
  SpotifyCard, 
  WalletCard, 
  WebsiteCard, 
  ENSCard, 
  PortfolioCard 
} from '@/components/ProfileCard';

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  walletAddress: string;
  ensName?: string;
  avatar?: string;
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

// Mock profile data - in production this would come from API/blockchain
const mockProfile: UserProfile = {
  username: 'deekshith',
  displayName: 'Deekshith B',
  bio: 'Web3 Developer & Blockchain Enthusiast',
  walletAddress: '0x742d35Cc6473C4b0f4b9bC81C5E4D44E2C4F4B4e',
  ensName: 'deekshith.eth',
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

export default function ProfilePage() {
  const { user, logout: authLogout, isLoading } = useAuth();
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isProfessionalMode, setIsProfessionalMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Use default username if none provided (for root route)
  const currentUsername = username || 'deekshith';

  // Initialize mode from URL params or localStorage
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

  // Update URL when mode changes and save preference
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
    const url = window.location.href;
    navigator.clipboard.writeText(url);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {profile.displayName.charAt(0)}
            </div>
            
            {/* Profile Info */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{profile.displayName}</h1>
              <p className="text-purple-200 mb-1">@{currentUsername}</p>
              <p className="text-gray-300 text-sm max-w-md">{profile.bio}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScanner(true)}
                className="bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30"
              >
                📷 Scan & Connect
              </Button>
            )}

            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Share Profile</DialogTitle>
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
                    <p className="text-sm font-medium">{profile.displayName}</p>
                    <p className="text-xs text-muted-foreground">metabento.io/{currentUsername}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={copyProfileLink}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Share className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>

            {user ? (
              <>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={authLogout}
                  className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
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
                className="bg-green-500/20 border-green-500/30 text-green-200 hover:bg-green-500/30"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-1">
            <div className="flex items-center gap-3 px-4 py-2">
              <span className={`text-sm font-medium transition-colors ${
                isProfessionalMode ? 'text-white' : 'text-white/60'
              }`}>
                Professional
              </span>
              <Switch
                checked={!isProfessionalMode}
                onCheckedChange={(checked) => toggleMode(!checked)}
                className="data-[state=checked]:bg-pink-500"
              />
              <span className={`text-sm font-medium transition-colors ${
                !isProfessionalMode ? 'text-white' : 'text-white/60'
              }`}>
                Casual
              </span>
            </div>
          </Card>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-4 gap-4 auto-rows-[120px]">
          {currentCards}
        </div>

        {/* Mode Indicator */}
        <div className="flex justify-center mt-8">
          <Badge
            variant="secondary"
            className={`${
              isProfessionalMode
                ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                : 'bg-pink-500/20 text-pink-200 border-pink-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {isProfessionalMode ? (
                <><Star className="w-4 h-4" /> Professional Mode</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Casual Mode</>
              )}
            </div>
          </Badge>
        </div>

        {/* A-Points & Leaderboard Section */}
        <div className="mt-12">
          <APointsLeaderboard />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/60">
          <p className="text-sm">
            Powered by <span className="text-purple-300 font-semibold">MetaBento</span>
          </p>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md bg-transparent border-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Connect to MetaBento</DialogTitle>
          </DialogHeader>
          <DualAuthModal
            onSuccess={() => setShowLogin(false)}
          />
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
}
