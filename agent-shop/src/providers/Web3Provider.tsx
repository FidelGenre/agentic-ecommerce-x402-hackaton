'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { coinbaseWallet, metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets'
import { baseSepolia } from 'viem/chains'
import { skaleBiteSandbox } from '@/config/chains'
import { createConfig, http } from 'wagmi'

const queryClient = new QueryClient()

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                coinbaseWallet,
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet
            ],
        },
    ],
    {
        appName: 'Agent Shop',
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    }
);

export const config = createConfig({
    connectors,
    chains: [skaleBiteSandbox, baseSepolia], // Add Base Sepolia for initial connection stability
    transports: {
        [skaleBiteSandbox.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox'),
        [baseSepolia.id]: http(),
    },
    ssr: true,
})

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#2563eb', // Blue-600 to match Coinbase
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                    modalSize="compact"
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
