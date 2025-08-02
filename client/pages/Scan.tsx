import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Upload, Construction } from 'lucide-react';

export default function Scan() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-web3-900 via-purple-900 to-web3-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/profile">
            <Button variant="ghost" className="text-white hover:text-web3-300 hover:bg-white/10 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-web3-200 bg-clip-text text-transparent mb-2">
              Scan & Connect
            </h1>
            <p className="text-white/70">
              Scan QR codes to connect with other Web3 professionals
            </p>
          </div>
        </div>

        {/* Placeholder Content */}
        <Card className="bg-card/90 backdrop-blur-lg border border-web3-300/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Construction className="w-5 h-5 text-web3-500" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-web3-500/20 to-web3-600/20 rounded-full flex items-center justify-center border-2 border-dashed border-web3-300">
                <Camera className="w-12 h-12 text-web3-300" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">QR Scanner Feature</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This feature will allow you to scan QR codes from other users' profiles to instantly connect and earn XP together.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled
              >
                <Camera className="w-4 h-4 mr-2" />
                📷 Scan with Camera
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                disabled
              >
                <Upload className="w-4 h-4 mr-2" />
                📁 Upload QR Image
              </Button>
            </div>

            <div className="bg-web3-500/10 rounded-lg p-4 border border-web3-300/20">
              <h4 className="font-medium text-foreground mb-2">Planned Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-sm mx-auto">
                <li>• Real-time camera QR scanning</li>
                <li>• Upload QR code images</li>
                <li>• Instant connection verification</li>
                <li>• XP rewards for mutual connections</li>
                <li>• Duplicate connection prevention</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Continue prompting to have this page built out with full functionality!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
