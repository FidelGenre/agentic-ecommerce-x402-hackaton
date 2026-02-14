/**
 * Web3Provider - Global Blockchain Context 🌐
 * 
 * Configures Wagmi, Viem, and RainbowKit for the application.
 * 
 * Key Features:
 * - SKALE BITE V2 Integration: Connects to the specific SKALE Sidechain (BITE Sandbox).
 * - RainbowKit: Provides the "Connect Wallet" UI.
 * - Transport Optimizations: Custom polling interval for faster SKALE finality feedback.
 */
'use client'

import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
    RainbowKitProvider,
    darkTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit'
import {
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    okxWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { skaleBiteSandbox } from '@/config/chains'
import { createConfig, http } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// 🔌 Connectors: Define which wallets are available
// We prioritize Coinbase Wallet for the "Smart Wallet" track.
const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                coinbaseWallet, // Support for Coinbase Smart Wallet (Passkeys)
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
            ],
        },
    ],
    {
        appName: 'Agent Shop',
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    }
)

// ⚙️ Wagmi Config
const config = createConfig({
    connectors,
    chains: [skaleBiteSandbox], // Only allow BITE V2 Chain
    transports: {
        [skaleBiteSandbox.id]: http(process.env.NEXT_PUBLIC_SKALE_RPC_URL || 'https://base-sepolia-testnet.skalenodes.com/v1/bite-v2-sandbox', {
            batch: true, // Batch JSON-RPC requests for performance
        }),
    },
    pollingInterval: 250, // ⚡ Ultra-fast polling (250ms) for instant UX on SKALE
    ssr: true, // Server-Side Rendering compatibility
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#7b3fe4', // SKALE Purple
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                    modalSize="compact" // Minimalist UI
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
