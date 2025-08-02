import { ReactNode, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Check, Linkedin, Github, Twitter, Instagram, Music, Wallet, Globe, Tag, Briefcase } from 'lucide-react';

interface ProfileCardModernProps {
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

const colorSchemes = {
  linkedin: {
    bg: 'from-blue-50/5 to-blue-100/5',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    hover: 'hover:border-blue-400/40'
  },
  github: {
    bg: 'from-gray-50/5 to-gray-100/5',
    border: 'border-gray-500/20',
    icon: 'text-gray-300',
    hover: 'hover:border-gray-400/40'
  },
  twitter: {
    bg: 'from-sky-50/5 to-sky-100/5',
    border: 'border-sky-500/20',
    icon: 'text-sky-400',
    hover: 'hover:border-sky-400/40'
  },
  instagram: {
    bg: 'from-pink-50/5 to-purple-100/5',
    border: 'border-pink-500/20',
    icon: 'text-pink-400',
    hover: 'hover:border-pink-400/40'
  },
  spotify: {
    bg: 'from-green-50/5 to-green-100/5',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    hover: 'hover:border-green-400/40'
  },
  wallet: {
    bg: 'from-purple-50/5 to-purple-100/5',
    border: 'border-purple-500/20',
    icon: 'text-purple-400',
    hover: 'hover:border-purple-400/40'
  },
  website: {
    bg: 'from-orange-50/5 to-orange-100/5',
    border: 'border-orange-500/20',
    icon: 'text-orange-400',
    hover: 'hover:border-orange-400/40'
  },
  ens: {
    bg: 'from-indigo-50/5 to-indigo-100/5',
    border: 'border-indigo-500/20',
    icon: 'text-indigo-400',
    hover: 'hover:border-indigo-400/40'
  },
  portfolio: {
    bg: 'from-violet-50/5 to-violet-100/5',
    border: 'border-violet-500/20',
    icon: 'text-violet-400',
    hover: 'hover:border-violet-400/40'
  }
};

export default function ProfileCardModern({ 
  icon, 
  platform, 
  value, 
  href, 
  type, 
  size = 'sm', 
  color = 'wallet',
  copyable = false 
}: ProfileCardModernProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const scheme = colorSchemes[color as keyof typeof colorSchemes] || colorSchemes.wallet;

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
        relative overflow-hidden cursor-pointer group
        bg-white/5 backdrop-blur-xl border ${scheme.border} ${scheme.hover}
        transition-all duration-300 ease-out
        hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} opacity-50`} />
      
      {/* Modern glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30" />
      
      <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
        {/* Header with icon and type badge */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-3">
            <div className={`${scheme.icon} transition-all duration-300 group-hover:scale-110`}>
              {icon}
            </div>
            
            {(size === 'lg' || size === 'xl') && (
              <Badge
                variant="outline"
                className="text-xs border-white/20 bg-white/5 text-white/70 backdrop-blur-sm"
              >
                {type}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className={`flex gap-1 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="h-6 w-6 p-0 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border-0"
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
                className="h-6 w-6 p-0 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-auto">
          <h3 className="font-semibold text-white mb-1 text-sm sm:text-base tracking-tight">
            {platform}
          </h3>
          <p className={`text-white/60 group-hover:text-white/80 transition-colors leading-relaxed ${
            size === 'lg' || size === 'xl' ? 'text-sm' : 'text-xs'
          } ${size === 'sm' ? 'truncate' : ''}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Modern platform cards with clean styling
export const LinkedInCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Linkedin className="w-5 h-5" />}
    platform="LinkedIn"
    value={value}
    href={href}
    type="professional"
    color="linkedin"
    size="md"
  />
);

export const GitHubCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Github className="w-5 h-5" />}
    platform="GitHub"
    value={value}
    href={href}
    type="professional"
    color="github"
    size="md"
  />
);

export const TwitterCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Twitter className="w-5 h-5" />}
    platform="Twitter"
    value={value}
    href={href}
    type="both"
    color="twitter"
    size="sm"
  />
);

export const InstagramCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Instagram className="w-5 h-5" />}
    platform="Instagram"
    value={value}
    href={href}
    type="casual"
    color="instagram"
    size="sm"
  />
);

export const SpotifyCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Music className="w-5 h-5" />}
    platform="Spotify"
    value={value}
    href={href}
    type="casual"
    color="spotify"
    size="md"
  />
);

export const WalletCardModern = ({ value }: { value: string }) => (
  <ProfileCardModern
    icon={<Wallet className="w-5 h-5" />}
    platform="Wallet"
    value={value}
    type="professional"
    color="wallet"
    size="lg"
    copyable
  />
);

export const WebsiteCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Globe className="w-5 h-5" />}
    platform="Website"
    value={value}
    href={href}
    type="both"
    color="website"
    size="md"
  />
);

export const ENSCardModern = ({ value }: { value: string }) => (
  <ProfileCardModern
    icon={<Tag className="w-5 h-5" />}
    platform="ENS"
    value={value}
    type="professional"
    color="ens"
    size="sm"
  />
);

export const PortfolioCardModern = ({ value, href }: { value: string; href: string }) => (
  <ProfileCardModern
    icon={<Briefcase className="w-5 h-5" />}
    platform="Portfolio"
    value={value}
    href={href}
    type="professional"
    color="portfolio"
    size="md"
  />
);
