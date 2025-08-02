import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Linkedin, 
  Github, 
  Twitter, 
  Instagram, 
  Music, 
  Globe, 
  Plus, 
  Check, 
  Star, 
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SocialAccount {
  platform: string;
  username: string;
  url: string;
  type: 'professional' | 'casual' | 'both';
  icon: React.ReactNode;
  placeholder: string;
  baseUrl: string;
}

const socialPlatforms: SocialAccount[] = [
  {
    platform: 'LinkedIn',
    username: '',
    url: '',
    type: 'professional',
    icon: <Linkedin className="w-5 h-5" />,
    placeholder: 'your-linkedin-username',
    baseUrl: 'https://linkedin.com/in/'
  },
  {
    platform: 'GitHub',
    username: '',
    url: '',
    type: 'professional',
    icon: <Github className="w-5 h-5" />,
    placeholder: 'your-github-username',
    baseUrl: 'https://github.com/'
  },
  {
    platform: 'Twitter',
    username: '',
    url: '',
    type: 'both',
    icon: <Twitter className="w-5 h-5" />,
    placeholder: 'your-twitter-handle',
    baseUrl: 'https://twitter.com/'
  },
  {
    platform: 'Instagram',
    username: '',
    url: '',
    type: 'casual',
    icon: <Instagram className="w-5 h-5" />,
    placeholder: 'your-instagram-handle',
    baseUrl: 'https://instagram.com/'
  },
  {
    platform: 'Spotify',
    username: '',
    url: '',
    type: 'casual',
    icon: <Music className="w-5 h-5" />,
    placeholder: 'your-spotify-username',
    baseUrl: 'https://open.spotify.com/user/'
  },
  {
    platform: 'Website',
    username: '',
    url: '',
    type: 'both',
    icon: <Globe className="w-5 h-5" />,
    placeholder: 'https://your-website.com',
    baseUrl: ''
  }
];

interface ProfileSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'professional' | 'casual';
}

export default function ProfileSetupWizard({ isOpen, onClose, currentMode }: ProfileSetupWizardProps) {
  const { user, sessionToken } = useAuth();
  const [step, setStep] = useState<'intro' | 'accounts' | 'complete'>('intro');
  const [accounts, setAccounts] = useState<SocialAccount[]>(socialPlatforms);
  const [currentAccount, setCurrentAccount] = useState<SocialAccount | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedAccounts, setCompletedAccounts] = useState<string[]>([]);

  // Filter accounts based on current mode
  const filteredAccounts = accounts.filter(account => 
    account.type === currentMode || account.type === 'both'
  );

  const handleAccountSelect = (account: SocialAccount) => {
    setCurrentAccount(account);
    setInputValue('');
  };

  const handleAccountSave = async () => {
    if (!currentAccount || !inputValue.trim() || !user || !sessionToken) return;

    setIsLoading(true);
    
    try {
      // Construct full URL
      let fullUrl = inputValue.trim();
      if (currentAccount.platform !== 'Website' && !fullUrl.startsWith('http')) {
        fullUrl = currentAccount.baseUrl + fullUrl.replace('@', '');
      }

      // In a real implementation, save to backend
      const response = await fetch('/api/profile/add-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          platform: currentAccount.platform.toLowerCase(),
          username: inputValue.trim().replace('@', ''),
          url: fullUrl,
          sessionToken
        })
      });

      if (response.ok) {
        // Update local state
        setAccounts(prev => prev.map(acc => 
          acc.platform === currentAccount.platform 
            ? { ...acc, username: inputValue.trim(), url: fullUrl }
            : acc
        ));
        
        setCompletedAccounts(prev => [...prev, currentAccount.platform]);
        setCurrentAccount(null);
        setInputValue('');
        
        toast.success(`${currentAccount.platform} account added successfully!`);
      } else {
        throw new Error('Failed to save account');
      }
    } catch (error) {
      console.error('Failed to save account:', error);
      toast.error('Failed to save account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAccount = () => {
    setCurrentAccount(null);
    setInputValue('');
  };

  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentMode === 'professional' ? (
              <><Star className="w-5 h-5 text-blue-400" /> Professional Profile Setup</>
            ) : (
              <><Sparkles className="w-5 h-5 text-pink-400" /> Casual Profile Setup</>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'intro' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Let's set up your {currentMode} profile
              </h3>
              <p className="text-white/70 text-sm">
                Add your social accounts to showcase your {currentMode} identity.
                You can always add more later or switch between modes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredAccounts.map((account) => (
                <div key={account.platform} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-white/70">{account.icon}</div>
                  <span className="text-white/70 text-sm">{account.platform}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep('accounts')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Adding Accounts
            </Button>
          </div>
        )}

        {step === 'accounts' && !currentAccount && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                Choose an account to add
              </h3>
              <p className="text-white/70 text-sm">
                Select a platform to connect your {currentMode} account
              </p>
            </div>

            <div className="space-y-3">
              {filteredAccounts.map((account) => (
                <button
                  key={account.platform}
                  onClick={() => handleAccountSelect(account)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white">{account.icon}</div>
                    <span className="text-white font-medium">{account.platform}</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-white/20 bg-white/5 text-white/70"
                    >
                      {account.type}
                    </Badge>
                  </div>
                  {completedAccounts.includes(account.platform) ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Plus className="w-5 h-5 text-white/40" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('complete')}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Skip for now
              </Button>
              {completedAccounts.length > 0 && (
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'accounts' && currentAccount && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                {currentAccount.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Add your {currentAccount.platform} account
              </h3>
            </div>

            <div>
              <Label htmlFor="account-input" className="text-white">
                {currentAccount.platform === 'Website' ? 'Website URL' : 'Username'}
              </Label>
              <div className="mt-2">
                {currentAccount.platform !== 'Website' && (
                  <div className="text-white/60 text-sm mb-2">
                    {currentAccount.baseUrl}
                  </div>
                )}
                <Input
                  id="account-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentAccount.placeholder}
                  className="bg-white/10 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAccountSave()}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSkipAccount}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button
                onClick={handleAccountSave}
                disabled={!inputValue.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? 'Saving...' : 'Save Account'}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Profile setup complete!
              </h3>
              <p className="text-white/70 text-sm">
                Your {currentMode} profile has been set up. You can add more accounts anytime from your settings.
              </p>
            </div>
            <div className="text-center text-white/60 text-sm">
              {completedAccounts.length > 0 && (
                <p>Added {completedAccounts.length} account{completedAccounts.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
