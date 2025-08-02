# MetaBento 🌟

**A unified digital identity platform for Web3 professionals and creators**

MetaBento is a modern, intelligent profile management system that allows users to seamlessly switch between their professional and casual digital identities using a customizable bento-grid layout. Built with Web3-first authentication and powered by an innovative Aura Points reward system.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://metabento.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🚀 Key Features

### 🎭 **Smart Identity Toggle**
- **Professional Mode**: LinkedIn, GitHub, portfolio, and work-focused profiles
- **Casual Mode**: Instagram, Spotify, personal projects, and social profiles
- **Instant Switch**: Toggle between personas with a single click

### 🧩 **Modular Bento Grid**
- **Responsive Layout**: CSS Grid-based bento layout with Tailwind utilities
- **Glassmorphism UI**: Semi-transparent cards with backdrop blur effects (`bg-white/20 backdrop-blur-lg`)
- **Dynamic Sizing**: Cards in sm (1x1), md (2x1), lg (2x2), and xl (4x2) configurations
- **Interactive Effects**: Hover animations, smooth transitions, and mode-based filtering
- **Mobile Optimized**: Responsive breakpoints with touch-friendly interactions

### 🔐 **Web3-First Authentication**
- **Monad Wallet Integration**: Primary authentication via wallet signature using Wagmi + RainbowKit
- **MetaMask & WalletConnect**: Support for injected wallets and WalletConnect protocol
- **Email Backup**: Supabase Auth UI for traditional email/password authentication
- **One Wallet Per User**: Enforced linking with wallet switching capabilities
- **Signature Verification**: Cryptographic nonce-based authentication flow

### ⚡ **Aura Points Gamification**
- **QR Code Integration**: React QR Code library for profile sharing and connections
- **Real-time Updates**: WebSocket/polling for instant XP updates and notifications
- **Achievement System**: Unlock milestones for networking activities with bonus rewards
- **Leaderboards**: Community competition with ranking system
- **Token Economy**: Exchange Aura Points for Monad blockchain tokens (100:1 ratio)

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Frosted glass effects with `backdrop-filter: blur(10px)` and subtle transparency
- **Three.js Backgrounds**: Interactive 3D animated particle systems and geometric patterns
- **Dark/Light Themes**: Tailwind's `dark:` variant system with localStorage persistence
- **Radix UI Primitives**: Accessible components with keyboard navigation and screen reader support
- **Responsive Breakpoints**: Mobile-first design with `sm:`, `md:`, `lg:` Tailwind responsive utilities

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **React Router 6** (SPA mode)
- **TailwindCSS 3** for styling
- **Three.js** for 3D backgrounds
- **Radix UI** for accessible components

### **Backend**
- **Express.js** server
- **Supabase** for database and authentication
- **JWT** for session management
- **Zod** for schema validation

### **Web3 Integration**
- **Wagmi** for wallet connections
- **RainbowKit** for wallet UI
- **Ethers.js** for signature verification
- **Monad** blockchain support

### **Development Tools**
- **TypeScript** throughout with strict type checking
- **Vitest** for unit and integration testing
- **ESLint & Prettier** for code quality and formatting
- **Path aliases** (`@/`, `@shared/`) for clean imports
- **Hot Module Replacement** with Vite for instant feedback
- **Pre-commit Hooks** with Husky for code quality enforcement

### **Responsive Design**
- **Mobile-First Approach**: Designed primarily for mobile with desktop enhancements
- **Breakpoint System**: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px` with Tailwind
- **Touch Interactions**: Swipe gestures, touch-friendly buttons, and haptic feedback
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Optimization**: Lazy loading, code splitting, and image optimization

---

## 🏗️ Project Structure

```
├── client/                   # React SPA frontend
│   ├── components/
│   │   ├── ui/              # Radix UI component library
│   │   ├── ProfileCardModern.tsx
│   │   ├── APointsLeaderboard.tsx
│   │   ├── DualAuthModal.tsx
│   │   └── QRScanner.tsx
│   ├── pages/               # Route components
│   │   ├── LandingPage.tsx  # Marketing homepage
│   │   ├── ProfilePageNew.tsx
│   │   ├── Settings.tsx
│   │   └── TokenSwap.tsx
│   ├── contexts/            # React contexts
│   └── hooks/               # Custom React hooks
├── server/                  # Express API backend
│   ├── index.ts            # Server configuration
│   └── routes/             # API route handlers
│       ├── auth.ts         # Authentication endpoints
│       ├── profile.ts      # Profile management
│       ├── aurapoints.ts   # Aura Points system
│       └── apoints.ts      # Legacy points system
├── database/               # Database schemas
│   ├── schema.sql          # Main database schema
│   └── aura_points_schema.sql
├── shared/                 # Shared TypeScript types
└── public/                 # Static assets
```

---

## ⚙️ Technical Implementation

### **Wallet Integration**
```typescript
// Wagmi configuration with Monad support
import { createConfig, http } from 'wagmi'
import { injected, walletConnect, metaMask } from 'wagmi/connectors'

const config = createConfig({
  chains: [monad],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask()
  ],
  transports: {
    [monad.id]: http()
  }
})

// Wrapped in WagmiProvider for global wallet state
<WagmiProvider config={config}>
  <AuthProvider>
    <App />
  </AuthProvider>
</WagmiProvider>
```

### **Dynamic Routing System**
```typescript
// React Router 6 dynamic username routes
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/:username" element={<ProfilePage />} />
  <Route path="/qr/:username" element={<QRPage />} />
  <Route path="*" element={<NotFound />} />
</Routes>

// Profile data fetching
const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetchProfile(username).then(setProfile);
  }, [username]);
};
```

### **Glassmorphism Card Styling**
```css
/* Core glassmorphism effects */
.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* Tailwind implementation */
.card {
  @apply bg-white/10 backdrop-blur-lg border border-white/20 
         shadow-2xl hover:bg-white/15 hover:scale-105 
         transition-all duration-300;
}
```

### **Bento Grid Layout**
```typescript
// Card size configurations
const sizeClasses = {
  sm: 'col-span-1 row-span-1',    // 1x1
  md: 'col-span-2 row-span-1',    // 2x1  
  lg: 'col-span-2 row-span-2',    // 2x2
  xl: 'col-span-4 row-span-2'     // 4x2
};

// Responsive grid container
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                gap-4 auto-rows-[120px]">
  {cards.map(card => (
    <ProfileCard key={card.id} size={card.size} {...card} />
  ))}
</div>
```

### **QR Code Integration**
```typescript
// QR code generation and scanning
import QRCode from 'react-qr-code';

const ProfileQRCode = ({ username }) => (
  <div className="bg-white p-4 rounded-lg">
    <QRCode 
      value={`https://metabento.io/${username}`}
      size={200}
      level="M"
    />
  </div>
);

// QR Scanner component using react-qr-scanner
const QRScanner = ({ onScan }) => (
  <QrScanner
    onDecode={(result) => onScan(result)}
    onError={(error) => console.error(error)}
    constraints={{
      facingMode: 'environment'
    }}
  />
);
```

### **Authentication Flow**
```typescript
// Wallet signature authentication
const handleWalletLogin = async () => {
  const address = await connect();
  const nonce = await generateNonce(address);
  const signature = await signMessage(nonce);
  
  const session = await fetch('/api/auth/wallet-login', {
    method: 'POST',
    body: JSON.stringify({ address, signature, nonce })
  });
  
  setUser(session.user);
};

// Supabase email authentication fallback
const EmailAuth = () => (
  <Auth
    supabaseClient={supabase}
    appearance={{
      theme: ThemeSupa,
      variables: { default: { colors: { brand: '#8b5cf6' } } }
    }}
    providers={[]}
    redirectTo={`${window.location.origin}/auth/callback`}
  />
);
```

### **State Management**
```typescript
// Zustand store for global state
interface AppState {
  user: User | null;
  mode: 'professional' | 'casual';
  theme: 'light' | 'dark';
  auraPoints: number;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  mode: 'professional',
  theme: 'dark',
  auraPoints: 0,
  
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => set({ theme }),
  updateAuraPoints: (points) => set((state) => ({ 
    auraPoints: state.auraPoints + points 
  }))
}));
```

---

## 🚦 Quick Start

### Prerequisites
- **Node.js 16+** and npm
- **Supabase account** (free tier available)
- **Web3 wallet** (MetaMask recommended)

### 1. Clone and Install
```bash
git clone https://github.com/your-org/metabento
cd metabento
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schemas in your Supabase SQL Editor:
   - Execute `database/schema.sql`
   - Execute `database/aura_points_schema.sql`

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:8080` to see your MetaBento instance! 🎉

---

## 📱 User Journey

### 1. **Landing Experience**
- Modern, animated landing page with Three.js background
- Search existing profiles or create your own
- Research-backed statistics on digital identity fragmentation

### 2. **Authentication**
- **Connect Wallet**: Monad-compatible wallets (MetaMask, etc.)
- **Sign Message**: Secure cryptographic signature for login
- **Email Backup**: Optional traditional authentication

### 3. **Profile Creation**
- **Onboarding Wizard**: Multi-step form with profile setup, mode selection, and social links
- **Username Selection**: Unique handle validation for your profile URL (`metabento.io/username`)
- **Mode Selection**: Default to Professional or Casual with toggle functionality
- **Social Integration**: Connect LinkedIn, GitHub, Twitter, Instagram, Spotify, and custom links
- **Avatar & Banner**: Upload profile images with image optimization and CDN storage

### 4. **Bento Grid Customization**
- **Visual Editor**: Real-time drag-and-drop interface for card arrangement
- **Card Library**: 15+ pre-built card types (social, portfolio, contact, etc.)
- **Size Variants**: Small (1x1), Medium (2x1), Large (2x2), Extra Large (4x2)
- **Custom Content**: Add projects, skills, achievements, and personal links
- **Mode Filtering**: Cards automatically show/hide based on Professional/Casual mode

### 5. **Networking & Rewards**
- **QR Code Generation**: Share your unique profile QR code
- **Scan & Connect**: Use QR scanner to connect with others
- **Earn Aura Points**: Get rewarded for genuine networking
- **Achievements**: Unlock milestones and bonus points

### 6. **Token Economy**
- **Swap Points**: Exchange Aura Points for Monad tokens
- **Leaderboards**: Compete with the community
- **Transaction History**: Track all your point activities

---

## 🎯 Advanced Features

### **Theme System**
```typescript
// Dark mode implementation with Tailwind
const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const preferred = saved || 'dark';
    setTheme(preferred);
    document.documentElement.classList.toggle('dark', preferred === 'dark');
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };
};

// Dark mode styles with Tailwind
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <div className="bg-white/10 dark:bg-black/20 backdrop-blur-lg">
    {/* Glassmorphism cards adapt to theme */}
  </div>
</div>
```

### **One Wallet Per User Enforcement**
```typescript
// Wallet connection state management
const WalletManager = () => {
  const { user } = useAuth();
  const { connect, disconnect } = useAccount();
  
  const hasLinkedWallet = user?.wallet_address;
  
  return (
    <div>
      {!hasLinkedWallet ? (
        <Button onClick={connect}>Connect Wallet</Button>
      ) : (
        <div>
          <p>Linked: {user.wallet_address}</p>
          <Button variant="outline" onClick={showSwitchModal}>
            Switch Wallet
          </Button>
        </div>
      )}
    </div>
  );
};
```

### **Real-time XP Updates**
```typescript
// WebSocket connection for live updates
const useRealtimeAuraPoints = (userId: string) => {
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    const channel = supabase
      .channel('aura_points')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'aura_point_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setPoints(prev => prev + payload.new.points);
          showNotification(`+${payload.new.points} Aura Points!`);
        }
      )
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, [userId]);
  
  return points;
};
```

### **Progressive Web App Features**
```typescript
// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW registered'))
    .catch(() => console.log('SW registration failed'));
}

// Manifest.json for PWA installation
{
  "name": "MetaBento",
  "short_name": "MetaBento",
  "theme_color": "#8b5cf6",
  "background_color": "#0f0f23",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 Core Features Deep Dive

### Professional vs Casual Modes

**Professional Mode Cards:**
- LinkedIn profile with work experience
- GitHub repositories and contributions
- Portfolio website and projects
- Professional headshot and bio
- Work-related achievements

**Casual Mode Cards:**
- Instagram photos and stories
- Spotify music preferences
- Personal interests and hobbies
- Casual profile picture
- Social connections and activities

### Aura Points System

**Earning Points:**
- **QR Connections**: 15 points per unique connection
- **Daily Login**: 5 points for consistent engagement
- **Profile Completion**: 25 points for comprehensive profiles
- **Achievements**: Bonus points for milestones

**Spending Points:**
- **Token Swaps**: 100 points = 1 Monad token
- **Premium Features**: Enhanced customization options
- **Profile Boosts**: Increased visibility in discovery

### Security & Privacy

**Data Protection:**
- **Row Level Security**: Database-level access controls with Supabase RLS policies
- **Encrypted Sessions**: JWT-based session management with secure token rotation
- **Wallet Verification**: Cryptographic proof of ownership via message signing
- **Privacy Controls**: Granular visibility settings for profile elements
- **GDPR Compliance**: Data export, deletion, and consent management

**Authentication Security:**
- **Nonce-based Signatures**: Prevents replay attacks with time-limited nonces
- **Multi-factor Support**: Wallet + email verification for enhanced security
- **Session Management**: Automatic cleanup of expired sessions and tokens
- **Rate Limiting**: API endpoint protection against abuse and DDoS

---

## 🔧 API Reference

### Authentication Endpoints
```typescript
POST /api/auth/nonce              # Generate signing nonce
POST /api/auth/wallet-login       # Wallet signature login
POST /api/auth/email-signup       # Email registration
POST /api/auth/email-login        # Email login
POST /api/auth/verify-session     # Validate session token
POST /api/auth/logout             # End session
```

### Profile Management
```typescript
GET  /api/getProfile/:wallet      # Get user profile
POST /api/updateProfile           # Update profile data
POST /api/connectUser             # Create user connection
GET  /api/getConnections/:wallet  # Get user connections
```

### Aura Points System
```typescript
POST /api/aurapoints/qr-connection    # Process QR scan
POST /api/aurapoints/user-points      # Get user points
GET  /api/aurapoints/leaderboard      # Get top users
POST /api/aurapoints/swap-tokens      # Exchange points for tokens
POST /api/aurapoints/swap-history     # Get swap transactions
```

---

## 🌍 Deployment

### Netlify (Recommended)
```bash
npm run build:client
# Deploy dist/spa folder to Netlify
# Functions deploy automatically from netlify/functions/
```

### Manual Server Deployment
```bash
npm run build
npm start
# Runs on port 8080 by default
```

### Environment Variables for Production
```env
NODE_ENV=production
SUPABASE_URL=your-production-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
JWT_SECRET=your-production-jwt-secret
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m "Add amazing feature"`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

---

## 📊 Research & Validation

MetaBento addresses real pain points identified through industry research:

- **150+ Online Accounts**: Average internet user manages 150+ accounts (Dashlane, 2023)
- **41% Multiple Personas**: Professionals maintain separate digital identities (LinkedIn Study, 2022)
- **70% Prefer Decentralized**: Gen Z prefers decentralized identity systems (World Economic Forum, 2023)
- **84% Time Wasted**: Users waste significant time managing profiles (Digital Identity Research Institute, 2023)

---

## 🔮 Roadmap

### Phase 1: Core Platform ✅
- [x] Wallet authentication
- [x] Bento grid customization
- [x] Professional/Casual modes
- [x] Aura Points system
- [x] QR code networking

### Phase 2: Enhanced Features 🚧
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team/organization profiles
- [ ] Integration marketplace
- [ ] AI-powered recommendations

### Phase 3: Ecosystem Growth 📋
- [ ] Developer API platform
- [ ] White-label solutions
- [ ] Enterprise features
- [ ] Multi-blockchain support
- [ ] NFT profile integration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💫 Community

- **Website**: [metabento.io](https://metabento.io)
- **Discord**: [Join our community](https://discord.gg/metabento)
- **Twitter**: [@MetaBento](https://twitter.com/MetaBento)
- **GitHub**: [Star our repo](https://github.com/your-org/metabento)

---

**Built with ❤️ for the future of digital identity**

*MetaBento is more than a profile platform—it's a solution to the digital identity fragmentation crisis affecting millions of professionals and creators worldwide.*
