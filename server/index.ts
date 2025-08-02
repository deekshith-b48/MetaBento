import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { updateProfile, getProfile, connectUser, getConnections } from "./routes/profile";
import { createConnection, getUserStats, getLeaderboard, getUserConnections, awardPoints } from "./routes/apoints";
import {
  processQRConnection,
  getUserPoints,
  getLeaderboard as getAuraLeaderboard,
  swapPointsForTokens,
  getSwapHistory
} from "./routes/aurapoints";
import {
  generateAuthNonce,
  walletLogin,
  passwordLogin,
  setPassword,
  verifySession,
  logout,
  emailSignup,
  emailLogin,
  walletSignup,
  checkWallet
} from "./routes/auth";
// Enhanced Backend Routes
import {
  getUserCards,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
  getCardTemplates,
  getPopularCards
} from "./routes/cards";
import {
  getUserByUsername,
  getUserSettings,
  updateUserSettings,
  updateUserProfile,
  completeOnboarding,
  toggleProfileMode,
  getProfileCompletion
} from "./routes/enhanced-profile";
import {
  processQRConnection as enhancedQRConnection,
  getUserXPInfo,
  getXPLeaderboard,
  awardXP,
  getUserConnections as enhancedConnections,
  getQRScanHistory,
  checkInToEvent,
  getUserAchievements
} from "./routes/enhanced-xp";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication API routes
  app.post("/api/auth/nonce", generateAuthNonce);
  app.post("/api/auth/wallet-login", walletLogin);
  app.post("/api/auth/password-login", passwordLogin);
  app.post("/api/auth/set-password", setPassword);
  app.post("/api/auth/verify-session", verifySession);
  app.post("/api/auth/logout", logout);
  app.post("/api/auth/email-signup", emailSignup);
  app.post("/api/auth/email-login", emailLogin);
  app.post("/api/auth/wallet-signup", walletSignup);
  app.post("/api/auth/check-wallet", checkWallet);

  // W3Connect Profile API routes
  app.post("/api/updateProfile", updateProfile);
  app.get("/api/getProfile/:wallet", getProfile);
  app.post("/api/connectUser", connectUser);
  app.get("/api/getConnections/:wallet", getConnections);

  // A-Points and Connections API routes (Legacy)
  app.post("/api/apoints/connect", createConnection);
  app.get("/api/apoints/stats/:userId", getUserStats);
  app.get("/api/apoints/leaderboard", getLeaderboard);
  app.get("/api/apoints/connections/:userId", getUserConnections);
  app.post("/api/apoints/award", awardPoints);

  // Aura Points System API routes
  app.post("/api/aurapoints/qr-connection", processQRConnection);
  app.post("/api/aurapoints/user-points", getUserPoints);
  app.get("/api/aurapoints/leaderboard", getAuraLeaderboard);
  app.post("/api/aurapoints/swap-tokens", swapPointsForTokens);
  app.post("/api/aurapoints/swap-history", getSwapHistory);

  // Enhanced Profile Cards API routes
  app.get("/api/cards/:userId", getUserCards);
  app.post("/api/cards/create", createCard);
  app.put("/api/cards/update", updateCard);
  app.delete("/api/cards/:cardId", deleteCard);
  app.post("/api/cards/reorder", reorderCards);
  app.get("/api/cards/templates", getCardTemplates);
  app.get("/api/cards/popular", getPopularCards);

  // Enhanced Profile Management API routes
  app.get("/api/profile/username/:username", getUserByUsername);
  app.get("/api/profile/settings/:userId", getUserSettings);
  app.put("/api/profile/settings", updateUserSettings);
  app.put("/api/profile/update", updateUserProfile);
  app.post("/api/profile/complete-onboarding", completeOnboarding);
  app.post("/api/profile/toggle-mode", toggleProfileMode);
  app.get("/api/profile/completion/:userId", getProfileCompletion);

  // Enhanced XP and Gamification API routes
  app.post("/api/xp/qr-connection", enhancedQRConnection);
  app.get("/api/xp/user/:userId", getUserXPInfo);
  app.get("/api/xp/leaderboard", getXPLeaderboard);
  app.post("/api/xp/award", awardXP);
  app.get("/api/xp/connections/:userId", enhancedConnections);
  app.get("/api/xp/scan-history/:userId", getQRScanHistory);
  app.post("/api/xp/event-checkin", checkInToEvent);
  app.get("/api/xp/achievements/:userId", getUserAchievements);

  return app;
}
