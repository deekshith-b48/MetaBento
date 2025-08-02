# W3Connect Authentication Setup Guide

## 🎯 Complete Monad Wallet Authentication System

This guide will help you set up the complete authentication and authorization system for W3Connect using Monad wallet login with Supabase backend.

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js & npm**: Ensure you have Node.js 16+ installed
3. **Web3 Wallet**: MetaMask or any Web3 wallet for testing

## 🚀 Setup Steps

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization and set project details
4. Wait for the project to be ready (2-3 minutes)

### 2. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database/schema.sql` and run it
4. This creates all necessary tables, indexes, and RLS policies

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Get your Supabase credentials:
   - **Project URL**: Found in Settings > API
   - **Anon Key**: Found in Settings > API (public key)
   - **Service Role Key**: Found in Settings > API (secret key)

```bash
# Copy example file
cp .env.example .env

# Edit with your values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

## 🔐 Authentication Flow

### Primary: Wallet Signature Login

1. **Connect Wallet**: User connects MetaMask/Web3 wallet
2. **Generate Nonce**: Server generates unique nonce for signature
3. **Sign Message**: User signs authentication message
4. **Verify Signature**: Server verifies signature and creates session
5. **Session Token**: User receives session token for future requests

### Secondary: Password Login (Optional)

1. **Set Password**: After wallet login, user can optionally set password
2. **Password Login**: User can login with wallet address + password
3. **Same Session**: Creates same type of session as wallet login

## 📊 Database Schema

### Users Table
- `id` - UUID primary key
- `wallet_address` - Unique wallet address (required)
- `password_hash` - Optional password hash
- `username` - Optional unique username
- `display_name` - Display name
- `bio` - User bio
- `ens_name` - ENS domain
- `is_public` - Profile visibility
- `default_mode` - Professional/Casual default

### User Profiles Table
- `user_id` - Foreign key to users
- `platform` - Social media platform
- `url` - Profile URL
- `profile_type` - Professional/Casual/Both

### Auth Tables
- `auth_nonces` - Temporary nonces for signature verification
- `auth_sessions` - Active user sessions

## 🛡️ Security Features

### Row Level Security (RLS)
- Users can only see public profiles or their own data
- Session tokens are tied to specific users
- Automatic cleanup of expired tokens and nonces

### Password Security
- Bcrypt hashing with salt rounds (12)
- Minimum 8 character password requirement
- Optional password-based login as backup

### Wallet Security
- Signature verification using ethers.js
- Nonce-based replay attack prevention
- 10-minute nonce expiration
- Message signing prevents unauthorized access

### Session Management
- 30-day session expiration
- Automatic cleanup of expired sessions
- JWT tokens for additional security layer
- Secure session storage

## 🎮 Usage Examples

### Frontend Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    return <WalletLogin onSuccess={() => console.log('Logged in!')} />;
  }
  
  return (
    <div>
      <p>Welcome, {user.display_name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Backend API Usage

```typescript
// Generate nonce for signature
POST /api/auth/nonce
{
  "walletAddress": "0x..."
}

// Login with wallet signature
POST /api/auth/wallet-login
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "nonce": "abc123"
}

// Optional password login
POST /api/auth/password-login
{
  "walletAddress": "0x...",
  "password": "userpassword"
}
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/nonce` | POST | Generate nonce for wallet signature |
| `/api/auth/wallet-login` | POST | Login with wallet signature |
| `/api/auth/password-login` | POST | Login with wallet + password |
| `/api/auth/set-password` | POST | Set optional password for wallet |
| `/api/auth/verify-session` | POST | Verify session token validity |
| `/api/auth/logout` | POST | Logout and invalidate session |

## 🚨 Error Handling

The system includes comprehensive error handling for:
- Invalid wallet addresses
- Expired or invalid nonces
- Invalid signatures
- Database connection issues
- Session expiration
- Network failures

## 📱 User Experience Flow

1. **Visit App** → See profile page with login option
2. **Click Login** → Modal opens with wallet connect option
3. **Connect Wallet** → MetaMask/Web3 wallet connection
4. **Sign Message** → Secure signature for authentication
5. **Access Granted** → Full app functionality unlocked
6. **Optional Password** → Set backup login method
7. **Persistent Session** → Stay logged in for 30 days

## 🎯 Features Implemented

- ✅ Monad wallet signature authentication
- ✅ Optional password-based backup login
- ✅ Supabase database integration
- ✅ Row Level Security (RLS)
- ✅ Session management with automatic cleanup
- ✅ Protected routes and authorization
- ✅ User profile management
- ✅ Professional/Casual mode settings
- ✅ Real-time session verification
- ✅ Secure password hashing
- ✅ Comprehensive error handling
- ✅ TypeScript type safety

## 🔮 Next Steps

1. **Test Authentication**: Try wallet login flow
2. **Add Social Links**: Configure professional/casual profiles
3. **Set Password**: Optional backup authentication
4. **Deploy**: Set up production Supabase instance
5. **Monitor**: Check Supabase logs and analytics

The authentication system is now fully functional and production-ready! 🎉
