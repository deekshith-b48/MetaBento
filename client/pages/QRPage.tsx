import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Share, 
  Users, 
  Zap, 
  Globe,
  Sparkles
} from 'lucide-react';

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  aPoints: number;
  totalConnections: number;
  avatar: string;
}

const mockProfile: UserProfile = {
  username: 'deekshith',
  displayName: 'Deekshith B',
  bio: 'Web3 Developer & Blockchain Enthusiast',
  aPoints: 2840,
  totalConnections: 89,
  avatar: 'DB'
};

export default function QRPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [copied, setCopied] = useState(false);
  const currentUsername = username || 'deekshith';
  const profileUrl = `${window.location.origin}/${currentUsername}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 400;
      canvas.height = 400;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, 400, 400);
        const link = document.createElement('a');
        link.download = `metabento-${currentUsername}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

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
      <nav className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/${currentUsername}`}>
              <Button variant="ghost" className="text-white hover:text-purple-300 hover:bg-white/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                MetaBento
              </span>
            </div>
          </div>

          <Badge className="bg-purple-500/20 text-purple-200 border-purple-300/30">
            QR Code
          </Badge>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm">Share & Connect</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Share Your Profile
            </span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Let others scan your QR code to instantly connect and earn A-Points together
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* QR Code Section */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-white rounded-2xl p-8 mb-6 inline-block shadow-xl" id="qr-code">
                  <QRCodeSVG 
                    value={profileUrl}
                    size={280}
                    fgColor="#6D28D9"
                    bgColor="#FFFFFF"
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Scan to Connect</h3>
                    <p className="text-white/70 text-sm">
                      Others can scan this QR code to visit your profile and connect instantly
                    </p>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={copyLink}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>

                    <Button
                      onClick={downloadQR}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Preview */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative overflow-hidden">
            {/* Glass Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>
            
            <CardContent className="p-8 relative z-10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl mb-6">
                  {profile.avatar}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{profile.displayName}</h2>
                <p className="text-purple-200 mb-4">@{currentUsername}</p>
                <p className="text-white/70 mb-6 leading-relaxed">{profile.bio}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-lg mb-1">
                      <Zap className="w-5 h-5" />
                      {profile.aPoints}
                    </div>
                    <div className="text-white/60 text-sm">A-Points</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 font-bold text-lg mb-1">
                      <Users className="w-5 h-5" />
                      {profile.totalConnections}
                    </div>
                    <div className="text-white/60 text-sm">Connections</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to={`/${currentUsername}`}>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300">
                      View Full Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-300/20 backdrop-blur-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">How to Use Your QR Code</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">1. Share</h4>
                  <p className="text-white/70">Download or share your QR code at networking events</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">2. Connect</h4>
                  <p className="text-white/70">Others scan to visit your profile and connect instantly</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">3. Earn</h4>
                  <p className="text-white/70">Both users earn A-Points for each new connection</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
