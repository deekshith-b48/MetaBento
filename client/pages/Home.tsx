import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Wallet, QrCode, Users, ArrowRight, Search } from 'lucide-react';
import WalletButton from '@/components/WalletButton';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Remove @ if user adds it
      const username = searchQuery.replace('@', '');
      window.location.href = `/${username}`;
    }
  };

  const featuredProfiles = [
    { username: 'deekshith', name: 'Deekshith B', bio: 'Web3 Developer' },
    { username: 'sarah', name: 'Sarah Chen', bio: 'DeFi Researcher' },
    { username: 'alex', name: 'Alex Rivera', bio: 'NFT Artist' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">MetaBento</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/settings">
                <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-white/10">
                  Create Profile
                </Button>
              </Link>
              <WalletButton />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full p-1">
              <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-full">
                <Globe className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
              Your Web3
              <br />
              Digital Identity
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create beautiful profile pages that showcase your professional and personal Web3 presence. Connect with the decentralized world.
            </p>

            {/* Search */}
            <div className="mb-16">
              <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-lg border-white/20 p-2">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search profiles... (e.g., deekshith)"
                    className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0"
                  />
                  <Button 
                    onClick={handleSearch}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
              
              <p className="text-sm text-gray-400 mt-3">
                Try: <button 
                  onClick={() => setSearchQuery('deekshith')} 
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  deekshith
                </button>, <button 
                  onClick={() => setSearchQuery('sarah')} 
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  sarah
                </button>, or <button 
                  onClick={() => setSearchQuery('alex')} 
                  className="text-purple-300 hover:text-purple-200 underline"
                >
                  alex
                </button>
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Bento Grid Profiles</h3>
                <p className="text-gray-300 text-sm">Beautiful card-based layouts that adapt to professional or casual modes</p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">QR Sharing</h3>
                <p className="text-gray-300 text-sm">Share your profile instantly with QR codes for seamless networking</p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 text-center hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Wallet Native</h3>
                <p className="text-gray-300 text-sm">Connect with your Web3 identity using any compatible wallet</p>
              </Card>
            </div>

            {/* Featured Profiles */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8">Featured Profiles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredProfiles.map((profile) => (
                  <Link key={profile.username} to={`/${profile.username}`}>
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {profile.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-purple-200">{profile.name}</h3>
                          <p className="text-sm text-gray-400">@{profile.username}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{profile.bio}</p>
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                          metabento.io/{profile.username}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-gray-300 mb-6">Create your Web3 profile and join the decentralized professional network</p>
              <Link to="/settings">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3">
                  Create Your Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 MetaBento. Built for the future of identity.</p>
        </footer>
      </div>
    </div>
  );
}
