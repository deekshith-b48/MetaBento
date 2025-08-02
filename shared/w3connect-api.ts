// Shared types for W3Connect API

export interface UserProfile {
  walletAddress: string;
  displayName: string;
  interests: string;
  portfolioUrl: string;
  xp: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  walletAddress: string;
  displayName: string;
  interests: string;
  portfolioUrl: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: UserProfile;
}

export interface GetProfileResponse {
  profile: UserProfile;
}

export interface ConnectUserRequest {
  fromWallet: string;
  toWallet: string;
}

export interface ConnectUserResponse {
  success: boolean;
  message: string;
  xpAwarded: number;
}

export interface Connection {
  walletAddress: string;
  displayName: string;
  timestamp: string;
}

export interface GetConnectionsResponse {
  connections: Connection[];
}

export interface ApiError {
  error: string;
}
