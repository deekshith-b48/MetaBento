import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, 
  Star, 
  QrCode, 
  Save, 
  Copy, 
  Check, 
  ArrowLeft, 
  Eye, 
  Users,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  walletAddress: string;
  displayName: string;
  interests: string;
  portfolioUrl: string;
  xp: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    walletAddress: '',
    displayName: '',
    interests: '',
    portfolioUrl: '',
    xp: 150
  });
  const [isNetworkingMode, setIsNetworkingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      navigate('/');
      return;
    }
    
    setProfile(prev => ({
      ...prev,
      walletAddress,
      displayName: localStorage.getItem('displayName') || '',
      interests: localStorage.getItem('interests') || '',
      portfolioUrl: localStorage.getItem('portfolioUrl') || '',
      xp: parseInt(localStorage.getItem('xp') || '150')
    }));
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, send to backend)
      localStorage.setItem('displayName', profile.displayName);
      localStorage.setItem('interests', profile.interests);
      localStorage.setItem('portfolioUrl', profile.portfolioUrl);
      localStorage.setItem('xp', profile.xp.toString());
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Address copied to clipboard');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-web3-900 via-purple-900 to-web3-800 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-web3-300 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm">{isNetworkingMode ? 'Networking' : 'Professional'}</span>
              <Switch
                checked={isNetworkingMode}
                onCheckedChange={setIsNetworkingMode}
                className="data-[state=checked]:bg-web3-500"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-web3-200 bg-clip-text text-transparent mb-2">
            Your W3 Profile
          </h1>
          <p className="text-white/70">
            {isNetworkingMode ? 'Quick networking view for events' : 'Complete professional profile'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {isNetworkingMode ? (
          // Networking Mode - Minimal View
          <Card className="bg-card/90 backdrop-blur-lg border border-web3-300/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-web3-500 to-web3-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {profile.displayName || 'Anonymous User'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <span className="text-sm font-mono">{formatAddress(profile.walletAddress)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-web3-500/10 to-web3-600/10 rounded-lg p-6">
                  <QRCodeSVG
                    value={profile.walletAddress}
                    size={200}
                    className="mx-auto"
                    fgColor="#6D28D9"
                    bgColor="transparent"
                  />
                  <p className="text-sm text-muted-foreground mt-4">
                    Scan to connect with me
                  </p>
                </div>

                <Badge variant="secondary" className="bg-web3-500/20 text-web3-200 border-web3-500/30">
                  <Zap className="w-4 h-4 mr-1" />
                  {profile.xp} XP
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Professional Mode - Full Profile
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card className="bg-card/90 backdrop-blur-lg border border-web3-300/20 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="wallet" className="text-foreground">Wallet Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="wallet"
                        value={profile.walletAddress}
                        disabled
                        className="font-mono text-sm bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        className="px-3"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your display name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="interests" className="text-foreground">Interests</Label>
                    <Input
                      id="interests"
                      value={profile.interests}
                      onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
                      placeholder="DeFi, NFTs, Smart Contracts, etc."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate interests with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="portfolio" className="text-foreground">Portfolio URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="portfolio"
                        value={profile.portfolioUrl}
                        onChange={(e) => setProfile(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        placeholder="https://your-portfolio.com"
                        type="url"
                      />
                      {profile.portfolioUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(profile.portfolioUrl, '_blank')}
                          className="px-3"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-web3-500 to-web3-600 hover:from-web3-600 hover:to-web3-700 text-white"
                  >
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        💾 Save Profile
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats & Actions Sidebar */}
            <div className="space-y-6">
              {/* XP Card */}
              <Card className="bg-gradient-to-br from-web3-500/10 to-web3-600/10 border border-web3-300/20 backdrop-blur-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-web3-500 to-web3-600 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">⭐ XP: {profile.xp}</h3>
                  <p className="text-muted-foreground text-sm">Network Reputation</p>
                  <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-web3-500 to-web3-600 h-full transition-all duration-500"
                      style={{ width: `${Math.min((profile.xp / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {1000 - profile.xp} XP to next level
                  </p>
                </CardContent>
              </Card>

              {/* QR Code Card */}
              <Card className="bg-card/90 backdrop-blur-lg border border-web3-300/20">
                <CardContent className="p-6">
                  <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <QrCode className="w-4 h-4 mr-2" />
                        📲 Show QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-center">Connect with Me</DialogTitle>
                      </DialogHeader>
                      <div className="text-center space-y-4">
                        <div className="bg-white p-6 rounded-lg inline-block">
                          <QRCodeSVG
                            value={profile.walletAddress}
                            size={200}
                            fgColor="#6D28D9"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{profile.displayName || 'Anonymous User'}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(profile.walletAddress)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={copyAddress}
                          className="w-full"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Address
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Link to="/scan" className="block mt-3">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      📷 Scan & Connect
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card/90 backdrop-blur-lg border border-web3-300/20">
                <CardContent className="p-6">
                  <h3 className="font-medium text-foreground mb-4">Network Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Connections</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Profile Views</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">This Month</span>
                      <span className="font-medium text-web3-500">+8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
