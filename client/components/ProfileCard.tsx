import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Check, Linkedin, Github, Twitter, Instagram, Music, Wallet, Globe, Tag, Briefcase, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProfileCardProps {
  icon: ReactNode;
  platform: string;
  value: string;
  href?: string;
  type: 'professional' | 'casual' | 'both';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  copyable?: boolean;
}

const sizeClasses = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-2 row-span-1', 
  lg: 'col-span-2 row-span-2',
  xl: 'col-span-4 row-span-2'
};

const colorClasses = {
  linkedin: 'from-blue-500/10 to-blue-600/10 border-blue-500/20',
  github: 'from-gray-500/10 to-gray-600/10 border-gray-500/20',
  twitter: 'from-sky-500/10 to-sky-600/10 border-sky-500/20',
  instagram: 'from-pink-500/10 to-purple-600/10 border-pink-500/20',
  spotify: 'from-green-500/10 to-green-600/10 border-green-500/20',
  wallet: 'from-web3-500/10 to-web3-600/10 border-web3-500/20',
  website: 'from-orange-500/10 to-orange-600/10 border-orange-500/20',
  ens: 'from-purple-500/10 to-purple-600/10 border-purple-500/20',
  portfolio: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20'
};

export default function ProfileCard({ 
  icon, 
  platform, 
  value, 
  href, 
  type, 
  size = 'sm', 
  color = 'wallet',
  copyable = false 
}: ProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    if (href) {
      window.open(href, '_blank');
    }
  };

  return (
    <Card
      className={`
        ${sizeClasses[size]}
        bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-purple-500/25
        transition-all duration-500 cursor-pointer group hover:scale-[1.05] hover:rotate-1
        relative overflow-hidden
      `}
      onClick={handleClick}
    >
      {/* Enhanced Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-60"></div>

      {/* Floating Orbs */}
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full blur-sm group-hover:animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-purple-300/30 rounded-full blur-sm group-hover:animate-pulse delay-300"></div>
      
      <div className="relative p-6 h-full flex flex-col justify-between z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <Badge
              variant="secondary"
              className="text-xs bg-white/20 text-white/80 border-white/30 backdrop-blur-sm"
            >
              {type}
            </Badge>
          </div>

          <div className="flex gap-2">
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            )}

            {href && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-end">
          <h3 className="font-bold text-white mb-2 text-lg group-hover:text-white transition-colors">
            {platform}
          </h3>
          <p className={`text-white/80 truncate leading-relaxed group-hover:text-white transition-colors ${
            size === 'lg' || size === 'xl' ? 'text-base' : 'text-sm'
          }`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Specific platform cards with predefined styling
export const LinkedInCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Linkedin className="w-6 h-6" />}
    platform="LinkedIn"
    value={value}
    href={href}
    type="professional"
    color="linkedin"
    size="md"
  />
);

export const GitHubCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Github className="w-6 h-6" />}
    platform="GitHub"
    value={value}
    href={href}
    type="professional"
    color="github"
    size="md"
  />
);

export const TwitterCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Twitter className="w-6 h-6" />}
    platform="Twitter"
    value={value}
    href={href}
    type="both"
    color="twitter"
    size="sm"
  />
);

export const InstagramCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Instagram className="w-6 h-6" />}
    platform="Instagram"
    value={value}
    href={href}
    type="casual"
    color="instagram"
    size="sm"
  />
);

export const SpotifyCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Music className="w-6 h-6" />}
    platform="Spotify"
    value={value}
    href={href}
    type="casual"
    color="spotify"
    size="md"
  />
);

export const WalletCard = ({ value }: { value: string }) => (
  <ProfileCard
    icon={<Wallet className="w-6 h-6" />}
    platform="Wallet"
    value={value}
    type="professional"
    color="wallet"
    size="lg"
    copyable
  />
);

export const WebsiteCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Globe className="w-6 h-6" />}
    platform="Website"
    value={value}
    href={href}
    type="both"
    color="website"
    size="md"
  />
);

export const ENSCard = ({ value }: { value: string }) => (
  <ProfileCard
    icon={<Tag className="w-6 h-6" />}
    platform="ENS"
    value={value}
    type="professional"
    color="ens"
    size="sm"
  />
);

export const PortfolioCard = ({ value, href }: { value: string; href: string }) => (
  <ProfileCard
    icon={<Briefcase className="w-6 h-6" />}
    platform="Portfolio"
    value={value}
    href={href}
    type="professional"
    color="portfolio"
    size="xl"
  />
);
