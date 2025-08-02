import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Wallet, User, Link as LinkIcon, Eye, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import WalletButton from '@/components/WalletButton';

interface ProfileSettings {
  username: string;
  displayName: string;
  bio: string;
  walletAddress: string;
  ensName: string;
  avatar?: string;
  isPublic: boolean;
  defaultMode: 'professional' | 'casual';
  links: {
    linkedin: string;
    github: string;
    twitter: string;
    instagram: string;
    spotify: string;
    website: string;
    portfolio: string;
  };
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState<ProfileSettings>({
    username: user?.username || 'deekshith',
    displayName: user?.display_name || 'Deekshith B',
    bio: user?.bio || 'Web3 Developer & Blockchain Enthusiast',
    walletAddress: user?.wallet_address || '0x742d35Cc6473C4b0f4b9bC81C5E4D44E2C4F4B4e',
    ensName: user?.ens_name || 'deekshith.eth',
    isPublic: user?.is_public ?? true,
    defaultMode: user?.default_mode || 'professional',
    links: {
      linkedin: 'https://linkedin.com/in/deekshith',
      github: 'https://github.com/deekshith',
      twitter: 'https://x.com/deekshith',
      instagram: 'https://instagram.com/deekshith',
      spotify: 'https://open.spotify.com/user/deekshith',
      website: 'https://deekshith.dev',
      portfolio: 'https://portfolio.deekshith.dev'
    }
  });

  // Update settings when user data changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        username: user.username || prev.username,
        displayName: user.display_name || prev.displayName,
        bio: user.bio || prev.bio,
        walletAddress: user.wallet_address,
        ensName: user.ens_name || prev.ensName,
        isPublic: user.is_public,
        defaultMode: user.default_mode,
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user profile via auth context
      await updateUser({
        username: settings.username,
        display_name: settings.displayName,
        bio: settings.bio,
        ens_name: settings.ensName,
        is_public: settings.isPublic,
        default_mode: settings.defaultMode,
      });

      // Save to localStorage for demo (links)
      localStorage.setItem('metabento-profile-links', JSON.stringify(settings.links));

      navigate('/');
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Wallet connection is now handled by RainbowKit

  const updateLinks = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-purple-200">Customize your MetaBento profile</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="your-username"
                    />
                    <p className="text-xs text-purple-200 mt-1">metabento.io/{settings.username}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="displayName" className="text-white">Display Name</Label>
                    <Input
                      id="displayName"
                      value={settings.displayName}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Your Display Name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white resize-none"
                    rows={3}
                    placeholder="Tell the world about yourself..."
                  />
                </div>

                <div>
                  <Label htmlFor="ensName" className="text-white">ENS Name</Label>
                  <Input
                    id="ensName"
                    value={settings.ensName}
                    onChange={(e) => setSettings(prev => ({ ...prev, ensName: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="your-name.eth"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Links */}
            <Card className="bg-blue-500/10 backdrop-blur-lg border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5" /> Professional Links
                </CardTitle>
                <p className="text-blue-200 text-sm">These links appear in Professional Mode</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">LinkedIn</Label>
                    <Input
                      value={settings.links.linkedin}
                      onChange={(e) => updateLinks('linkedin', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://linkedin.com/in/you"
                    />
                  </div>

                  <div>
                    <Label className="text-white">GitHub</Label>
                    <Input
                      value={settings.links.github}
                      onChange={(e) => updateLinks('github', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://github.com/you"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Professional Website</Label>
                    <Input
                      value={settings.links.website}
                      onChange={(e) => updateLinks('website', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://yoursite.com"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Portfolio</Label>
                    <Input
                      value={settings.links.portfolio}
                      onChange={(e) => updateLinks('portfolio', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://portfolio.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Casual Links */}
            <Card className="bg-pink-500/10 backdrop-blur-lg border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Casual Links
                </CardTitle>
                <p className="text-pink-200 text-sm">These links appear in Casual Mode</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Twitter/X</Label>
                    <Input
                      value={settings.links.twitter}
                      onChange={(e) => updateLinks('twitter', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://x.com/you"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Instagram</Label>
                    <Input
                      value={settings.links.instagram}
                      onChange={(e) => updateLinks('instagram', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://instagram.com/you"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Spotify</Label>
                  <Input
                    value={settings.links.spotify}
                    onChange={(e) => updateLinks('spotify', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="https://open.spotify.com/user/you"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                      Connected
                    </Badge>
                    <p className="text-xs text-white font-mono break-all">
                      {user.wallet_address}
                    </p>
                    <p className="text-xs text-gray-400">
                      Connected since: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white text-sm mb-4">No wallet connected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.isPublic ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                    <span className="text-white text-sm">Public Profile</span>
                  </div>
                  <Switch
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isPublic: checked }))}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <Separator className="bg-white/20" />

                <div>
                  <Label className="text-white text-sm">Default Mode</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={settings.defaultMode === 'professional' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, defaultMode: 'professional' }))}
                      className={settings.defaultMode === 'professional' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }
                    >
                      <Star className="w-4 h-4 mr-2" /> Professional
                    </Button>
                    <Button
                      variant={settings.defaultMode === 'casual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, defaultMode: 'casual' }))}
                      className={settings.defaultMode === 'casual' 
                        ? 'bg-pink-500 hover:bg-pink-600' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Casual
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Profile
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
