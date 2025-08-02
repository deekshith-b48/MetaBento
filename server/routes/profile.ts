import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

// Simple JSON file-based storage (in production, use proper database)
const dataDir = path.join(process.cwd(), "data");
const profilesFile = path.join(dataDir, "profiles.json");
const connectionsFile = path.join(dataDir, "connections.json");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface UserProfile {
  walletAddress: string;
  displayName: string;
  interests: string;
  portfolioUrl: string;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

interface Connection {
  from: string;
  to: string;
  timestamp: string;
}

// Helper functions
const readProfiles = (): Record<string, UserProfile> => {
  try {
    if (fs.existsSync(profilesFile)) {
      return JSON.parse(fs.readFileSync(profilesFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading profiles:', error);
  }
  return {};
};

const writeProfiles = (profiles: Record<string, UserProfile>) => {
  fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
};

const readConnections = (): Connection[] => {
  try {
    if (fs.existsSync(connectionsFile)) {
      return JSON.parse(fs.readFileSync(connectionsFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading connections:', error);
  }
  return [];
};

const writeConnections = (connections: Connection[]) => {
  fs.writeFileSync(connectionsFile, JSON.stringify(connections, null, 2));
};

// Update or create profile
export const updateProfile: RequestHandler = (req, res) => {
  try {
    const { walletAddress, displayName, interests, portfolioUrl } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const profiles = readProfiles();
    const existingProfile = profiles[walletAddress];
    
    const profile: UserProfile = {
      walletAddress,
      displayName: displayName || '',
      interests: interests || '',
      portfolioUrl: portfolioUrl || '',
      xp: existingProfile?.xp || 150, // Keep existing XP or start with 150
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    profiles[walletAddress] = profile;
    writeProfiles(profiles);

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get profile by wallet address
export const getProfile: RequestHandler = (req, res) => {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const profiles = readProfiles();
    const profile = profiles[wallet];

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Connect two users
export const connectUser: RequestHandler = (req, res) => {
  try {
    const { fromWallet, toWallet } = req.body;

    if (!fromWallet || !toWallet) {
      return res.status(400).json({ error: 'Both wallet addresses are required' });
    }

    if (fromWallet === toWallet) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    const connections = readConnections();
    const profiles = readProfiles();

    // Check if connection already exists
    const existingConnection = connections.find(
      conn => (conn.from === fromWallet && conn.to === toWallet) ||
               (conn.from === toWallet && conn.to === fromWallet)
    );

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    // Create bidirectional connections
    const timestamp = new Date().toISOString();
    connections.push(
      { from: fromWallet, to: toWallet, timestamp },
      { from: toWallet, to: fromWallet, timestamp }
    );

    // Award XP to both users
    const xpReward = 10;
    if (profiles[fromWallet]) {
      profiles[fromWallet].xp += xpReward;
    }
    if (profiles[toWallet]) {
      profiles[toWallet].xp += xpReward;
    }

    writeConnections(connections);
    writeProfiles(profiles);

    res.json({ 
      success: true, 
      message: `Connection established! Both users earned ${xpReward} XP`,
      xpAwarded: xpReward
    });
  } catch (error) {
    console.error('Error connecting users:', error);
    res.status(500).json({ error: 'Failed to connect users' });
  }
};

// Get connections for a wallet
export const getConnections: RequestHandler = (req, res) => {
  try {
    const { wallet } = req.params;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const connections = readConnections();
    const profiles = readProfiles();

    // Get all connections for this wallet
    const userConnections = connections
      .filter(conn => conn.from === wallet)
      .map(conn => {
        const connectedProfile = profiles[conn.to];
        return {
          walletAddress: conn.to,
          displayName: connectedProfile?.displayName || 'Anonymous User',
          timestamp: conn.timestamp
        };
      });

    res.json({ connections: userConnections });
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
};
