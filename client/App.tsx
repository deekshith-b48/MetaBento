import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WalletProvider from "./providers/WalletProvider";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePageNew";
import QRPage from "./pages/QRPage";
import Settings from "./pages/Settings";
import TokenSwap from "./pages/TokenSwap";
import NotFound from "./pages/NotFound";

const App = () => (
  <WalletProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/token-swap" element={<TokenSwap />} />
            <Route path="/qr/:username" element={<QRPage />} />
            <Route path="/:username" element={<ProfilePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </WalletProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
