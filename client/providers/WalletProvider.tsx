import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for React Query
const queryClient = new QueryClient();

// Monad chain configuration (placeholder - update with actual Monad chain details)
const monadChain = {
  id: 34443, // Monad testnet chain ID (update with actual)
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'], // Update with actual Monad RPC
    },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://scan.monad.xyz' },
  },
} as const;

// Wagmi configuration with Monad support
const wagmiConfig = createConfig({
  chains: [monadChain, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
    }),
  ],
  transports: {
    [monadChain.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// RainbowKit configuration
const rainbowConfig = getDefaultConfig({
  appName: 'MetaBento',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
  chains: [monadChain, mainnet, sepolia],
  ssr: false, // If using Next.js, set to true
});

interface WalletProviderProps {
  children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme="dark" coolMode>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
